import { Disposable } from "vscode";
import * as vscode from "vscode";
import { LLVMCov, LLVMCovSummary, LLVMCovTotals } from "./llvm-cov";

export class TotalCoverageReporter implements Disposable {
  private readonly coverageStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  private isShown = false;

  display(llvmCov: LLVMCov) {
    if (llvmCov.data.length == 0) {
      this.coverageStatusBarItem.hide();
      return;
    }
    const totals = llvmCov.data[0].totals;
    this.coverageStatusBarItem.text = this.summarizeForBarItem(totals.lines);
    this.coverageStatusBarItem.tooltip = [
      this.summarizeTotalsForTooltip("Lines", "lines", totals),
      this.summarizeTotalsForTooltip("Functions", "functions", totals),
      this.summarizeTotalsForTooltip(
        "Instantiations",
        "instantiations",
        totals
      ),
      this.summarizeTotalsForTooltip("Regions", "regions", totals),
    ].join("\n");

    if (!this.isShown) {
      this.coverageStatusBarItem.show();
    }
  }

  private summarizeTotalsForTooltip(
    label: string,
    total: keyof LLVMCovTotals,
    totals: LLVMCovTotals
  ): string {
    return `${label}: ${this.summarizeForTooltip(totals[total])}`;
  }

  private summarizeForTooltip(summary: LLVMCovSummary): string {
    return `${summary.percent.toFixed()}% (${summary.covered}/${
      summary.count
    })`;
  }
  private summarizeForBarItem(summary: LLVMCovSummary): string {
    return `${summary.percent.toFixed()}%`;
  }

  dispose() {
    this.coverageStatusBarItem.dispose();
  }
}
