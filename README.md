# TWiki Syntax Preview - VS Code Extension

This Visual Studio Code extension provides live preview functionality for TWiki syntax, allowing you to write and preview TWiki-formatted documents in real-time.

## Features

-   **Live Preview**: Automatically updates the preview as you type, allowing you to see how your TWiki syntax will look.
-   **TWiki Formatting Support**: Supports key TWiki formatting, including:
    -   **Headings**: Convert TWiki headings (e.g., `---+`, `---++`, etc.) into HTML headings.
    -   **Bold** and **Italic**: Supports bold (`*text*`) and italic (`_text_`) formatting.
    -   **Links**: Parse TWiki-style links like `[[URL][Link Text]]`.
    -   **Tables**: Fully supports TWiki table formatting, including special alignment rules, colspan, and multiline rows.
    -   **Code Blocks**: Handles fixed-width code and verbatim sections.
    -   **HTML Support**: Allows embedded HTML within TWiki syntax.
    -   **Special Characters**: Supports special TWiki characters like `%VBAR%` and `%CARET%`.

## Usage

1. Open a document with TWiki syntax in Visual Studio Code.
2. Use the command palette (`Ctrl + Shift + P` or `Cmd + Shift + P` on macOS) and run `Show TWiki Preview`.
3. The preview pane will open, showing a live preview of your TWiki document.

## TWiki Syntax Supported

-   Headings (e.g., `---+`, `---++`)
-   Bold (`*bold text*`)
-   Italics (`_italic text_`)
-   Links (`[[https://example.com][Example]]`)
-   Tables with alignment and column spanning
-   Code blocks and verbatim sections (`<verbatim>...</verbatim>`)
-   Embedded HTML
-   Special characters like `%VBAR%` (`|`) and `%CARET%` (`^`)

## Installation

1. Download and install from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/vscode).
2. Search for **TWiki Syntax Preview** and install it.
3. Enjoy live TWiki syntax previews in your editor!

## Contributing

Feel free to submit issues and pull requests on the [GitHub repository](https://github.com/ericcirone/vscode-twiki-preview).

## License

This extension is licensed under the [MIT License](LICENSE).
