import { StatusBarItem } from "vscode";
import * as vscode from "vscode";
import * as path from "path";
import { MistDocument } from "./mistDocument";


export class StatusBarManager {
    public static dataItem: StatusBarItem;

    public static initialize() {
        this.dataItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        this.dataItem.tooltip = "选择模版关联的数据";
        vscode.commands.registerCommand('mist.selectData', () => {
            let editor = vscode.window.activeTextEditor;
            let doc = MistDocument.getDocumentByUri(editor.document.uri);
            let datas = doc.getDatas();
            let items = datas.map(d => {
                let item = <vscode.QuickPickItem>{label: path.basename(d.file), detail: d.file, description: d.index > 0 ? `#${d.index + 1}` : null};
                return item;
            });
            vscode.window.showQuickPick(items).then(r => {
                doc.setData(r.detail, r.description ? parseInt(r.description.substr(1)) - 1 : 0);
                this.updateDataItemForDocument(doc);
            });
        });
    }

    private static updateDataItemForDocument(doc: MistDocument) {
        let datas = doc.getDatas();
        if (doc.getData()) {
            this.dataItem.text = '$(file-text) ' + doc.getData().description();
            this.dataItem.command = 'mist.selectData';
        }
        else if (datas && datas.length > 0) {
            this.dataItem.text = '$(file-text) Select Data...';
            this.dataItem.command = 'mist.selectData';
        }
        else {
            this.dataItem.text = '$(file-text) [No Data]';
            this.dataItem.command = null;
        }
    }

    public static onDidChangeActiveTextEditor(editor: vscode.TextEditor) {
        if (editor.document.languageId === 'mist') {
            let doc = MistDocument.getDocumentByUri(editor.document.uri);
            this.updateDataItemForDocument(doc);
            this.dataItem.show();
        }
        else {
            this.dataItem.hide();
        }
    }
}