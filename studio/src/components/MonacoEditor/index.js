import React from 'react';
import Editor from '@monaco-editor/react';

export const MonacoEditor = ({ value, onChange, language, width }) => {
  return (
    <Editor
      height={'240px'}
      width={width ? '100%' : '440px'}
      theme="vs-dark"
      autoClosingBrackets="auto"
      autoClosingQuotes="auto"
      cursorBlinking="smooth"
      folding={true}
      lineNumbersMinChars={4}
      minimap={{ enabled: false }}
      scrollBeyondLastLine={false}
      wordWrap="on"
      onChange={onChange}
      scrollbar={{
        alwaysConsumeMouseWheel: false,
      }}
      defaultLanguage={language}
      defaultValue={value}
    />
  );
};

export default MonacoEditor;




