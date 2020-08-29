export interface LLVMCov {
  type: string;
  version: string;
  data: LLVMCovData[];
}

export interface LLVMCovData {
  files: LLVMCovFile[];
  functions: LLVMCovFunction[];
  totals: LLVMCovTotals;
}

export interface LLVMCovTotals {
  functions: LLVMCovSummary;
  instantiations: LLVMCovSummary;
  lines: LLVMCovSummary;
  regions: LLVMCovSummary & { notcovered: number };
}

export interface LLVMCovSummary {
  count: number;
  covered: number;
  /**
   * Between 0 and 100; floating point
   */
  percent: number;
}

export interface LLVMCovFile {
  expansions: unknown[];
  filename: string;
  /**
   * [Line, Column, Executions, hasCoverage, ?]
   */
  segments: Array<[number, number, number, boolean, boolean]>;
  summary: LLVMCovTotals;
}

export interface LLVMCovFunction {
  count: number;
  filenames: string[];
  /**
   * Mangled name
   */
  name: string;
  regions: Array<
    [number, number, number, number, number, number, number, number]
  >;
}
