import React, { useState, useEffect } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlockBasic from 'grapesjs-blocks-basic';
// import gjsUppy from 'grapesjs-uppy';
import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-uppy/dist/grapesjs-uppy.min.css';
import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs/dist/grapes.min.js';
import { useDispatch, useSelector } from 'react-redux';
import { createMedium } from '../../actions/media';
import gjsUppy from './Uppy';

//import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
// import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'

function PageBuilder({ visible, form, profile = false }) {
  const space_slug = useSelector((state) => state.spaces.details[state.spaces.selected].slug);
  const org_slug = useSelector(
    (state) => state.spaces.orgs.find((org) => org.spaces.includes(state.spaces.selected)).slug,
  );
  const [editor, setEditor] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const editor = grapesjs.init({
      container: '#gjs',
      height: '100vh',
      width: '100vw',
      plugins: [gjsBlockBasic, gjsPresetWebpage, gjsUppy],
      storageManager: {
        id: 'gjs-',
        type: 'local',
        autosave: true,
        storeComponents: true,
        storeStyles: true,
        storeHtml: true,
        storeCss: true,
        onStore: (data, editor) => {
          const pagesHtml = editor.Pages.getAll().map((page) => {
            const component = page.getMainComponent();
            return {
              html: editor.getHtml({ component }),
              css: editor.getCss({ component }),
              js: editor.getJs({ component }),
            };
          });
          console.log({ pagesHtml: pagesHtml });
          console.log({ grapejsData: data });
          form.setFieldsValue({
            page_html: {
              grapesjs: data,
              renderData: pagesHtml,
            },
          });
          // return { data, pagesHtml };
        },
        onLoad: (data) => {
          if (form.getFieldValue('page_html')) {
            let data = form.getFieldValue('page_html');
            return data.grapesjs;
          }
        },
      },
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '',
          },
          {
            id: 'tablet',
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            id: 'mobilePortrait',
            name: 'Mobile portrait',
            width: '320px',
            widthMedia: '575px',
          },
        ],
      },
      pluginsOpts: {
        gjsBlockBasic: {
          blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
          flexGrid: 1,
        },
        [gjsUppy]: {
          onUpload: (values) => {
            dispatch(createMedium(values, profile));

            // .then((medium) => {
            //   if (values.length === 1 || profile) {
            //     onMediaUpload(values, medium);
            //   }
            // });
          },
          space_slug: space_slug,
          org_slug: org_slug,
        },
        gjsPresetWebpage: {
          // //  blocksBasicOpts: {
          // //    blocks: ['column1', 'column2', 'column3', 'column3-7', 'text',     'link', 'image', 'video'],
          // //    flexGrid: 1,
          // //  },
          //  blocks: ['link-block', 'quote', 'text-basic'],
        },
      },
    });
    const script = function () {
      alert('Hi');
      fetch(
        'http://127.0.0.1:4455/.factly/dega/server/core/posts?format=1&page=1&limit=10&sort=desc',
        {
          credentials: 'include',
          headers: { 'X-Space': 1, 'Content-Type': 'application/json, text/plain, */*' },
        },
      )
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((data) => console.log(data));
      // `this` is bound to the component element
      console.log('the element', this);
    };

    // Define a new custom component
    editor.Components.addType('comp-with-js', {
      model: {
        defaults: {
          script,
          // Add some style, just to make the component visible
          style: {
            width: '100px',
            height: '100px',
            background: 'red',
          },
        },
      },
    });

    // Create a block for the component, so we can drop it easily
    editor.Blocks.add('test-block', {
      label: 'Test block',
      attributes: { class: 'fa fa-text' },
      content: { type: 'comp-with-js' },
    });

    //editor.runCommand('core:fullscreen');
    //  editor.Commands.add("saveDb", {
    //   run: (editor, sender) => {
    //     sender && sender.set("active");
    //     editor.store();
    //   },
    // });
    //  const panelManager = editor.Panels
    //  panelManager.addButton('options',{
    //   id: 'savebutton',
    //   //className: 'someClass',
    //   command: 'saveDb',
    //   label : 'Save Changes' ,
    //   attributes: { title: 'Save changes'},
    //   active: false,
    // });

    // editor.Storage.add('remote', {
    //   async load() {
    //     return await axios.get(`projects/${projectId}`);
    //   },

    //   async store(data) {
    //     return await axios.patch(`projects/${projectId}`, { data });
    //   },
    // });

    //console.log(editor.Commands.getAll())

    console.log(editor.getHtml());

    // console.log(panelManager.getPanels() , "Panels.getPanels()")
    setEditor(editor);
    return () => localStorage.removeItem('gjsProject');
  }, []);
  return <>{visible ? <div id="gjs"></div> : null}</>;
}
export default PageBuilder;
