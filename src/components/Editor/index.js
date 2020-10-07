import React from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import RawTool from '@editorjs/raw';
import Table from '@editorjs/table';
import UppyUploader from './UppyUploader';
import Embed from '@editorjs/embed';
import { useSelector } from 'react-redux';

function Editor({ value, onChange }) {
  const editor_block = React.useRef(null);
  const space_slug = useSelector((state) => state.spaces.details[state.spaces.selected].slug);

  React.useEffect(() => {
    new EditorJS({
      holder: editor_block.current,
      tools: {
        header: Header,
        list: List,
        paragraph: Paragraph,
        quote: Quote,
        raw: RawTool,
        table: Table,
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              twitter: true,
              instagram: true,
              facebook: {
                regex: /https?:\/\/www.facebook.com\/([^/?&]*)\/(.*)/,
                embedUrl:
                  'https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/<%= remote_id %>&width=500',
                html:
                  "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 500px; max-height: 1000px;'></iframe>",
                height: 300,
                width: 600,
                id: (groups) => groups.join('/'),
              },
            },
          },
        },
        uppy: {
          class: UppyUploader,
          config: {
            space_slug: space_slug,
          },
        },
      },
      placeholder: 'Let`s write an awesome story!',
      onChange: (value) =>
        value.saver.save().then((value) => {
          onChange(value);
        }),
      data: value,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={editor_block}></div>;
}

export default Editor;
