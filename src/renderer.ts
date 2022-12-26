import './index.css';
import VizExplorer from './viz/viz-explorer';
import 'svg-pan-zoom-container'
import { GraphBaseModel, NodeRef } from 'ts-graphviz';
import Page from "./react/Page.react";
import React from 'react';
import ReactDOM from 'react-dom/client';


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(Page));
