import * as vscode from "vscode";

export function showNoActiveWorkspaceMessage() {
    vscode.window.showInformationMessage("There is no workspace/folder open.");
}
