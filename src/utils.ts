import * as vscode from "vscode";

export function hasActiveWorkspace() {
    return (
        vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0
    );
}

export function getConfigForWorkspace() {
    if (!hasActiveWorkspace()) {
        return null;
    }
    return vscode.workspace.getConfiguration(
        "betterArchiver",
        vscode.workspace.workspaceFolders![0].uri
    );
}
