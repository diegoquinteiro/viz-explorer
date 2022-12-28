import React from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import DOTLanguage from "../util/DOTLanguage";
import electronAPI from "../api/electron-api";
import { ResponsiveMonacoEditor } from "responsive-react-monaco-editor";

type EditorProps = {
    code: string,
    onChange: (code:string) => void,
}

class Editor extends React.Component<EditorProps> {
    async editorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) {
        monaco.languages.register({ id: "dot" });
        monaco.languages.setMonarchTokensProvider("dot", DOTLanguage.tokenProvider);
        electronAPI.onThemeUpdated(this.handleThemeChange.bind(this, monaco));
        await this.handleThemeChange(monaco);
    }
    async handleThemeChange(editor:typeof monacoEditor) {
        let theme = await electronAPI.getNativeTheme();
        if (theme == 'dark') {
            monaco.editor.setTheme("vs-dark");
        }
        else {
            monaco.editor.setTheme("vs-light");
        }
    }
    render(): React.ReactNode {
        return <section className="editor">
            <div>
            <ResponsiveMonacoEditor
                language="dot"
                theme="vs-dark"
                value={this.props.code}
                options={{
                    minimap: {
                        enabled: false,
                    }
                }}
                onChange={this.props.onChange}
                editorDidMount={this.editorDidMount.bind(this)}
            />
            </div>
        </section>;
    }
}

export default Editor;
