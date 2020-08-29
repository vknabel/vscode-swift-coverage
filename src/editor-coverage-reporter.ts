import { Disposable } from "vscode";
import * as vscode from "vscode";
import { LLVMCov, LLVMCovFile } from "./llvm-cov";
import { DocumentRangeDecorator } from "./document-range-decorator";
import { Config } from "./config";

export class EditorCoverageReporter implements Disposable {
  private readonly editorChanges = vscode.window.onDidChangeVisibleTextEditors(
    (editors) => this.visibleEditorsDidChange(editors)
  );
  private readonly xeditorChanges = vscode.window.onDidChangeActiveTextEditor(
    (editor) => editor && this.visibleEditorsDidChange([editor])
  );
  private readonly gutterCoveredDecoration: vscode.TextEditorDecorationType;
  private readonly gutterNotCoveredDecoration: vscode.TextEditorDecorationType;
  private readonly gutterMixedDecoration: vscode.TextEditorDecorationType;

  private readonly textCoveredDecoration: vscode.TextEditorDecorationType;
  private readonly textNotCoveredDecoration: vscode.TextEditorDecorationType;
  private readonly cache = new Map<string, LLVMCovFile>();

  constructor(private readonly config: Config) {
    this.textCoveredDecoration = vscode.window.createTextEditorDecorationType({
      dark: {
        backgroundColor: config.coveredTextBackground.dark,
      },
      light: {
        backgroundColor: config.coveredTextBackground.light,
      },
    });
    this.textNotCoveredDecoration = vscode.window.createTextEditorDecorationType(
      {
        dark: {
          backgroundColor: config.notCoveredTextBackground.dark,
        },
        light: {
          backgroundColor: config.notCoveredTextBackground.light,
        },
      }
    );

    this.gutterCoveredDecoration = vscode.window.createTextEditorDecorationType(
      {
        dark: {
          gutterIconPath: config.coveredGutterIcon.dark,
        },
        light: {
          gutterIconPath: config.coveredGutterIcon.light,
        },
      }
    );
    this.gutterNotCoveredDecoration = vscode.window.createTextEditorDecorationType(
      {
        dark: {
          gutterIconPath: config.notCoveredGutterIcon.dark,
        },
        light: {
          gutterIconPath: config.notCoveredGutterIcon.light,
        },
      }
    );
    this.gutterMixedDecoration = vscode.window.createTextEditorDecorationType({
      dark: {
        gutterIconPath: config.mixedGutterIcon.dark,
      },
      light: {
        gutterIconPath: config.mixedGutterIcon.light,
      },
    });
  }

  display(llvmCov: LLVMCov) {
    if (llvmCov.data.length == 0) {
      return;
    }
    this.cache.clear();
    llvmCov.data.forEach((data) => {
      data.files.forEach((file) => {
        this.cache.set(file.filename, file);
      });
    });
    // TODO: Render
    this.visibleEditorsDidChange(vscode.window.visibleTextEditors);
  }

  visibleEditorsDidChange(editors: vscode.TextEditor[]): Disposable {
    // TODO: remove from editors?
    for (const editor of editors) {
      const fileCov = this.cache.get(editor.document.uri.fsPath);
      if (!fileCov) {
        return { dispose: () => void 0 };
      }

      const documentRangeDecorator = new DocumentRangeDecorator();
      for (let i = 0; i < fileCov.segments.length; i++) {
        const [
          line,
          column,
          executions,
          hasCoverage,
          _notsure,
        ] = fileCov.segments[i];
        if (!hasCoverage) {
          continue;
        }

        const [endLine, endColumn] =
          fileCov.segments[i + 1] ||
          editor.document.lineAt(editor.document.lineCount - 1);

        const startPosition = new vscode.Position(line - 1, column - 1);
        const endPosition = new vscode.Position(endLine - 1, endColumn);

        const decoration: vscode.DecorationOptions = {
          range: new vscode.Range(startPosition, endPosition),
          renderOptions: {
            // before: {
            //   contentText: `${executions}`,
            // },
            // after: {
            //   contentText: `${executions}`,
            // },
          },
          hoverMessage: `*Executed ${
            executions == 1 ? "once" : `${executions} times`
          } in tests*`,
          // hoverMessage
          // renderOptions: {
          //   before: {
          //     contentText: "Hello",
          //   },
          // },
        };

        documentRangeDecorator.addDecoration({
          kind: executions > 0 ? "covered" : "notcovered",
          options: decoration,
        });

        if (this.config.highlightsCoveredGutter) {
          editor.setDecorations(
            this.gutterCoveredDecoration,
            documentRangeDecorator.gutterDecorationsForCoverageKind("covered")
          );
        }
        if (this.config.highlightsNotCoveredGutter) {
          editor.setDecorations(
            this.gutterNotCoveredDecoration,
            documentRangeDecorator.gutterDecorationsForCoverageKind(
              "notcovered"
            )
          );
        }
        if (this.config.highlightsMixedGutter) {
          editor.setDecorations(
            this.gutterMixedDecoration,
            documentRangeDecorator.gutterDecorationsForCoverageKind("mixed")
          );
        }

        if (this.config.highlightsCoveredText) {
          editor.setDecorations(
            this.textCoveredDecoration,
            documentRangeDecorator.textDecorationsForCoverageKind("covered")
          );
        }
        if (this.config.highlightsNotCoveredText) {
          editor.setDecorations(
            this.textNotCoveredDecoration,
            documentRangeDecorator.textDecorationsForCoverageKind("notcovered")
          );
        }
      }
    }
    return { dispose: () => void 0 };
  }

  dispose() {
    this.editorChanges.dispose();
    this.gutterCoveredDecoration.dispose();
    this.gutterNotCoveredDecoration.dispose();
    this.gutterMixedDecoration.dispose();
    this.textCoveredDecoration.dispose();
    this.textNotCoveredDecoration.dispose();
  }
}
