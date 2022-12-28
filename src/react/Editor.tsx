import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import DOTLanguage from "../util/DOTLanguage";

type EditorProps = {
    code: string,
    onChange: (code:string) => void,
}

class Editor extends React.Component<EditorProps> {
    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        let keywords = ["strict", "graph", "digraph", ]
        monaco.languages.register({ id: "dot" });
        monaco.languages.setMonarchTokensProvider("dot", DOTLanguage.tokenProvider);
    }
    render(): React.ReactNode {
        return (
            <MonacoEditor
                width="800"
                height="100%"
                language="dot"
                theme="vs-dark"
                value={this.props.code}
                options={}
                onChange={this.props.onChange}
                editorDidMount={this.editorDidMount}
            />
        );
    }
}

export default Editor;
