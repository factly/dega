import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
const schemas = [
  {
    schema: {
      type: 'object',
      properties: {
        q1: {
          enum: ['x1', 'x2'],
        },
      },
    },
    uri: 'JsonSchema',
  },
];

export default function setupMonaco() {
  var fileCounter = 0;
  var editorArray = [];
  // define editor theme
  Monaco.editor.defineTheme('myTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ background: 'EDF9FA' }],
  });
  Monaco.editor.setTheme('myTheme');

  // Create a new editor
  function newEditor(container_id, code, language) {
    var model = Monaco.editor.createModel(code, language);
    var editor = Monaco.editor.create(document.getElementById(container_id), {
      model: model,
    });
    editorArray.push(editor);
    return editor;
  }

  // Create a new div
  function addNewEditor(code, language) {
    var new_container = document.createElement('DIV');
    new_container.id = 'container-' + fileCounter.toString(10);
    new_container.className = 'container';
    document.getElementById('root').appendChild(new_container);
    newEditor(new_container.id, code, language);
    fileCounter += 1;
  }

  addNewEditor(null, 'html');
  addNewEditor(null, 'javascript');

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

  Monaco.languages.html.htmlDefaults.setModeConfiguration({
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
}
