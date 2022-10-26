const vscode = require("vscode");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "printier.Remove Print Statements",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document = editor.document;
      const currentLang = document.languageId;
      if (currentLang !== "javascript") {
        vscode.window.showInformationMessage(
          `${currentLang} is currently not supported.`
        );
        return;
      }

      const text = document.getText();
      const regex =
        /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
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
      editor.edit((editBuilder) => {
        ranges.forEach((range) => {
          editBuilder.delete(range);
        });
      });
      // Format the document
      await vscode.commands.executeCommand("editor.action.formatDocument");
      // Display a message box to the user
      vscode.window.showInformationMessage("Removed all logs statements");
      vscode.TextEdit;
    }
  );
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
