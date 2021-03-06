// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { currentConfig } from "./config";
import { CoverageWatcher } from "./coverage-watcher";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let coverageWatcher = new CoverageWatcher(currentConfig(context));
  context.subscriptions.push(coverageWatcher);

  vscode.workspace.onDidChangeConfiguration(() => {
    coverageWatcher.dispose();

    coverageWatcher = new CoverageWatcher(currentConfig(context));
    context.subscriptions.push(coverageWatcher);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
