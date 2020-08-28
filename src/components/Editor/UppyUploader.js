import { MEDIA_API } from '../../constants/media';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/url/dist/style.css';
const Uppy = require('@uppy/core');
const Dashboard = require('@uppy/dashboard');
const GoogleDrive = require('@uppy/google-drive');
const Url = require('@uppy/url');
const AwsS3 = require('@uppy/aws-s3');
const axios = require('axios');

class UppyUploader {
  constructor({ data, api, config }) {
    this.config = config;
    this.data = data;
    this.nodes = {};
    this.blockIndex = api.blocks.getCurrentBlockIndex();
    this.api = api;

    this.nodes.wrapper = document.createElement('div');
    this.nodes.wrapper.id = 'Uploader-' + this.blockIndex;

    var uploader = document.createElement('div');
    uploader.id = 'DashboardContainer-' + this.blockIndex;

    var imageContainer = document.createElement('img');
    imageContainer.id = 'ImageContainer';
    imageContainer.style.width = '100%';

    this.nodes.wrapper.appendChild(uploader);
    this.nodes.wrapper.appendChild(imageContainer);
  }
  static get toolbox() {
    return {
      title: 'Image',
      icon:
        '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }
  render() {
    if (this.data.url) {
      this.nodes.wrapper.children[1].src = this.data.url;
    }
    return this.nodes.wrapper;
  }

  rendered() {
    if (!this.data.url) {
      const uppy = Uppy({
        debug: true,
        autoProceed: true,
        restrictions: {
          maxNumberOfFiles: 1,
          minNumberOfFiles: 1,
          allowedFileTypes: ['image/*'],
        },
        onBeforeUpload: (files) => {
          const updatedFiles = {};
          Object.keys(files).forEach((fileID) => {
            updatedFiles[fileID] = {
              ...files[fileID],
              meta: {
                ...files[fileID].meta,
                name:
                  'uppy/' +
                  this.config.space_slug +
                  '/' +
                  new Date().getFullYear() +
                  '/' +
                  new Date().getMonth() +
                  '/' +
                  Date.now().toString() +
                  '_' +
                  files[fileID].meta.name,
              },
            };
          });
          return updatedFiles;
        },
      })
        .use(Dashboard, {
          trigger: '.UppyModalOpenerBtn',
          inline: true,
          target: '#' + this.nodes.wrapper.children[0].id,
          replaceTargetContent: true,
          showProgressDetails: true,
          height: 470,
          browserBackButtonClose: true,
        })
        .use(GoogleDrive, { target: Dashboard, companionUrl: window.REACT_APP_COMPANION_URL })
        .use(Url, { target: Dashboard, companionUrl: window.REACT_APP_COMPANION_URL })
        .use(AwsS3, { companionUrl: window.REACT_APP_COMPANION_URL });

      uppy.on('complete', (result) => {
        const successful = result.successful[0];
        const upload = {};
        upload['alt_text'] = successful.meta.caption;
        upload['caption'] = successful.meta.caption;
        upload['description'] = successful.meta.caption;
        upload['dimensions'] = '100x100';
        upload['file_size'] = successful.size;
        upload['name'] = successful.meta.name;
        upload['slug'] = successful.response.body.key;
        upload['title'] = successful.meta.caption ? successful.meta.caption : ' ';
        upload['type'] = successful.meta.type;
        upload['url'] = successful.uploadURL;

        axios
          .post(MEDIA_API, upload)
          .then((res) => {
            this.data = res.data;
            this.nodes.wrapper.children[0].style.display = 'none';
            this.nodes.wrapper.children[1].src = this.data.url;
          })
          .catch((error) => {
            this.api.notifier.show({
              message: error.message,
              style: 'error',
            });
          });
      });
    }
  }

  save(blockContent) {
    return this.data;
  }
}

export default UppyUploader;
