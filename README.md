# git-overwrite-stash

A VSCode extension that adds commands to overwrite a Git stash, designed to be simple

Works by first dropping it and then stashing all changes again (optionally including untracked files)

## Installation options

-   [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rensdv06.git-overwrite-stash)
-   Quick Open: `ext install rensdv06.git-overwrite-stash`
-   Terminal: `code --install-extension rensdv06.git-overwrite-stash`
-   Vsix file:
    1. Download the [vsix file](https://github.com/rensdv06/git-overwrite-stash/releases/download/v1.0.1/git-overwrite-stash-1.0.1.vsix)
    2. Open the Command Palette (`ctrl + shift + p` by default)
    3. `Extensions: Install from VSIX...`
    4. Select the vsix file

## Usage

1. Open the Command Palette (`ctrl + shift + p` by default)
2. Choose either
    -   `Git Overwrite Stash: Overwrite Stash`
    -   `Git Overwrite Stash: Overwrite Stash (Include Untracked)`
3. Pick a stash
4. Enter a message (default is the original message)
