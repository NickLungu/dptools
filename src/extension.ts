// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as xml2js from 'xml2js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function formatXML(xmlString: string): string {
	let result = '';
	let indentLevel = 0;
  
	const lines = xmlString.split('\n');
	for (const line of lines) {
	  if (line.trim() === '') continue;
  
	  const openTags = line.match(/<[^/]+>/g);
	  const closeTags = line.match(/<\/[^>]+>/g);
	  const isEmptyElement = line.trim().endsWith('/>');
  
	  if (openTags) {
		result += ' '.repeat(indentLevel) + openTags[0];
		if (isEmptyElement) {
		  result += '\n';
		} else {
		  indentLevel += 2;
		}
	  }
  
	  if (closeTags) {
		indentLevel -= 2;
		if (!isEmptyElement) {
		  result = result.trim() + closeTags[0] + '\n';
		} else {
		  result += closeTags[0] + '\n';
		}
	  }
  
	  const textMatch = line.match(/<Text>(.*?)<\/Text>/);
	  if (textMatch) {
		const textContent = textMatch[1].trim();
		if (textContent) {
		  result = result.replace(/<\/Text>/, `>${textContent}</Text>`);
		}
	  }
	}
  
	return result.trim();
  }
  
  

function captureText() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.selection) {
        return editor.document.getText(editor.selection);
    }
    else {
        return '';
    }
}

interface Item {
    $: { Id: string };
}

interface List {
    Item: Item[];
}

function getIndentation(text: string): string {
    // Match the indentation at the start of the first line
    const match = text.match(/^[\t ]+/);

    // If there is a match, return the matched indentation
    if (match) {
        return match[0];
    }

    // If no indentation is found, return an empty string
    return '';
}

function replaceText(newText: string) {
    const editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit((editBuilder) => {
			editBuilder.replace(editor.selection, newText);
		});
	}
}

function sortList() {

	var xmlString = captureText();
    xml2js.parseString(xmlString, (err, result) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to parse XML data.');
            return;
        }

        const list: List = result.List;
        if (!list || !list.Item) {
            vscode.window.showErrorMessage('Invalid XML data format.');
            return;
        }

        const items: Item[] = list.Item;
        items.sort((a, b) => {
            const idA = parseInt(a.$.Id);
            const idB = parseInt(b.$.Id);
            return idA - idB;
        });

        // Convert the sorted list back to XML string
        const builder = new xml2js.Builder();
        const sortedXmlString = builder.buildObject(result);

        const lines = sortedXmlString.split('\n');

        // Remove the first line (element) from the array
        lines.shift();

        // Join the lines back into a single string with newline characters
        const modifiedString = lines.join('\n');
        replaceText(formatXML(modifiedString));
    });
}


export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dptools" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dptools.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from DPtools!');
	});

	let disposable2 = vscode.commands.registerCommand('dptools.sortList', sortList)

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
