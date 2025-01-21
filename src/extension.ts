import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import CancellationError from "./cancellation_error";
import Stash from "./stash";

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
        id: parseInt(id),
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

async function promptToPickStash(stashes: Stash[]) {
    const pickedStash = await vscode.window.showQuickPick(stashes, {
        placeHolder: "Pick a stash to overwrite",
    });

    if (!pickedStash) {
        throw new CancellationError("No stash picked.");
    }

    return pickedStash;
}

async function promptToEnterStashMessage(defaultValue: string) {
    const stashMessage = await vscode.window.showInputBox({
        value: defaultValue,
        prompt: "Enter stash message",
        placeHolder: "Enter stash message",
    });

    if (stashMessage === undefined) {
        throw new CancellationError("No stash message entered.");
    }

    return stashMessage;
}

async function overwriteStash(
    id: number,
    message: string,
    workspaceFolder: string
) {
    const options = { cwd: workspaceFolder };
    await execAsync(`git stash drop "stash@{${id}}"`, options);
    await execAsync(`git stash -u -m "${message}"`, options);
}

async function overwriteStashCommand() {
    try {
        const workspaceFolder = getWorkspaceFolder();
        const stashes = await getStashes(workspaceFolder);
        const pickedStash = await promptToPickStash(stashes);
        const stashMessage = await promptToEnterStashMessage(
            pickedStash.message
        );
        overwriteStash(pickedStash.id, stashMessage, workspaceFolder);
    } catch (error: any) {
        if (error instanceof CancellationError) {
            console.log(error.message);
        } else {
            vscode.window.showErrorMessage(error.message ?? error);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        "git-overwrite-stash.overwriteStash",
        overwriteStashCommand
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
