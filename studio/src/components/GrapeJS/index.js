import React, { useState, useEffect } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlockBasic from 'grapesjs-blocks-basic';
import 'grapesjs/dist/css/grapes.min.css';
import './Uppy/grapesjs-uppy.min.css';
import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs/dist/grapes.min.js';
import './grapesjs.css';
import { useDispatch, useSelector } from 'react-redux';
import { createMedium } from '../../actions/media';
import gjsUppy from './Uppy';

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
          form.setFieldsValue({
            page_html: {
              grapesjs: data,
              renderData: pagesHtml,
            },
          });
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
          },
          space_slug: space_slug,
          org_slug: org_slug,
        },
      },
    });
    setEditor(editor);
    return () => localStorage.removeItem('gjsProject');
  }, []);
  return <>{visible ? <div id="gjs"></div> : null}</>;
}
export default PageBuilder;
