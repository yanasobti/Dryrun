export interface Param {
  type: string;
  name: string;
}

export interface MethodInfo {
  name: string;
  returnType: string;
  params: Param[];
  isStatic: boolean;
}

export type VisualizerType =
  | "array"
  | "hashmap"
  | "hashset"
  | "linked-list"
  | "tree"
  | "queue"
  | "stack"
  | "graph"
  | "recursion"
  | "matrix"
  | "heap"
  | "backtracking"
  | "encode-decode-strings"
  | "valid-sudoku"
  | "longest-consecutive-sequence"
  | "two-pointers"
  | "sliding-window"
  | "permutation-in-string"
  | "car-fleet"
  | "largest-rectangle";

export interface Question {
  id: string;
  number: number;
  order: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  pattern: string;
  visualizers: VisualizerType[];
  visualizerLayout: "horizontal" | "vertical" | "auto";
  visualizationLevel: "full" | "basic" | "coming-soon";
  url: string;
  supportedFeatures: string[];
  estimatedMinutes: number;
  starterCodeId?: string;
  exampleCaseId?: string;
  strategy?: string;
}

export interface PatternDefinition {
  why: string;
  clues: string[];
  avoid: string[];
  complexity?: {
    time: string;
    space: string;
  };
}
