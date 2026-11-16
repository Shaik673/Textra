export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  text: string;
  recommendedAnnotators: string[];
}

export const SAMPLE_TEXTS: SamplePreset[] = [
  {
    id: "general",
    name: "General Overview (Fox & Obama)",
    description: "Ideal for testing POS tags, NER (Person, State), and Dependency Parse.",
    text: "The quick brown fox jumped over the lazy dog. Barack Obama was born in Hawaii.",
    recommendedAnnotators: ["pos", "lemma", "ner", "parse", "depparse"],
  },
  {
    id: "coref",
    name: "Coreference & Pronouns",
    description: "Tests cross-sentence entity references, gender, and pronoun resolution.",
    text: "Elon Musk founded SpaceX in California. He believed that humanity needs to become multiplanetary. His engineers designed the Starship rocket to achieve this goal.",
    recommendedAnnotators: ["pos", "ner", "coref", "openie"],
  },
  {
    id: "sentiment",
    name: "Multi-Sentence Sentiment",
    description: "Tests sentence-level positive, neutral, and negative sentiment distribution.",
    text: "The new processor offers extraordinary performance and blazingly fast graphics. However, the battery life is terrible and gets uncomfortably hot under load. Overall, it is an average purchase.",
    recommendedAnnotators: ["pos", "sentiment", "depparse"],
  },
  {
    id: "relations",
    name: "Open IE & Knowledge Extraction",
    description: "Extracts subject-predicate-object semantic relations and facts.",
    text: "Google developed the Android operating system for smartphones. DeepMind researchers in London created AlphaFold to predict protein structures.",
    recommendedAnnotators: ["ner", "openie", "kbp", "depparse"],
  },
  {
    id: "multilingual",
    name: "Complex Syntax & Phrases",
    description: "Tests constituency tree hierarchy and enhanced dependencies.",
    text: "Although the weather was harsh and unpredictable, the expedition team reached the mountain summit before nightfall.",
    recommendedAnnotators: ["pos", "parse", "depparse", "lemma"],
  },
];
