const vscode = require("vscode");

function activate(context) {
	let panel;

	// Register the command that shows the TWiki preview
	let disposable = vscode.commands.registerCommand("extension.showTWikiPreview", function () {
		// Create and show a new webview panel
		panel = vscode.window.createWebviewPanel(
			"twikiPreview", // Identifies the type of the webview
			"TWiki Preview", // Title of the panel
			vscode.ViewColumn.Two, // Show the panel in a second column
			{ enableScripts: true } // Enable JS in the webview
		);

		// Get the initial content from the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			updateWebView(editor.document.getText(), panel);
		}

		// Subscribe to document changes to update the preview in real-time
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (editor && event.document === editor.document) {
				updateWebView(event.document.getText(), panel);
			}
		});
	});

	context.subscriptions.push(disposable);
}

// Function to update the webview content
function updateWebView(text, panel) {
	if (panel) {
		const html = renderTWikiPreview(text);
		panel.webview.html = html;
	}
}

function deactivate() {}

// Example function to render TWiki preview content.
// Replace this with real parsing logic for TWiki syntax.
function renderTWikiPreview(text) {
	// This function converts simple TWiki-like syntax to HTML.
	// You would implement proper parsing here.
	return `
    <html>
    <body>
        <div>${parseTWiki(text)}</div>
    </body>
    </html>
    `;
}

function parseTWiki(text) {
	const htmlParts = [];

	// Handle <verbatim> blocks before HTML escaping
	const verbatimBlocks = [];
	text = text.replace(/<verbatim>([\s\S]*?)<\/verbatim>/g, (match, p1) => {
		verbatimBlocks.push(escapeHTML(p1));
		return `[[[[verbatim-block-${verbatimBlocks.length - 1}]]]]`;
	});

	// // Extract all HTML tags (so they won't be escaped or modified)
	// text = text.replace(/<[^>]+>/g, (match) => {
	// 	htmlParts.push(match);
	// 	return `[[[[html-part-${htmlParts.length - 1}]]]]`;
	// });

	// Extract multiline HTML tags that start with "<" at the beginning of the line
	// This also ensures it captures the entire corresponding tag, including multiline HTML
	const htmlRegex = /(^\s*<[\s\S]*?>)/gm;
	text = text.replace(htmlRegex, (match) => {
		htmlParts.push(match);
		return `[[[[html-part-${htmlParts.length - 1}]]]]`;
	});

	// Escape HTML to prevent injection
	text = escapeHTML(text);

	// Convert headings: ---+ to <h1>, ---++ to <h2>, etc.
	text = text
		.replace(/---\+{1} (.*)/g, "<h1>$1</h1>")
		.replace(/---\+{2} (.*)/g, "<h2>$1</h2>")
		.replace(/---\+{3} (.*)/g, "<h3>$1</h3>")
		.replace(/---\+{4} (.*)/g, "<h4>$1</h4>")
		.replace(/---\+{5} (.*)/g, "<h5>$1</h5>");

	// Convert bold: *text* to <strong>text</strong>
	text = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

	// Convert italic: _text_ to <em>text</em>
	text = text.replace(/_(.*?)_/g, "<em>$1</em>");

	// Convert bold italic: __text__ to <strong><em>$1</em></strong>
	text = text.replace(/__(.*?)__/g, "<strong><em>$1</em></strong>");

	// Convert fixed font/code blocks: =text= to <code>text</code>
	text = text.replace(/=(.*?)=/g, "<code>$1</code>");

	// Convert links: [[URL][Link Text]] to <a href="URL">Link Text</a>
	text = text.replace(/\[\[(.*?)\]\[(.*?)\]\]/g, '<a href="$1">$2</a>');

	// // Convert verbatim
	// text = text.replace(/&lt;verbatim&gt;([\s\S]*?)&lt;\/verbatim&gt;/g, "<pre>$1</pre>");

	// Convert bulleted lists: * to <ul><li>...</li></ul>
	text = convertLists(text);

	// Convert numbered lists: 1. to <ol><li>...</li></ol>
	text = convertNumberedLists(text);

	// Convert tables: | Col1 | Col2 | Col3 | to <table>...</table>
	text = convertTables(text);

	// After escaping and parsing, restore the verbatim blocks
	verbatimBlocks.forEach((block, index) => {
		text = text.replace(`[[[[verbatim-block-${index}]]]]`, `<pre>${block}</pre>`);
	});

	// Finally, restore the HTML parts that were preserved
	htmlParts.forEach((html, index) => {
		text = text.replace(`[[[[html-part-${index}]]]]`, html);
	});

	// Replace line breaks with <br> for paragraphs
	text = text.replace(/\n\n/g, "<br><br>");

	return text;
}

// Helper function to escape HTML
function escapeHTML(text) {
	return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Helper function to convert bulleted lists
function convertLists(text) {
	const lines = text.split("\n");
	let inList = false;
	let result = "";

	lines.forEach((line) => {
		if (line.trim().startsWith("* ")) {
			if (!inList) {
				result += "<ul>";
				inList = true;
			}
			result += `<li>${line.trim().substring(2)}</li>`;
		} else {
			if (inList) {
				result += "</ul>";
				inList = false;
			}
			result += `${line}\n`;
		}
	});

	if (inList) {
		result += "</ul>";
	}

	return result;
}

// Helper function to convert numbered lists
function convertNumberedLists(text) {
	const lines = text.split("\n");
	let inList = false;
	let result = "";

	lines.forEach((line) => {
		if (line.trim().match(/^\d+\. /)) {
			if (!inList) {
				result += "<ol>";
				inList = true;
			}
			result += `<li>${line.trim().substring(line.indexOf(". ") + 2)}</li>`;
		} else {
			if (inList) {
				result += "</ol>";
				inList = false;
			}
			result += `${line}\n`;
		}
	});

	if (inList) {
		result += "</ol>";
	}

	return result;
}

// Helper function to convert tables with TWiki-specific rules
function convertTables(text) {
	const lines = text.split("\n");
	let inTable = false;
	let result = "";
	let rowBuffer = ""; // For handling multiline rows

	lines.forEach((line) => {
		// Ignore lines that don't look like table rows
		if (!line.trim().startsWith("|")) {
			if (inTable) {
				result += "</table>";
				inTable = false;
			}
			result += `${line}\n`;
			return;
		}

		// Handle multiline rows by buffering content
		if (line.trim().endsWith("\\")) {
			rowBuffer += line.trim().slice(0, -1); // Remove the backslash and keep the line content
			return;
		} else {
			rowBuffer += line.trim(); // Finish the row if no backslash
		}

		// Start the table if it's not already in progress
		if (!inTable) {
			result += "<table>";
			inTable = true;
		}

		// Parse the row and handle special cases like colspan, alignment, and escaping
		result +=
			"<tr>" +
			rowBuffer
				.split("|")
				.map((cell) => {
					cell = cell.trim();

					// Handle cell alignment based on spaces
					let alignment = "";
					if (cell.startsWith("*") && cell.endsWith("*")) {
						cell = `<strong>${cell.slice(1, -1)}</strong>`; // Bold
					}

					if (cell.startsWith(" ")) {
						const leadingSpaces = cell.match(/^\s*/)[0].length;
						const trailingSpaces = cell.match(/\s*$/)[0].length;

						if (leadingSpaces > trailingSpaces) {
							alignment = 'style="text-align: right;"';
						} else if (leadingSpaces === trailingSpaces && leadingSpaces >= 2) {
							alignment = 'style="text-align: center;"';
						}
					}

					// Handle colspan (multiple || in the row)
					if (cell === "") return ""; // Skip empty parts from multi-spanning cells

					const colspan = (cell.match(/\|+/g) || []).length;
					const colspanAttr = colspan > 1 ? `colspan="${colspan}"` : "";

					// Handle %VBAR% and %CARET% replacements
					cell = cell.replace(/%VBAR%|&#124;/g, "|").replace(/%CARET%|&#94;/g, "^");

					return `<td ${alignment} ${colspanAttr}>${cell}</td>`;
				})
				.join("") +
			"</tr>";

		rowBuffer = ""; // Reset the buffer after handling the row
	});

	if (inTable) {
		result += "</table>";
	}

	return result;
}

module.exports = {
	activate,
	deactivate,
};
