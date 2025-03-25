# Better Archiver

Better Archiver is a VS Code extension that zips your workspace folder for easy deployment. With a single command, you can create a zip archive of your project, excluding unnecessary files and ensuring a smooth deployment process.

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![GitHub issues](https://img.shields.io/github/issues/plsankar/vscode-better-archiver)
![GitHub pull requests](https://img.shields.io/github/issues-pr/plsankar/vscode-better-archiver)
![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/Lakshmisankar.better-archiver)

## Features

-   Zip the entire workspace folder with one command.
-   Option to exclude specific files and folders.
-   Lightweight and fast performance.

## Installation

1. Open VS Code.
2. Go to the Extensions Marketplace (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
3. Search for **Better Archiver**.
4. Click **Install**.

Install the extension from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Lakshmisankar.better-archiver)

## Usage

1. Open a workspace in VS Code.
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
3. Type `Better Archiver: Archive` and press Enter.
4. Your workspace will be zipped and saved in the specified location.

## Configuration

You can customize the behavior of Better Archiver in **settings.json**:

```json
{
    "betterArchiver.exclude": ["node_modules", ".git", "dist"]
}
```

-   `betterArchiver.exclude`: An array of file/folder names to exclude from the archive.

## Roadmap

-   [ ] Compression level customization.

## Acknowledgements

-   [Node Archiver](https://github.com/archiverjs/node-archiver) and its contributors

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request on GitHub.

## License

MIT License
