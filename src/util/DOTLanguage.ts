import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

const keywords = [
    'strict',
    'digraph',
    'graph',
    'subgraph',
    'node',
    'cluster',
    'edge',
    'rankdir',
    'ranksep',
    'size',
    'ratio',
    'page',
    'pagedir',
    'center',
    'rotate',
    'compound',
    'concentrate',
    'ordering',
    'rank',
    'rankname',
    'ranktype',
    'pad',
    'layer',
    'layers',
    'layersep',
    'layerorder',
    'directed',
    'strict',
    'len',
    'splines',
    'overlap',
    'remincross',
    'sep',
    'outputorder',
    'outputmode',
    'pack',
    'packmode',
    'nodesep',
    'edgesep',
    'ranksep',
    'clusterrank',
    'headport',
    'tailport',
    'fontname',
    'fontsize',
    'fontcolor',
    'penwidth',
    'pencolor',
    'fillcolor',
    'style',
    'shape',
    'shapefile',
    'color',
    'colorscheme',
    'gradientangle',
    'backgroundcolor',
    'fontname',
    'fontsize',
    'fontcolor',
    'penwidth',
    'pencolor',
    'fillcolor',
    'style',
    'shape',
    'shapefile',
    'color',
    'colorscheme',
    'gradientangle',
    'backgroundcolor',
    'label',
    'labelloc',
    'labelfontname',
    'labelfontsize',
    'labelfontcolor',
    'labeljust',
    'labelloc',
    'pin',
    'pos',
    'width',
    'height',
    'fixedsize',
    'aspect',
    'nojustify',
    'label',
    'labelloc',
    'labelfontname',
    'labelfontsize',
    'labelfontcolor',
    'labeljust',
    'labelloc',
    'pin',
    'pos',
    'width',
    'height',
    'fixedsize',
    'aspect',
    'nojustify',
    'len',
    'weight',
    'minlen',
    'fontsize',
    'fontname',
    'fontcolor',
    'taillabel',
    'headlabel',
    'labelangle',
    'labeldistance',
    'decorate',
    'style',
    'headclip',
    'tailclip',
    'penwidth',
    'pencolor',
    'fillcolor',
    'dir',
    'arrowhead',
    'arrowtail',
    'arrowsize',
    'arrowcolor',
    'label',
    'labelloc',
    'labelfontname',
    '->',
    '--'
];

const tokenProvider: monacoEditor.languages.IMonarchLanguage = {
    // Set defaultToken to invalid to see what you do not tokenize yet
    // defaultToken: 'invalid',

    keywords: keywords,

    attributes: [
        'doublecircle', 'circle', 'diamond', 'box', 'point', 'ellipse', 'record',
        'inv', 'invdot', 'dot', 'dashed', 'dotted', 'filled', 'back', 'forward',
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,


    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // identifiers and keywords
            [/[a-zA-Z_\x80-\xFF][\w\x80-\xFF]*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@attributes': 'constructor',
                    '@default': 'identifier'
                }
            }],

            // whitespace
            { include: '@whitespace' },

            // html identifiers
            [/<(?!@symbols)/, { token: 'string.html.quote', bracket: '@open', next: 'html' }],

            // delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/@symbols/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'operator'
                }
            }],

            // delimiter
            [/[;,]/, 'delimiter'],

            // numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],    // nested comment
            ["\\*/", 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],

        html: [
            [/[^<>&]+/, 'string.html'],
            [/&\w+;/, 'string.html.escape'],
            [/&/, 'string.html'],
            [/</, { token: 'string.html.quote', bracket: '@open', next: '@push' }], //nested bracket
            [/>/, { token: 'string.html.quote', bracket: '@close', next: '@pop' }],
        ],

        string: [
            [/[^\\"&]+/, 'string'],
            [/\\"/, 'string.escape'],
            [/&\w+;/, 'string.escape'],
            [/[\\&]/, 'string'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
            [/#.*$/, 'comment'],
        ],
    },
};

const DOTLanguage = {
    keywords,
    tokenProvider
}

export default DOTLanguage;
