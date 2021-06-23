import React from 'react';
import MonacoEditor from 'react-monaco-editor';

const MONACOEditor = ({ value, onChange }) => {
 
  const editorDidMount = (editor) => {
    editor.focus();
  };

  return (
    <MonacoEditor
      language="json"
      options={{
        autoClosingBrackets: 'never',
        autoClosingQuotes: 'never',
        cursorBlinking: 'smooth',
        folding: true,
        lineNumbersMinChars: 4,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        readOnly: false,
        theme:"vs-dark"

      }}
      height="240"
      value={value}
      //onChange={debounce(300, onChange)}
      onChange={onChange}
      editorDidMount={editorDidMount}
    />
  );
};

export default MONACOEditor;
