// import stringify from 'json-stringify-pretty-compact';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
const schemas = [
  {
    schema: {
        type: 'object',
        properties: {
          q1: {
            enum: ['x1', 'x2']
          },
        },
      },
    uri: 'JsonSchema',
  },
  
];

export default function setupMonaco() {
  Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: false,
    enableSchemaRequest: true,
    schemas,
    validate: true,
  });

  Monaco.languages.json.jsonDefaults.setModeConfiguration({
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    tokens: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
  });

  Monaco.languages.registerDocumentFormattingEditProvider('json', {
    provideDocumentFormattingEdits: function (model, options, token) {
      return [
        {
          range: model.getFullModelRange(),
          text: JSON.parse(model.getValue()),
        },
      ];
    },
  });
}
