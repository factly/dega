import Uppy from '@uppy/core';
import GoogleDrive from '@uppy/google-drive';
import { checker, maker } from '../../../utils/sluger';
import ImageEditor from '@uppy/image-editor';
import AwsS3 from '@uppy/aws-s3';
import Url from '@uppy/url';
import Dashboard from '@uppy/dashboard';
import { useSelector } from 'react-redux';

export default (editor, opts = {}) => {
  const options = {
    ...{
      // default options
      // Custom button element which triggers Uppy modal
      btnEl: '',

      // Text for the button in case the custom one is not provided
      btnText: 'Upload images',

      // File picker theme
      theme: 'dark',

      // Uppys's options
      uppyOpts: {
        autoProceed: false,
        restrictions: {
          maxFileSize: 2000000,
          maxNumberOfFiles: 10,
          minNumberOfFiles: 1,
          allowedFileTypes: ['image/*'],
        },
      },

      // Uppy dashboard options
      dashboardOpts: {
        showProgressDetails: true,
        note: 'Images only, 1–10 files, up to 2 MB',
        height: 470,
        metaFields: [
          { id: 'name', name: 'Name', placeholder: 'file name' },
          { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' },
          { id: 'alt_text', name: 'Alt Text', placeholder: 'describe what the image is content' },
        ],
        browserBackButtonClose: false,
      },

      // Companion URL
      companionUrl: 'https://companion.uppy.io',

      // Tus URL
      endpoint: 'https://tusd.tusdemo.net/files/',

      // On complete upload callback
      // assets - Array of assets, eg. [{url:'...', filename: 'name.jpeg', ...}]
      // for debug: console.log(assets);
      onComplete(assets) {
        console.log('successful files:', assets);
      },

      // On failed upload callback
      // assets - Array of assets, eg. [{url:'...', filename: 'name.jpeg', ...}]
      // for debug: console.log(assets);
      onFailed(assets) {
        console.log('failed files:', assets);
      },
      // dega specific profile
      profile: false,
      space_slug: null,
      org_slug: null,

      //redux callback for on complete
      onUpload(assets) {
        console.log('uploaded files:', assets);
      },

      // Set plugins
      googledrive: false,
      dropbox: false,
      instagram: false,
      facebook: false,
      onedrive: false,
      unsplash: false,
      webcam: true,
      screencapture: true,
    },
    ...opts,
  };

  let btnEl;
  let uppy;
  const pfx = editor.getConfig('stylePrefix');
  const { $ } = editor;
  const { uppyOpts, dashboardOpts, companionUrl, endpoint } = options;

  // When the Asset Manager modal is opened
  editor.on('run:open-assets', () => {
    const modal = editor.Modal;
    const modalBody = modal.getContentEl();
    const uploader = modalBody.querySelector(`.${pfx}am-file-uploader`);
    const assetsHeader = modalBody.querySelector(`.${pfx}am-assets-header`);
    const assetsBody = modalBody.querySelector(`.${pfx}am-assets-cont`);

    uploader && (uploader.style.display = 'none');
    assetsBody.style.width = '100%';

    // Instance button if not yet exists
    if (!btnEl) {
      btnEl = options.btnEl
        ? $(options.btnEl)
        : $(`<button class="${pfx}btn-prim ${pfx}btn-uppy">
                    ${options.btnText}
                </button>`);
    }

    if (!uppy) {
      const slug = options.profile ? options.org_slug : options.space_slug;
      const uppy = Uppy({
        id: 'uppy-media',
        meta: { type: 'avatar' },
        restrictions: {
          allowedFileTypes: ['image/*'],
        },
        autoProceed: false,
        onBeforeUpload: (files) => {
          const updatedFiles = {};

          Object.keys(files).forEach((fileID) => {
            const fileName = files[fileID].meta.name.replace(/\.[^/.]+$/, '');
            const name = checker.test(fileName) ? files[fileID].meta.name : maker(fileName);
            updatedFiles[fileID] = {
              ...files[fileID],
              file_name: name,
              meta: {
                ...files[fileID].meta,
                name:
                  slug +
                  '/' +
                  new Date().getFullYear() +
                  '/' +
                  new Date().getMonth() +
                  '/' +
                  Date.now().toString() +
                  '_' +
                  name,
              },
            };
          });
          return updatedFiles;
        },
      })
        .use(Dashboard, {
          theme: options.theme,
          trigger: btnEl.get(0),
          ...dashboardOpts,
        })
        .use(AwsS3, { companionUrl: window.REACT_APP_COMPANION_URL })
        .use(Url, { companionUrl: window.REACT_APP_COMPANION_URL })
        .use(GoogleDrive, { companionUrl: window.REACT_APP_COMPANION_URL })
        .use(ImageEditor, {
          id: 'ImageEditor',

          cropperOptions: {
            viewMode: 1,
            background: true,
            autoCropArea: 1,
            responsive: true,
          },
          companionUrl: window.REACT_APP_COMPANION_URL,
        });
      uppy.on('file-added', (file) => {
        const data = file.data;
        const url = data.thumbnail ? data.thumbnail : URL.createObjectURL(data);
        const image = new Image();
        image.src = url;
        image.onload = () => {
          uppy.setFileMeta(file.id, { width: image.width, height: image.height });
          URL.revokeObjectURL(url);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
        };
      });
      uppy.on('complete', (result) => {
        const uploadList = result.successful.map((successful) => {
          const upload = {};
          const { meta } = successful;
          upload['alt_text'] = meta.alt_text ? meta.alt_text : successful.file_name;
          upload['caption'] = meta.caption;
          upload['description'] = meta.caption;
          upload['dimensions'] = `${meta.width}x${meta.height}`;
          upload['file_size'] = successful.size;
          upload['name'] = successful.file_name;
          upload['slug'] = successful.file_name;
          upload['title'] = meta.caption ? meta.caption : '';
          upload['type'] = meta.type;
          upload['url'] = {};
          upload['url']['raw'] = successful.uploadURL;
          return upload;
        });
        options.onUpload(uploadList);
        addAssets(uploadList);
      });
    }

    assetsHeader.appendChild(btnEl.get(0));
  });

  /**
   * Add new assets to the editor
   * @param {Array} files
   */
  const addAssets = (files) => {
    const urls = files.map((file) => {
      return {
        id: file.id,
        name: file.name,
        size: file.size,
        src: file.url.raw,
      };
    });
    return editor.AssetManager.add(urls);
  };
};
