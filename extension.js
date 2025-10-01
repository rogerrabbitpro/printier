const vscode = require("vscode");

const supportedLangs = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "lua",
];

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "printier.Remove Print Statements",
    async function () {
      const editor = vscode.window.activeTextEditor;
      const document = editor.document;
      if (!editor) {
        return;
      }
      const currentLang = getProgrammingLanguage(document);
      if (!supportedLangs.includes(currentLang)) {
        vscode.window.showInformationMessage(
          `${currentLang} is currently not supported.`
        );
        return;
      }
      const ranges = getAllPrintStatements(document);
      deleteAllPrintStatements(editor, ranges);
      // save the document
      const isSaved = (await document.save()).valueOf();
      if (isSaved) {
        formatDocument(ranges, editor, document);
      }
      // Display a message box to the user
      vscode.window.showInformationMessage("Removed all logs statements");
      vscode.TextEdit;
    }
  );
  context.subscriptions.push(disposable);
}

function getProgrammingLanguage(document) {
  return document.languageId;
}

function getRegex(document) {
  const lang = getProgrammingLanguage(document);
  let regex;
  switch (lang) {
    case "javascript":
      regex =
        /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
      break;
    case "typescript":
      regex =
        /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
      break;
    case "python":
      regex = /print\((.*)\)?/g;
      break;
    case "java":
      regex = /System.out.(println|print|printf)\((.*)\);?/g;
      break;
    case "c":
      regex = /printf\((.*)\);?/g;
      break;
    case "cpp":
      regex = /cout.*<<*.*;?/g;
      break;
    case "lua":
      regex = /print\((.*)\);?/g;
      break;
    default:
      regex = undefined;
  }
  return regex;
}

function getAllPrintStatements(document) {
  const text = document.getText();
  const regex = getRegex(document);
  const match = [...text.matchAll(regex)];
  const ranges = [];
  match.forEach((item) => {
    ranges.push(
      new vscode.Range(
        document.positionAt(item.index),
        document.positionAt(item.index + item[0].length)
      )
    );
  });
  return ranges;
}

function deleteAllPrintStatements(editor, ranges) {
  editor.edit((editBuilder) => {
    ranges.forEach((range) => {
      editBuilder.delete(range);
    });
  });
}

function formatDocument(ranges, editor, document) {
  if (ranges.length === 0) {
    return;
  }
  // Reversing the array to start deleting the empty lines from last
  ranges.reverse();
  // Iterate over the number of ranges to delete the empty lines
  ranges.forEach(async (range) => {
    const start = range.start;
    editor.selection = new vscode.Selection(start, start);
    if (document.lineAt(range.start.line).isEmptyOrWhitespace) {
      await vscode.commands.executeCommand("editor.action.deleteLines");
    }
  });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
