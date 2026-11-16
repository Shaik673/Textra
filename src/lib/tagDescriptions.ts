export const POS_INFO: Record<string, { label: string; category: string; color: string; bg: string }> = {
  // Nouns
  NN: { label: "Noun, singular or mass", category: "Noun", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800" },
  NNS: { label: "Noun, plural", category: "Noun", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800" },
  NNP: { label: "Proper noun, singular", category: "Noun", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800" },
  NNPS: { label: "Proper noun, plural", category: "Noun", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800" },
  
  // Verbs
  VB: { label: "Verb, base form", category: "Verb", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" },
  VBD: { label: "Verb, past tense", category: "Verb", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" },
  VBG: { label: "Verb, gerund/present participle", category: "Verb", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" },
  VBN: { label: "Verb, past participle", category: "Verb", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" },
  VBP: { label: "Verb, non-3rd person singular present", category: "Verb", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" },
  VBZ: { label: "Verb, 3rd person singular present", category: "Verb", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" },
  MD: { label: "Modal verb", category: "Verb", color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800" },

  // Adjectives
  JJ: { label: "Adjective", category: "Adjective", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800" },
  JJR: { label: "Adjective, comparative", category: "Adjective", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800" },
  JJS: { label: "Adjective, superlative", category: "Adjective", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800" },

  // Adverbs
  RB: { label: "Adverb", category: "Adverb", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800" },
  RBR: { label: "Adverb, comparative", category: "Adverb", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800" },
  RBS: { label: "Adverb, superlative", category: "Adverb", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800" },
  WRB: { label: "Wh-adverb", category: "Adverb", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800" },

  // Pronouns
  PRP: { label: "Personal pronoun", category: "Pronoun", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800" },
  "PRP$": { label: "Possessive pronoun", category: "Pronoun", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800" },
  WP: { label: "Wh-pronoun", category: "Pronoun", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800" },
  "WP$": { label: "Possessive wh-pronoun", category: "Pronoun", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800" },

  // Determiners & Numbers
  DT: { label: "Determiner", category: "Determiner", color: "text-cyan-700 dark:text-cyan-300", bg: "bg-cyan-100 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800" },
  WDT: { label: "Wh-determiner", category: "Determiner", color: "text-cyan-700 dark:text-cyan-300", bg: "bg-cyan-100 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800" },
  CD: { label: "Cardinal number", category: "Number", color: "text-pink-700 dark:text-pink-300", bg: "bg-pink-100 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800" },

  // Prepositions & Conjunctions
  IN: { label: "Preposition / subordinating conjunction", category: "Preposition", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800" },
  CC: { label: "Coordinating conjunction", category: "Conjunction", color: "text-fuchsia-700 dark:text-fuchsia-300", bg: "bg-fuchsia-100 dark:bg-fuchsia-950/60 border-fuchsia-300 dark:border-fuchsia-800" },
  TO: { label: "to", category: "Particle", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" },
  RP: { label: "Particle", category: "Particle", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" },
  POS: { label: "Possessive ending", category: "Punctuation", color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700" },
};

export const NER_INFO: Record<string, { label: string; color: string; bg: string; badge: string }> = {
  PERSON: { label: "Person", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800", badge: "bg-rose-500 text-white" },
  LOCATION: { label: "Location", color: "text-sky-700 dark:text-sky-300", bg: "bg-sky-100 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800", badge: "bg-sky-500 text-white" },
  ORGANIZATION: { label: "Organization", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800", badge: "bg-blue-600 text-white" },
  DATE: { label: "Date", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800", badge: "bg-emerald-500 text-white" },
  TIME: { label: "Time", color: "text-teal-700 dark:text-teal-300", bg: "bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800", badge: "bg-teal-500 text-white" },
  MONEY: { label: "Money", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800", badge: "bg-amber-500 text-white" },
  PERCENT: { label: "Percent", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800", badge: "bg-orange-500 text-white" },
  DURATION: { label: "Duration", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800", badge: "bg-indigo-500 text-white" },
  CITY: { label: "City", color: "text-cyan-700 dark:text-cyan-300", bg: "bg-cyan-100 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800", badge: "bg-cyan-500 text-white" },
  COUNTRY: { label: "Country", color: "text-blue-800 dark:text-blue-200", bg: "bg-blue-200/80 dark:bg-blue-900/60 border-blue-400 dark:border-blue-700", badge: "bg-blue-700 text-white" },
  STATE_OR_PROVINCE: { label: "State / Province", color: "text-cyan-700 dark:text-cyan-300", bg: "bg-cyan-100 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800", badge: "bg-cyan-600 text-white" },
  NATIONALITY: { label: "Nationality", color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-100 dark:bg-violet-950/60 border-violet-300 dark:border-violet-800", badge: "bg-violet-500 text-white" },
  MISC: { label: "Miscellaneous", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800", badge: "bg-purple-500 text-white" },
};

export const DEP_INFO: Record<string, string> = {
  nsubj: "Nominal subject",
  "nsubj:pass": "Passive nominal subject",
  obj: "Direct object",
  dobj: "Direct object",
  iobj: "Indirect object",
  csubj: "Clausal subject",
  ccomp: "Clausal complement",
  xcomp: "Open clausal complement",
  obl: "Oblique nominal",
  "obl:over": "Oblique (over)",
  "obl:in": "Oblique (in)",
  "obl:on": "Oblique (on)",
  "obl:at": "Oblique (at)",
  vocative: "Vocative",
  advmod: "Adverbial modifier",
  amod: "Adjectival modifier",
  advcl: "Adverbial clause modifier",
  appos: "Appositional modifier",
  nummod: "Numeric modifier",
  nmod: "Nominal modifier",
  "nmod:poss": "Possessive nominal modifier",
  compound: "Compound word",
  "compound:prt": "Phrasal verb particle",
  flat: "Flat multiword expression",
  case: "Case marking (preposition/postposition)",
  mark: "Marker (subordinating conjunction)",
  cc: "Coordinating conjunction",
  conj: "Conjunct",
  cop: "Copula",
  aux: "Auxiliary verb",
  "aux:pass": "Passive auxiliary verb",
  det: "Determiner",
  punct: "Punctuation",
  root: "Root of sentence",
};

export const SENTIMENT_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  "Very Positive": { label: "Very Positive", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500" },
  "Positive": { label: "Positive", bg: "bg-green-500", text: "text-green-700 dark:text-green-300", border: "border-green-500" },
  "Neutral": { label: "Neutral", bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500" },
  "Negative": { label: "Negative", bg: "bg-orange-500", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500" },
  "Very Negative": { label: "Very Negative", bg: "bg-rose-600", text: "text-rose-700 dark:text-rose-300", border: "border-rose-600" },
};
