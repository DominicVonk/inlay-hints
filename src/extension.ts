// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import php from './providers/php';
const Parser = require('web-tree-sitter');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	await Parser.init();
	const parser = new Parser;

	const isEnabled = () => vscode.workspace.getConfiguration("editor").get(
		"inlayHints.enabled",
	);

	context.subscriptions.push(await php(isEnabled, parser))

}

// this method is called when your extension is deactivated
export function deactivate() { }
