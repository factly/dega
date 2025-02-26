import React from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  width?: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language,
  width,
}) => {
  return (
    <Editor
      height={"240px"}
      width={width ? "100%" : "440px"}
      theme="vs-dark"
      options={{
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        cursorBlinking: "smooth",
        folding: true,
        lineNumbersMinChars: 4,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
      }}
      onChange={onChange}
      defaultLanguage={language}
      defaultValue={value}
    />
  );
};

export default MonacoEditor;
