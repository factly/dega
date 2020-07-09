import React from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import UppyUploader from './uppy.js';
function Editor({ value, onChange }) {
  const editor_block = React.useRef(null);

  React.useEffect(() => {
    new EditorJS({
      holder: editor_block.current,
      tools: {
        header: Header,
        list: List,
        paragraph: Paragraph,
        quote: Quote,
        table: Table,
        uppy: {
          class: UppyUploader,
          config: {
            space_slug: 'abc',
          },
        },
      },
      onChange: (value) =>
        value.saver.save().then((value) => {
          console.log(value);
          onChange(value);
        }),
      data: value,
    });
  }, []);

  return <div ref={editor_block}></div>;
}

export default Editor;
