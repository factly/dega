import React from 'react';
import MonacoEditor from 'react-monaco-editor';

const MONACOEditor = ({ value, onChange, language, width }) => {
  console.log(width , "width")
  return (
    <MonacoEditor
      language={language}
      options={{
        autoClosingBrackets: 'auto',
        autoClosingQuotes: 'auto',
        cursorBlinking: 'smooth',
        folding: true,
        lineNumbersMinChars: 4,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        theme: 'vs-dark',
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
      }}
      height="240"
      width={width ? width : 440}
      value={value}
      onChange={onChange}
    />
  );
};

// class MONACOEditor extends React.Component {
//   constructor(props) {
//     super(props);
//   }
//   render() {
//    const { value, onChange, language, width } = this.props
//   console.log(width , "width")

//     return (
//       <MonacoEditor
//       language={language}
//       options={{
//         autoClosingBrackets: 'auto',
//         autoClosingQuotes: 'auto',
//         cursorBlinking: 'smooth',
//         folding: true,
//         lineNumbersMinChars: 4,
//         minimap: { enabled: false },
//         scrollBeyondLastLine: false,
//         wordWrap: 'on',
//         theme: 'vs-dark',
//         scrollbar: {
//           alwaysConsumeMouseWheel: false,
//         },
//       }}
//       height="240"
//       width={width ? width : 440}
//         value={value}
//         onChange={onChange}
//       />
//     );
//   }
// }



export default MONACOEditor;
