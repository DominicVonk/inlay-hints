import * as vscode from 'vscode';
import qwalker from '../qwalker';
const Parser = require('web-tree-sitter');

export default async (isEnabled: Function, parser: typeof Parser) => {
    const PHP = await Parser.Language.load(__dirname + '/tree-sitter-php.wasm');

    return vscode.languages.registerInlayHintsProvider('php', {
        provideInlayHints: (model, range, token): vscode.ProviderResult<vscode.InlayHint[]> => {

            return new Promise(async (r) => {
                if (!isEnabled()) {
                    return r([]);
                }
                parser.setLanguage(PHP);
                const text = model.getText();
                const tree = parser.parse(text);
                const output: vscode.InlayHint[] = [];
                let nodes: any = [];
                qwalker(tree.rootNode, function (currentNode: any) {

                    if (currentNode.type.endsWith('call_expression') || currentNode.type == 'object_creation_expression') {
                        let _args = currentNode.children.find((e: any) => e.type == 'arguments');
                        let args = _args.namedChildren;

                        if (args.length) {
                            nodes.push({
                                arguments: args,
                                start: _args.firstChild,
                                end: _args.lastChild,
                                endIndex: currentNode.endIndex,
                                startIndex: currentNode.startIndex,
                                endPosition: currentNode.endPosition,
                                startPosition: currentNode.startPosition
                            })
                        }
                    }
                });
                let startR = model.offsetAt(range.start);
                let endR = model.offsetAt(range.end);
                for (const node of nodes) {
                    if (node.start.startIndex > startR && node.start.startIndex < endR) {
                        let labels = await getLabelsOfNode(model, node);

                        for (let i = 0; i < node.arguments.length; i++) {
                            let arg = node.arguments[i];
                            if (labels.length > i) {
                                output.push(new vscode.InlayHint(
                                    new vscode.Position(arg.startPosition.row, arg.startPosition.column),
                                    labels[i],

                                    vscode.InlayHintKind.Parameter,
                                ))
                            }
                        }
                    }

                }


                r(output);
            });
        }
    })
}


async function getLabelsOfNode (model: vscode.TextDocument, node: any) {
    let signature: any = await vscode.commands.executeCommand(
        "vscode.executeSignatureHelpProvider",
        model.uri,
        new vscode.Position(node.start.endPosition.row, node.start.endPosition.column),
        '(');

    let labels = [];
    if (signature?.signatures?.length) {


        const _signature: any = signature.signatures[signature.activeSignature];

        for (const param of _signature.parameters) {
            let label = _signature.label.substring(param.label[0], param.label[1]);
            label = label.split('=')[0];
            label = label.substr(label.lastIndexOf('$'));
            labels.push(label.trim() + ':');
        }
    }
    return labels;
}