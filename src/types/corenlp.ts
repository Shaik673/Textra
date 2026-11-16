export interface CoreNLPToken {
  index: number;
  word: string;
  originalText?: string;
  lemma?: string;
  characterOffsetBegin?: number;
  characterOffsetEnd?: number;
  pos?: string;
  ner?: string;
  speaker?: string;
  before?: string;
  after?: string;
}

export interface DependencyRelation {
  dep: string;
  governor: number;
  governorGloss: string;
  dependent: number;
  dependentGloss: string;
}

export interface OpenIERelation {
  subject: string;
  relation: string;
  object: string;
  subjectSpan?: [number, number];
  relationSpan?: [number, number];
  objectSpan?: [number, number];
}

export interface CoreNLPSentence {
  index: number;
  line?: number;
  sentiment?: string;
  sentimentValue?: string;
  sentimentDistribution?: number[];
  tokens: CoreNLPToken[];
  basicDependencies?: DependencyRelation[];
  enhancedDependencies?: DependencyRelation[];
  enhancedPlusPlusDependencies?: DependencyRelation[];
  parse?: string;
  openie?: OpenIERelation[];
  kbp?: OpenIERelation[];
}

export interface CorefMention {
  id: number;
  text: string;
  type: string;
  number: string;
  gender: string;
  animacy: string;
  startIndex: number;
  endIndex: number;
  headIndex: number;
  sentNum: number;
  position: [number, number];
  isRepresentativeMention: boolean;
}

export interface CoreNLPResponse {
  sentences: CoreNLPSentence[];
  corefs?: Record<string, CorefMention[]>;
}

export interface ParseTreeNode {
  id: string;
  label: string;
  word?: string;
  pos?: string;
  children: ParseTreeNode[];
  depth: number;
}
