import React from 'react';
import MonacoEditor from 'react-monaco-editor';

const MONACOEditor = ({ value, onChange }) => {
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
        theme: 'vs-dark',
      }}
      height="240"
      value={value}
      onChange={onChange}
    />
  );
};

export default MONACOEditor;
