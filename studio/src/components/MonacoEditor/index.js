import React from 'react';
import MonacoEditor from 'react-monaco-editor';

const MONACOEditor = ({ value, onChange, language, width }) => {
  return (
    <MonacoEditor
      language={language}
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
      width={width ? width : 440}
      value={value}
      onChange={onChange}
    />
  );
};

export default MONACOEditor;
