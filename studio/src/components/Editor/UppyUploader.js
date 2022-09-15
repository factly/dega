import React from 'react';
import { MEDIA_API } from '../../constants/media';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/url/dist/style.css';
import 'antd/dist/antd.css';
import { Empty } from 'antd';
import ReactDOMServer from 'react-dom/server';
import Tunes from './Tunes';
import { make } from './utils';

const Uppy = require('@uppy/core');
const Dashboard = require('@uppy/dashboard');
const GoogleDrive = require('@uppy/google-drive');
const Url = require('@uppy/url');
const AwsS3 = require('@uppy/aws-s3');
const axios = require('axios');

const style = {
  imgContainer: 'border-radius: 3px;  overflow: hidden; margin-bottom:10px;',
  img: 'max-width: 100%; vertical-align:bottom; display:block;',
  container: {
    stretched: ' ',
    withBackground: 'padding: 15px; background: white;',
    withBorder: 'border: 1px solid #e8e8eb;',
  },
  withBorder: '',
  withBackground: 'max-width:60%; margin:0 auto;',
  stretched: 'width:100%;',
};

class UppyUploader {
  constructor({ data, api, config }) {
    this.config = config;
    this.data = data;
    this.nodes = {};
    this.blockIndex = api.blocks.getCurrentBlockIndex();
    this.api = api;
    this.query = {
      page: 1,
      limit: 8,
    };

    this.tunes = new Tunes({
      api,
      actions: this.config.actions,
      onChange: (tuneName) => this.tuneToggled(tuneName),
    });
    Tunes.tunes.forEach(({ name: tune }) => {
      const value =
        typeof data[tune] !== 'undefined' ? data[tune] === true || data[tune] === 'true' : false;
      this.setTune(tune, value);
    });
    this.total = 0;
    this.mediaData = [];
    this.nodes.wrapper = document.createElement('div');
    this.nodes.wrapper.setAttribute('style', style.imgContainer);
    this.nodes.wrapper.id = 'Uploader-' + this.blockIndex;

    var uploader = document.createElement('div');
    uploader.id = 'DashboardContainer-' + this.blockIndex;

    var image = document.createElement('img');
    image.setAttribute('style', style.img);
    image.id = 'Image-' + this.blockIndex;

    this.nodes.wrapper.appendChild(image);
    if (!this.data.url) {
      this.getMediaList(this.query);
      this.createRadioButtons();
    }
    this.nodes.wrapper.appendChild(uploader);
  }

  tuneToggled(tuneName) {
    Tunes.tunes.forEach(({ name: tune }) => {
      if (this.data[tune] === true && tune !== tuneName) {
        this.data[tune] = false;
        const button = this.tunes.buttons.find((el) => el.dataset.tune === tune);
        button.classList.toggle(
          this.tunes.CSS.buttonActive,
          !button.classList.contains(this.tunes.CSS.buttonActive),
        );
      }
    });
    this.setTune(tuneName, !this.data[tuneName]);
  }
  setTune(tuneName, value) {
    this.data[tuneName] = value;
    this.applyTune(tuneName, value);
    if (tuneName === 'stretched') {
      /**
       * Wait until the API is ready
       */
      Promise.resolve()
        .then(() => {
          const blockId = this.api.blocks.getCurrentBlockIndex();

          this.api.blocks.stretchBlock(blockId, value);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }
  applyTune(tuneName, status) {
    if (document.getElementById(`Image-${this.blockIndex}`) && status === false) {
      document.getElementById(`Image-${this.blockIndex}`).setAttribute('style', style.img);
      document
        .getElementById(`Uploader-${this.blockIndex}`)
        .setAttribute('style', style.imgContainer);
    }
    if (document.getElementById(`Image-${this.blockIndex}`) && status) {
      document
        .getElementById(`Image-${this.blockIndex}`)
        .setAttribute('style', `${style.img} ${style[tuneName]}`);
      document
        .getElementById(`Uploader-${this.blockIndex}`)
        .setAttribute('style', `${style.imgContainer} ${style.container[tuneName]}`);
    }
  }
  renderSettings() {
    return this.tunes.render(this.data);
  }
  createRadioButtons() {
    const radioGroup = make('div', ['ant-radio-group', 'ant-radio-group-solid'], {
      style: 'margin-bottom: 8px;width:750px;margin-left:8px',
    });
    const list = make('input', 'ant-radio-button-input', {
      type: 'radio',
      id: 'opt1',
      value: 'list',
      name: 'tabOption',
      checked: true,
    });
    const label1 = make('label', ['ant-radio-button-wrapper', 'ant-radio-button-wrapper-checked']);
    const label2 = make('label', 'ant-radio-button-wrapper');
    const uploader = make('input', 'ant-radio-button-input', {
      type: 'radio',
      id: 'opt2',
      value: 'uploader',
      name: 'tabOption',
    });
    const searchInput = make('input', 'ant-input', {
      placeholder: 'Search Media',
      style: 'margin-bottom: 8px;margin-top: 8px',
      type: 'text',
      id: 'searchBar',
    });
    searchInput.addEventListener('input', (e) => {
      if (e.target.value) {
        const newQuery = { ...this.query, q: e.target.value };
        this.getMediaList(newQuery);
      } else {
        this.getMediaList(this.query);
      }
    });
    list.addEventListener('click', (event) => {
      label2.className = 'ant-radio-button-wrapper';
      label1.className = 'ant-radio-button-wrapper ant-radio-button-wrapper-checked';
      document
        .getElementById('searchBar')
        .setAttribute('style', 'margin-bottom: 8px;margin-top: 8px');
      this.getMediaList(this.query);
    });
    label1.innerHTML = 'List';
    uploader.addEventListener('click', (event) => {
      label1.className = 'ant-radio-button-wrapper';
      label2.className = 'ant-radio-button-wrapper ant-radio-button-wrapper-checked';
      document.getElementById('searchBar').setAttribute('style', 'display : none');
      this.getDashboard();
    });
    label2.innerHTML = 'Upload';
    label1.appendChild(list);
    label2.appendChild(uploader);
    radioGroup.appendChild(label1);
    radioGroup.appendChild(label2);
    radioGroup.appendChild(searchInput);
    this.nodes.wrapper.appendChild(radioGroup);
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
      Tunes.tunes.forEach(({ name: tune }) => {
        if (this.data[tune] === true) {
          this.nodes.wrapper.setAttribute(
            'style',
            `${style.imgContainer} ${style.container[tune]}`,
          );
          this.nodes.wrapper.children[0].setAttribute('style', `${style.img} ${style[tune]}`);
        }
      });
      this.nodes.wrapper.children[0].src = this.data.url?.[window.REACT_APP_IMG_URL_PROP];
    }
    return this.nodes.wrapper;
  }

  handlePaginationButtonCLick(value, query) {
    const newQuery = {
      page: query.page + value,
      limit: 8,
    };
    this.getMediaList(newQuery);
  }

  createPagniation(query, total) {
    function paginationClick(current, obj) {
      const newQuery = {
        page: current,
        limit: 8,
      };
      obj.getMediaList(newQuery);
    }

    const ul = make('ul', 'ant-pagination', { style: 'margin-bottom:8px' });
    ul.unselectable = 'unselectable';
    const previous = make('li', 'ant-pagination-prev');
    const prevButton = make('button', 'ant-pagination-item-link', { type: 'button' });
    prevButton.tabindex = '-1';
    previous.addEventListener('click', () => {
      if (query.page > 1) {
        this.handlePaginationButtonCLick(-1, query);
      }
    });
    if (query.page <= 1) {
      prevButton.disabled = true;
      previous.className = 'ant-pagination-prev ant-pagination-disabled';
    }
    prevButton.innerHTML =
      '<span role="img" aria-label="left" class="anticon anticon-left"> <svg viewBox="64 64 896 896" focusable="false" class="" data-icon="left" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path></svg></span>';
    previous.appendChild(prevButton);
    ul.appendChild(previous);

    const last = Math.ceil(total / query.limit);
    for (var i = 1; i <= last; i++) {
      (function (query, obj) {
        const li = document.createElement('li');
        let liClassName = 'ant-pagination-item ant-pagination-item-' + 'i';
        if (i === query.page) {
          liClassName = liClassName + ' ant-pagination-item-active';
        }
        li.className = liClassName;
        li.title = i;
        li.innerHTML = i;
        var current = i;
        li.addEventListener(
          'click',
          function () {
            paginationClick(current, obj);
          },
          false,
        );
        ul.appendChild(li);
      })(query, this);
    }
    const next = make('li', 'ant-pagination-next');
    const nextButton = make('button', 'ant-pagination-item-link', { type: 'button' });
    nextButton.addEventListener('click', () => {
      if (query.page < last) {
        this.handlePaginationButtonCLick(1, query);
      }
    });
    if (query.page >= last) {
      nextButton.disabled = true;
      next.className = 'ant-pagination-next ant-pagination-disabled';
    }
    nextButton.innerHTML =
      '<span role="img" aria-label="right" class="anticon anticon-right"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="right" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path></svg></span>';
    nextButton.tabindex = '-1';
    next.appendChild(nextButton);
    ul.appendChild(next);
    return ul;
  }

  createDisplayList(data, query, total) {
    function handleClick(imageDetails, obj) {
      obj.data = imageDetails;
      obj.nodes.wrapper.children[0].src = imageDetails.url?.[window.REACT_APP_IMG_URL_PROP];
      obj.nodes.wrapper.children[2].style.display = 'none';
      obj.nodes.wrapper.children[1].style.display = 'none';
    }
    const listDiv = make('div', ['ant-list', 'ant-list-split', 'ant-list-grid'], {
      style: 'width:750px',
      id: 'DashboardContainer-' + this.blockIndex,
    });
    const rowDiv = make('div', 'ant-row', {
      style: 'margin-left:-18px;margin-right:-18px',
    });

    for (var i = 0; i < data.length; i++) {
      (function (obj) {
        const image = document.createElement('img');
        image.src = data[i].url?.[window.REACT_APP_IMG_URL_PROP];
        image.height = '154';
        image.width = '154';
        var imageDetails = data[i];
        image.addEventListener(
          'click',
          function () {
            handleClick(imageDetails, obj);
          },
          false,
        );

        const columnDiv = document.createElement('div');
        columnDiv.className = 'ant-col';
        columnDiv.setAttribute('style', 'padding-left:18px;padding-right:18px;flex:1 1 auto');

        const imageDiv = document.createElement('div');
        imageDiv.className = 'ant-list-item';
        imageDiv.appendChild(image);

        const newDiv = document.createElement('div');
        newDiv.setAttribute('style', 'width:25%;max-width:25%');

        columnDiv.appendChild(imageDiv);
        newDiv.appendChild(columnDiv);
        rowDiv.appendChild(newDiv);
      })(this);
    }
    listDiv.appendChild(rowDiv);
    listDiv.appendChild(this.createPagniation(query, total));
    listDiv.setAttribute('style', 'margin-left:8px');
    this.nodes.wrapper.replaceChild(listDiv, this.nodes.wrapper.children[2]);
  }
  getEmptyDataComponent() {
    const noDataFound = ReactDOMServer.renderToString(
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
    );
    const emptyDataDiv = make('div', null, {
      id: 'DashboardContainer-' + this.blockIndex,
    });
    emptyDataDiv.innerHTML = noDataFound;
    this.nodes.wrapper.replaceChild(emptyDataDiv, this.nodes.wrapper.children[2]);
  }

  getMediaList(query) {
    axios
      .get(MEDIA_API, {
        params: query,
      })
      .then((response) => {
        if (response.data.nodes.length < 1) {
          this.getEmptyDataComponent();
        } else {
          this.mediaData = response.data.nodes;
          this.total = response.data.total;
          this.createDisplayList(response.data.nodes, query, response.data.total);
        }
      });
  }

  getDashboard() {
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
              fileName: files[fileID].meta.name,
              meta: {
                ...files[fileID].meta,
                name:
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
          target: '#' + this.nodes.wrapper.children[2].id,
          replaceTargetContent: true,
          showProgressDetails: true,
          height: 470,
          browserBackButtonClose: true,
        })
        .use(GoogleDrive, { target: Dashboard, companionUrl: window.REACT_APP_COMPANION_URL })
        .use(Url, { target: Dashboard, companionUrl: window.REACT_APP_COMPANION_URL })
        .use(AwsS3, { companionUrl: window.REACT_APP_COMPANION_URL });
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
        const successful = result.successful[0];
        const { meta } = successful;
        const upload = {};
        upload['alt_text'] = meta.caption;
        upload['caption'] = meta.caption;
        upload['description'] = meta.caption;
        upload['dimensions'] = `${meta.width}x${meta.height}`;
        upload['file_size'] = successful.size;
        upload['name'] = successful.fileName;
        upload['slug'] = successful.response.body.key;
        upload['title'] = meta.caption ? meta.caption : ' ';
        upload['type'] = successful.meta.type;
        upload['url'] = {};
        upload['url']['raw'] = successful.uploadURL;
        axios
          .post(MEDIA_API, [upload])
          .then((res) => {
            this.data = res.data.nodes[0];
            this.nodes.wrapper.children[2].style.display = 'none';
            this.nodes.wrapper.children[1].style.display = 'none';
            this.nodes.wrapper.children[0].src = this.data.url?.[window.REACT_APP_IMG_URL_PROP];
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
  save() {
    return this.data;
  }
}

export default UppyUploader;
