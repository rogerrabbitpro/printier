const vscode = require("vscode");

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
      if (currentLang !== "javascript") {
        vscode.window.showInformationMessage(
          `${currentLang} is currently not supported.`
        );
        return;
      }

      const ranges = getAllPrintStatements(document);
      deleteAllPrintStatements(editor, ranges);
      await formatDocument(ranges, editor);
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

async function formatDocument(ranges, editor) {
  // Set the cursor position to the first occurence of the console statement
  const pos = ranges[0].start
  const selection = new vscode.Selection(pos, pos)
  editor.selection = selection
  // Iterate over the number of ranges to delete the emptied lines
  ranges.forEach(async () => {
    await vscode.commands.executeCommand("editor.action.deleteLines");
  });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
