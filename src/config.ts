import * as vscode from "vscode";

export interface DarkAndLight<T> {
  dark: T;
  light: T;
}

export interface Config {
  coverageFilePattern: string;

  highlightsCoveredText: boolean;
  highlightsNotCoveredText: boolean;

  coveredTextBackground: DarkAndLight<string>;
  notCoveredTextBackground: DarkAndLight<string>;

  highlightsCoveredGutter: boolean;
  highlightsNotCoveredGutter: boolean;
  highlightsMixedGutter: boolean;

  coveredGutterIcon: DarkAndLight<string>;
  notCoveredGutterIcon: DarkAndLight<string>;
  mixedGutterIcon: DarkAndLight<string>;
}

export function currentConfig(context: vscode.ExtensionContext): Config {
  const conf = vscode.workspace.getConfiguration("swift-coverage");
  return {
    coverageFilePattern: conf.get<string>(
      "coverageFilePattern",
      "**/.build/*/debug/codecov/*.json"
    )!,

    highlightsCoveredText: conf.get("highlightsCoveredText", false),
    highlightsNotCoveredText: conf.get("highlightsNotCoveredText", true),

    coveredTextBackground: {
      dark: conf.get("coveredTextBackground.dark", "rgba(48, 209, 88, 0.25)"),
      light: conf.get("coveredTextBackground.light", "rgba(52, 199, 89, 0.25)"),
    },
    notCoveredTextBackground: {
      dark: conf.get(
        "notCoveredTextBackground.dark",
        "rgba(255, 69, 58, 0.25)"
      ),
      light: conf.get(
        "notCoveredTextBackground.light",
        "rgba(255, 59, 48, 0.25)"
      ),
    },

    highlightsCoveredGutter: conf.get("highlightsCoveredGutter", true),
    highlightsNotCoveredGutter: conf.get("highlightsNotCoveredGutter", true),
    highlightsMixedGutter: conf.get("highlightsMixedGutter", true),

    coveredGutterIcon: {
      dark:
        conf.get("coveredGutterIcon.dark") ||
        context.asAbsolutePath("./assets/gutter-icon--covered-dark.svg"),
      light:
        conf.get("coveredGutterIcon.light") ||
        context.asAbsolutePath("./assets/gutter-icon--covered-light.svg"),
    },
    notCoveredGutterIcon: {
      dark:
        conf.get("notCoveredGutterIcon.dark") ||
        context.asAbsolutePath("./assets/gutter-icon--notcovered-dark.svg"),
      light:
        conf.get("notCoveredGutterIcon.light") ||
        context.asAbsolutePath("./assets/gutter-icon--notcovered-light.svg"),
    },
    mixedGutterIcon: {
      dark:
        conf.get("mixedGutterIcon.dark") ||
        context.asAbsolutePath("./assets/gutter-icon--mixed-dark.svg"),
      light:
        conf.get("mixedGutterIcon.light") ||
        context.asAbsolutePath("./assets/gutter-icon--mixed-light.svg"),
    },
  };
}
