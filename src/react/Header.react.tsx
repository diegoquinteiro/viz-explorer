import * as React from "react";
import FileDescription from "../util/FileDescription";
import electronAPI from "../api/electron-api";

type HeaderProps = {
    onFileOpen: (fileDescription: FileDescription) => void;
};

class Header extends React.Component<HeaderProps> {
    constructor(props: HeaderProps) {
        super(props);
    }

    handleOpenFileClick = async (e: React.SyntheticEvent) => {
        const fileDescription = await electronAPI.openFile();
        this.props.onFileOpen(fileDescription);
    };

    render() {
        return (
            <section id="header">
                <h1>📁 GraphViz Explorer</h1>
                <button type="button" onClick={this.handleOpenFileClick}>Open a File</button>
            </section>
        );
    }
}
export default Header;
