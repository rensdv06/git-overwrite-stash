import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getWorkspaceFolder() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
        throw new Error("No workspace folder found.");
    }

    return workspaceFolder;
}

function extractStashDataFromLine(line: string) {
    const match = line.match(/stash@{(\d+)}: On (.+): (.+)/);
    if (!match) {
        throw new Error(
            `Failed to extract stash data from line. No match found for line '${line}'`
        );
    }

    const [, id, branch, message] = match;
    return {
        label: `#${id}: ${message}`,
        description: branch,
        id,
        message,
    };
}

async function getStashes(workspaceFolder: string) {
    const { stdout, stderr } = await execAsync("git stash list", {
        cwd: workspaceFolder,
    });

    if (stderr) {
        throw new Error("Failed to get stashes: " + stderr);
    }

    return stdout.trim().split("\n").map(extractStashDataFromLine);
}

async function promptToPickStash(stashes: vscode.QuickPickItem[]) {
    const pickedStash = await vscode.window.showQuickPick(stashes, {
        placeHolder: "Pick a stash to overwrite",
    });

    if (!pickedStash) {
        console.log("No stash picked.");
    }

    return pickedStash;
}

async function overwriteStash() {
    try {
        const workspaceFolder = getWorkspaceFolder();
        const stashes = await getStashes(workspaceFolder);
        const pickedStash = await promptToPickStash(stashes);
        if (pickedStash) {
            console.log(`You picked ${pickedStash.label}`);
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message ?? error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        "git-overwrite-stash.overwriteStash",
        overwriteStash
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
