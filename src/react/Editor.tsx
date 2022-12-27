import React from "react";
import MonacoEditor from "react-monaco-editor";

type EditorProps = {
    code: string,
    onChange: (code:string) => void,
}

class Editor extends React.Component<EditorProps> {
    render(): React.ReactNode {
        return (
            <MonacoEditor
                width="800"
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={this.props.code}
                options={}
                onChange={this.props.onChange}
            />
        );
    }
}

export default Editor;
