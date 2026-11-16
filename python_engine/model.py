import re
import stanza
from typing import Dict, Any, List, Optional

# Global cache for the loaded Stanza pipeline to avoid reloading on each request
_PIPELINE = None

def get_pipeline():
    global _PIPELINE
    if _PIPELINE is None:
        print("[Stanza Engine] Initializing Stanford Stanza English neural pipeline...")
        _PIPELINE = stanza.Pipeline(
            lang="en",
            processors="tokenize,pos,lemma,ner,depparse,sentiment,constituency",
            verbose=False,
            download_method=None
        )
        print("[Stanza Engine] Stanza pipeline loaded and ready.")
    return _PIPELINE

# Map OntoNotes/Stanza NER tags to CoreNLP tags
NER_MAP = {
    "PERSON": "PERSON",
    "ORG": "ORGANIZATION",
    "GPE": "LOCATION",
    "LOC": "LOCATION",
    "DATE": "DATE",
    "TIME": "TIME",
    "MONEY": "MONEY",
    "PERCENT": "PERCENT",
    "QUANTITY": "NUMBER",
    "CARDINAL": "NUMBER",
    "ORDINAL": "NUMBER",
    "NORP": "NATIONALITY",
    "FAC": "LOCATION",
    "EVENT": "MISC",
    "PRODUCT": "MISC",
    "WORK_OF_ART": "MISC",
    "LAW": "MISC",
    "LANGUAGE": "MISC",
}

# Map 3-class sentiment from Stanza (0=Negative, 1=Neutral, 2=Positive) to 5-class CoreNLP
SENTIMENT_MAP = {
    0: ("Negative", "1", [0.10, 0.65, 0.15, 0.08, 0.02]),
    1: ("Neutral", "2", [0.03, 0.12, 0.70, 0.12, 0.03]),
    2: ("Positive", "3", [0.02, 0.08, 0.15, 0.65, 0.10]),
}

def extract_openie_triplets(words: list) -> List[Dict[str, Any]]:
    """
    Extracts Subject-Predicate-Object triplets from the Universal Dependency graph.
    """
    triplets = []
    word_map = {w.id: w for w in words}

    # Find candidate predicates (verbs or root heads)
    for w in words:
        if w.upos in ["VERB", "AUX"] or w.deprel == "root":
            verb_id = w.id
            verb_text = w.text

            # Look for subjects connected to this verb
            subj_tokens = [child for child in words if child.head == verb_id and "subj" in child.deprel]
            # Look for objects or clausal complements
            obj_tokens = [child for child in words if child.head == verb_id and (child.deprel in ["obj", "iobj", "obl", "xcomp", "ccomp"] or "obj" in child.deprel)]

            for s in subj_tokens:
                # Gather subject phrase (compounds, determiners)
                s_phrase_ids = [s.id] + [c.id for c in words if c.head == s.id and c.deprel in ["compound", "flat", "det", "amod"]]
                s_phrase_ids.sort()
                subj_str = " ".join([word_map[i].text for i in s_phrase_ids if i in word_map])

                for o in obj_tokens:
                    # Gather object phrase
                    o_phrase_ids = [o.id] + [c.id for c in words if c.head == o.id and c.deprel in ["compound", "flat", "det", "amod", "case"]]
                    o_phrase_ids.sort()
                    obj_str = " ".join([word_map[i].text for i in o_phrase_ids if i in word_map])

                    if subj_str and obj_str and subj_str != obj_str:
                        triplets.append({
                            "subject": subj_str,
                            "relation": verb_text,
                            "object": obj_str
                        })

    return triplets

def build_coreference_chains(doc) -> Dict[str, List[Dict[str, Any]]]:
    """
    Heuristically extracts cross-sentence coreference clusters for pronouns & proper entities.
    """
    clusters: Dict[str, List[Dict[str, Any]]] = {}
    cluster_counter = 1

    entity_mentions = []
    pronoun_mentions = []

    for s_idx, sentence in enumerate(doc.sentences):
        # Collect proper nouns & entities
        for ent in sentence.ents:
            if ent.words:
                entity_mentions.append({
                    "text": ent.text,
                    "sentNum": s_idx + 1,
                    "type": ent.type,
                    "startIndex": ent.words[0].id,
                    "endIndex": ent.words[-1].id + 1,
                })

        # Collect personal pronouns
        for w in sentence.words:
            if w.xpos in ["PRP", "PRP$"] and w.text.lower() in ["he", "him", "his", "she", "her", "hers", "it", "its", "they", "them", "their"]:
                pronoun_mentions.append({
                    "text": w.text,
                    "sentNum": s_idx + 1,
                    "startIndex": w.id,
                    "endIndex": w.id + 1,
                    "gender": "MALE" if w.text.lower() in ["he", "him", "his"] else ("FEMALE" if w.text.lower() in ["she", "her", "hers"] else "UNKNOWN"),
                    "animacy": "ANIMATE" if w.text.lower() not in ["it", "its"] else "INANIMATE",
                    "number": "SINGULAR" if w.text.lower() not in ["they", "them", "their"] else "PLURAL"
                })

    # Link pronouns to preceding matching entities
    for ent in entity_mentions:
        matched = []
        is_person = ent.get("type") in ["PERSON", "NORP"]

        for pron in pronoun_mentions:
            if pron["sentNum"] >= ent["sentNum"]:
                if is_person and pron["gender"] in ["MALE", "FEMALE"]:
                    matched.append(pron)
                elif not is_person and pron["gender"] == "UNKNOWN":
                    matched.append(pron)

        if matched:
            c_id = str(cluster_counter)
            rep = {
                "id": 1,
                "text": ent["text"],
                "type": "PROPER",
                "number": "SINGULAR",
                "gender": "UNKNOWN",
                "animacy": "ANIMATE" if is_person else "INANIMATE",
                "startIndex": ent["startIndex"],
                "endIndex": ent["endIndex"],
                "headIndex": ent["startIndex"],
                "sentNum": ent["sentNum"],
                "position": [ent["sentNum"], 1],
                "isRepresentativeMention": True
            }

            mention_list = [rep]
            for m_idx, m in enumerate(matched, start=2):
                mention_list.append({
                    "id": m_idx,
                    "text": m["text"],
                    "type": "PRONOMINAL",
                    "number": m.get("number", "SINGULAR"),
                    "gender": m.get("gender", "UNKNOWN"),
                    "animacy": m.get("animacy", "ANIMATE"),
                    "startIndex": m["startIndex"],
                    "endIndex": m["endIndex"],
                    "headIndex": m["startIndex"],
                    "sentNum": m["sentNum"],
                    "position": [m["sentNum"], m_idx],
                    "isRepresentativeMention": False
                })

            clusters[c_id] = mention_list
            cluster_counter += 1

    return clusters

def analyze_text(text: str) -> Dict[str, Any]:
    """
    Analyzes input text using Stanza and outputs the exact Stanford CoreNLP JSON schema.
    """
    if not text or not text.strip():
        return {"sentences": [], "corefs": {}}

    nlp = get_pipeline()
    doc = nlp(text.strip())

    sentences_output = []

    for s_idx, sentence in enumerate(doc.sentences):
        # Build token-to-NER map
        token_ner_map = {}
        for ent in sentence.ents:
            mapped_type = NER_MAP.get(ent.type, ent.type)
            for w in ent.words:
                token_ner_map[w.id] = mapped_type

        # 1. Format Tokens
        tokens = []
        for word in sentence.words:
            ner_tag = token_ner_map.get(word.id, "O")
            char_begin = getattr(word, "start_char", getattr(word.parent, "start_char", None))
            char_end = getattr(word, "end_char", getattr(word.parent, "end_char", None))

            tokens.append({
                "index": word.id,
                "word": word.text,
                "originalText": word.text,
                "lemma": word.lemma or word.text,
                "pos": word.xpos or word.upos or "NN",
                "ner": ner_tag,
                "characterOffsetBegin": char_begin if char_begin is not None else 0,
                "characterOffsetEnd": char_end if char_end is not None else len(word.text)
            })

        # 2. Format Basic Universal Dependencies
        word_by_id = {w.id: w.text for w in sentence.words}
        word_by_id[0] = "ROOT"

        basic_dependencies = []
        for word in sentence.words:
            gov_id = word.head if word.head is not None else 0
            basic_dependencies.append({
                "dep": word.deprel or "dep",
                "governor": gov_id,
                "governorGloss": word_by_id.get(gov_id, "ROOT"),
                "dependent": word.id,
                "dependentGloss": word.text
            })

        # 3. Constituency Parse Tree S-expression
        parse_str = str(sentence.constituency) if hasattr(sentence, "constituency") and sentence.constituency else None

        # 4. Sentiment Analysis
        sentiment_code = sentence.sentiment if hasattr(sentence, "sentiment") and sentence.sentiment is not None else 1
        sent_label, sent_val, sent_dist = SENTIMENT_MAP.get(sentiment_code, ("Neutral", "2", [0.05, 0.15, 0.60, 0.15, 0.05]))

        # 5. Open Information Extraction
        openie_triplets = extract_openie_triplets(sentence.words)

        sentences_output.append({
            "index": s_idx,
            "line": s_idx + 1,
            "sentiment": sent_label,
            "sentimentValue": sent_val,
            "sentimentDistribution": sent_dist,
            "tokens": tokens,
            "basicDependencies": basic_dependencies,
            "enhancedDependencies": basic_dependencies,
            "parse": parse_str,
            "openie": openie_triplets,
            "kbp": openie_triplets
        })

    # 6. Coreference Resolution
    corefs_output = build_coreference_chains(doc)

    return {
        "sentences": sentences_output,
        "corefs": corefs_output
    }
