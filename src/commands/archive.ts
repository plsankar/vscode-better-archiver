import * as vscode from "vscode";

import { createWriteStream, statSync, unlinkSync } from "fs";
import { getConfigForWorkspace, hasActiveWorkspace } from "../utils";
import path, { join } from "path";

import archiver from "archiver";
import byteSize from "byte-size";
import { glob } from "glob";
import { showNoActiveWorkspaceMessage } from "../dialogs";
import sortBy from "lodash.sortby";

export const action = async () => {
    if (!hasActiveWorkspace()) {
        showNoActiveWorkspaceMessage();
        return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders![0].uri;

    if (workspaceFolder.scheme !== "file") {
        vscode.window.showErrorMessage(
            "This extension only works with file system workspaces."
        );
        return;
    }

    const config = getConfigForWorkspace();

    let exclude = config?.get<string[]>("exclude", []);

    const workspaceFolderPath = workspaceFolder.path;
    const workspaceFolderName = path.basename(workspaceFolderPath);

    const workspaceArchiveFileName = `${workspaceFolderName}.zip`;
    const workspaceArchiveFilePath = path.join(
        workspaceFolderPath,
        workspaceArchiveFileName
    );

    if (!exclude || exclude.length === 0) {
        console.log("No exclude");

        const children = await scanFolderToplevelWithGlob(workspaceFolderPath);
        console.log(children);

        const childrenWithDetails = children.map((fullPath) => {
            const stats = statSync(fullPath);
            return {
                fullPath,
                isDirectory: stats.isDirectory(),
                name: fullPath.replace(`${workspaceFolderPath}/`, ""),
            };
        });

        const folders = sortBy(
            childrenWithDetails.filter((child) => child.isDirectory),
            "name"
        );

        const files = sortBy(
            childrenWithDetails.filter((child) => !child.isDirectory),
            "name"
        );

        const options = [...folders, ...files].map((child) => {
            return {
                value: path.join(child.name, child.isDirectory ? "/**" : ""),
                label: child.name,
                iconPath: child.isDirectory
                    ? new vscode.ThemeIcon("folder")
                    : new vscode.ThemeIcon("file"),
            };
        });

        console.log(options);

        const selectedExcludes = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: "Select files and folders to exclude from the archive",
        });

        console.log(selectedExcludes);

        exclude = selectedExcludes?.map((item) => item.value) || [];

        if (selectedExcludes) {
            config?.update(
                "exclude",
                exclude,
                vscode.ConfigurationTarget.Workspace
            );
        }
    }

    console.log(exclude);

    const targetFiles = await scanFolderWithGlob(workspaceFolderPath, exclude);

    if (targetFiles.length === 0) {
        vscode.window.showErrorMessage("No files to archive!");
        return;
    }

    let aborted = false;

    const output = createWriteStream(workspaceArchiveFilePath);

    const archive = archiver("zip", {
        zlib: { level: 1 },
    });

    archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
            console.error(err);
            vscode.window.showErrorMessage("Unknown error!");
        } else {
            // throw error
            console.error(err);
            vscode.window.showErrorMessage("Unknown error!");
            throw err;
        }
    });

    archive.on("error", function (err) {
        console.error(err);
        vscode.window.showErrorMessage("Unknown error!");
    });

    archive.on("finish", () => {
        if (aborted) {
            console.log("ZIP file creation has been aborted.");
            vscode.window.showInformationMessage(
                "ZIP file creation has been aborted."
            );
        } else {
            const message = `ZIP file has been created. Total Filesize: ${byteSize(
                archive.pointer()
            )}`;
            console.log(message);
            vscode.window.showInformationMessage(message);
        }
    });

    archive.pipe(output);

    targetFiles.forEach((file) => {
        archive.file(file, { name: file.replace(workspaceFolderPath, "") });
    });

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Archiving workspace...",
            cancellable: true,
        },
        async (progressUI, token) => {
            let previousProgress = 0;

            token.onCancellationRequested(() => {
                aborted = true;
                archive.abort();
                unlinkSync(workspaceArchiveFilePath);
            });

            archive.on("progress", ({ entries }) => {
                const newProgress = (entries.processed / entries.total) * 100;
                const increment = newProgress - previousProgress;

                progressUI.report({
                    message: `Processing ${entries.processed} of ${entries.total} files...`,
                    increment: increment,
                });

                previousProgress = newProgress;
            });

            await archive.finalize();
        }
    );
};

async function scanFolderWithGlob(dir: string, excludes: string[]) {
    const pattern = path.join(dir, "/**/*");

    const list = await glob(pattern, {
        ignore: excludes.map((rule) => join(dir, rule)),
    });

    return list;
}

async function scanFolderToplevelWithGlob(dir: string) {
    const pattern = path.join(dir, "/*");
    const list = await glob(pattern);
    return list;
}
