import * as fs from "fs";
import { Disposable } from "vscode";
import { TotalCoverageReporter } from "./total-coverage-reporter";
import { EditorCoverageReporter } from "./editor-coverage-reporter";
import { Config } from "./config";
import { LLVMCov } from "./llvm-cov";
import { promisify } from "util";
import * as vscode from "vscode";

export class CoverageWatcher implements Disposable {
  private readonly coverageReporter: TotalCoverageReporter;
  private readonly editorCoverageReporter: EditorCoverageReporter;

  private readonly subscriptions = Array<Disposable>();

  constructor(config: Config) {
    this.coverageReporter = new TotalCoverageReporter();
    this.editorCoverageReporter = new EditorCoverageReporter(config);

    this.subscriptions.push(
      this.coverageReporter,
      this.editorCoverageReporter,
      vscode.workspace
        .createFileSystemWatcher("**/.build/*/debug/codecov/*.json")
        .onDidChange((uri) => this.applyCoverage(uri)),
      vscode.workspace
        .createFileSystemWatcher("**/.build/*/debug/codecov/*.json")
        .onDidCreate((uri) => this.applyCoverage(uri))
    );

    vscode.workspace
      .findFiles("**/.build/*/debug/codecov/*.json")
      .then((uris) => uris.forEach((uri) => this.applyCoverage(uri)));
  }

  private async applyCoverage(file: vscode.Uri) {
    let llvmCov: LLVMCov;
    if (file.scheme == "file") {
      const document = await vscode.workspace.openTextDocument(file);
      llvmCov = JSON.parse(document.getText());
    } else {
      llvmCov = JSON.parse(await promisify(fs.readFile)(file.fsPath, "utf8"));
    }

    this.coverageReporter.display(llvmCov);
    this.editorCoverageReporter.display(llvmCov);
  }

  dispose() {
    this.subscriptions.forEach((subscription) => subscription.dispose());
  }
}
