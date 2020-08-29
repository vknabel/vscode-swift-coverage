import * as vscode from "vscode";

export interface CoverageDecoration {
  kind: "covered" | "notcovered" | "mixed";
  options: vscode.DecorationOptions;
}

export class DocumentRangeDecorator {
  private readonly allDecorations = new Array<CoverageDecoration>();
  private readonly lineDecorations = new Array<CoverageDecoration[]>();

  addDecoration(decoration: CoverageDecoration) {
    this.allDecorations.push(decoration);

    for (
      let lineNumber = decoration.options.range.start.line;
      lineNumber <= decoration.options.range.end.line;
      lineNumber++
    ) {
      const existingDecorations = this.lineDecorations[lineNumber] || Array();
      this.lineDecorations[lineNumber] = [...existingDecorations, decoration];
    }
  }

  textDecorationsForCoverageKind(
    kind: CoverageDecoration["kind"]
  ): vscode.DecorationOptions[] {
    return this.allDecorations
      .filter((decoration) => decoration.kind === kind)
      .map(({ options }) => options);
  }

  gutterDecorationsForCoverageKind(
    kind: CoverageDecoration["kind"]
  ): vscode.DecorationOptions[] {
    return this.gutterCoverageDecorations()
      .filter((decoration) => decoration.kind === kind)
      .map(({ options }) => options);
  }

  private gutterCoverageDecorations(): CoverageDecoration[] {
    return this.lineDecorations
      .map(
        (line, index): CoverageDecoration =>
          line && {
            kind: this.gutterKindForCoverageDecorations(line),
            options: { range: new vscode.Range(index, 0, index, 1) },
          }
      )
      .filter((gutter) => !!gutter);
  }

  private gutterKindForCoverageDecorations(
    line: CoverageDecoration[]
  ): CoverageDecoration["kind"] {
    const kinds = line.map(({ kind }) => kind);
    if (
      kinds.includes("mixed") ||
      (kinds.includes("covered") && kinds.includes("notcovered"))
    ) {
      return "mixed";
    } else {
      return kinds.includes("covered") ? "covered" : "notcovered";
    }
  }
}
