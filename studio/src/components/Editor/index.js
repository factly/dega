import React from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import RawTool from '@editorjs/raw';
import Table from '@editorjs/table';
import UppyUploader from './UppyUploader';
import Marker from '@editorjs/marker';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import { useSelector } from 'react-redux';
import Embed from './Embed';
import './index.css';

function Editor({
  value,
  onChange,
  style,
  basic = false,
  placeholder = 'Begin writing your post...',
}) {
  const editor_block = React.useRef(null);
  const space_slug = useSelector((state) => {
    return state.spaces.details[state.spaces.selected]?.slug;
  });
  const basicTools = {
    header: {
      class: Header,
      inlineToolbar: true,
      shortcut: 'CMD+OPTION+1',
    },
    list: {
      class: List,
      inlineToolbar: true,
      shortcut: 'CMD+OPTION+6',
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      shortcut: 'CMD+OPTION+0',
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      shortcut: 'CMD+OPTION+O',
    },
  };
  const editorTools = {
    ...basicTools,
    raw: {
      class: RawTool,
      shortcut: 'CMD+OPTION+R',
    },
    table: {
      class: Table,
      shortcut: 'CMD+OPTION+T',
    },
    code: {
      class: CodeTool,
      shortcut: 'CMD+OPTION+8',
    },
    delimiter: {
      class: Delimiter,
    },
    inlineCode: {
      class: InlineCode,
      shortcut: 'CMD+E',
    },
    marker: {
      class: Marker,
      shortcut: 'CMD+OPTION+H',
    },
    embed: {
      class: Embed,
      shortcut: 'CMD+OPTION+E',
    },
    uppy: {
      class: UppyUploader,
      config: {
        space_slug: space_slug,
      },
    },
  };

  React.useEffect(() => {
    const editor = new EditorJS({
      holder: editor_block.current,
      placeholder: placeholder,
      tools: basic ? basicTools : editorTools,
      onChange: (value) =>
        value.saver.save().then((value) => {
          onChange(value);
        }),
      data: value,
    });
    // return () =>
    //   editor.isReady.then(() => {
    //     editor.destroy();
    //     if (document.querySelectorAll('.ct')) {
    //       document.querySelectorAll('.ct').forEach((e) => e.remove());
    //     }
    //     return;
    //   });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div style={style ? style : null} ref={editor_block}></div>;
}

export default Editor;
