const Uppy = require('@uppy/core');
const Dashboard = require('@uppy/dashboard');
const GoogleDrive = require('@uppy/google-drive');
const AwsS3 = require('@uppy/aws-s3');

class UppyUploader {
  constructor({ data, api, config }) {
    this.config = config;
    this.data = data;
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
      var imageItem = document.createElement('img');
      imageItem.src = this.data.url;
      imageItem.style.width = '100%';
      return imageItem;
    }
    var newItem = document.createElement('div');

    newItem.className = 'DashboardContainer';

    return newItem;
  }

  rendered() {
    if (!this.data.url) {
      const uppy = Uppy({
        debug: true,
        autoProceed: false,
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
          target: '.DashboardContainer',
          replaceTargetContent: true,
          showProgressDetails: true,
          height: 470,
          browserBackButtonClose: true,
        })
        .use(GoogleDrive, { target: Dashboard, companionUrl: 'http://localhost:3020' })
        .use(AwsS3, { companionUrl: 'http://localhost:3020' });

      uppy.on('complete', (result) => {
        const successful = result.successful[0];
        const upload = {};

        upload['alt_text'] = successful.meta.caption;
        upload['caption'] = successful.meta.caption;
        upload['description'] = successful.meta.caption;
        upload['dimensions'] = '100x100';
        upload['file_size'] = successful.size;
        upload['name'] = successful.meta.name;
        upload['slug'] = successful.meta.caption;
        upload['title'] = successful.meta.caption;
        upload['type'] = successful.meta.type;
        upload['url'] = successful.uploadURL;

        this.data = upload;
      });
    }
  }

  save(blockContent) {
    return this.data.url ? this.data : undefined;
  }
}

export default UppyUploader;
