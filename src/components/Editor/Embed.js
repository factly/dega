import axios from 'axios';
import './embed.css';
export default class Embed {
  constructor({ data, api, readOnly }) {
    this.api = api;
    this._data = {};
    this.readOnly = readOnly;
    this.nodes = {
      wrapper: null,
      container: null,
      progress: null,
      input: null,
      inputHolder: null,
      caption: null,
      captionHolder: null,
    };

    this.data = data;
  }

  static get toolbox() {
    return {
      title: 'Embed',
      icon:
        '<svg width="13" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"/></svg>',
    };
  }

  set data(data) {
    if (!(data instanceof Object)) {
      throw Error('Embed Tool data should be object');
    }

    const { html, meta, caption } = data;

    this._data = {
      html: html || this.data.html,
      meta: meta || this.data.meta,
      caption: caption || this.data.caption || '',
    };
  }

  get data() {
    return this._data;
  }

  render() {
    this.nodes.wrapper = this.make('div', this.CSS.baseClass);
    this.nodes.container = this.make('div', this.CSS.container);

    this.nodes.inputHolder = this.makeInputHolder();
    this.nodes.captionHolder = this.makeCaptionHolder();

    /**
     * If Tool already has data, render link preview, otherwise insert input
     */
    if (this.data.html) {
      const { html } = this.data;
      // this.nodes.container.innerHTML = html;
      this.setInnerHTML(this.nodes.container, html);
      this.nodes.container.appendChild(this.nodes.captionHolder);
    } else {
      this.nodes.container.appendChild(this.nodes.inputHolder);
    }
    this.nodes.wrapper.appendChild(this.nodes.container);

    return this.nodes.wrapper;
  }

  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,

      /**
       * Tool's classes
       */
      container: 'embed-tool',
      inputEl: 'embed-tool__input',
      captionEl: 'embed-tool__caption',
      inputHolder: 'embed-tool__input-holder',
      captionHolder: 'embed-tool__caption-holder',
      inputError: 'embed-tool__input-holder--error',
      progress: 'embed-tool__progress',
      progressLoading: 'embed-tool__progress--loading',
      progressLoaded: 'embed-tool__progress--loaded',
    };
  }
  makeInputHolder() {
    const inputHolder = this.make('div', this.CSS.inputHolder);

    this.nodes.progress = this.make('label', this.CSS.progress);
    this.nodes.input = this.make('div', [this.CSS.input, this.CSS.inputEl], {
      contentEditable: !this.readOnly,
    });

    this.nodes.input.dataset.placeholder = this.api.i18n.t(
      "Paste your Link here or type and press 'Enter'",
    );

    if (!this.readOnly) {
      this.nodes.input.addEventListener('paste', (event) => {
        this.startFetching(event);
      });

      this.nodes.input.addEventListener('keydown', (event) => {
        const [ENTER, A] = [13, 65];
        const cmdPressed = event.ctrlKey || event.metaKey;

        switch (event.keyCode) {
          case ENTER:
            event.preventDefault();
            event.stopPropagation();

            this.startFetching(event);
            break;
          case A:
            if (cmdPressed) {
              this.selectLinkUrl(event);
            }
            break;
          default:
            break;
        }
      });
    }

    inputHolder.appendChild(this.nodes.progress);
    inputHolder.appendChild(this.nodes.input);

    return inputHolder;
  }
  makeCaptionHolder() {
    const captionHolder = this.make('div', this.CSS.captionHolder);

    this.nodes.caption = this.make('div', [this.CSS.input, this.CSS.captionEl], {
      contentEditable: !this.readOnly,
      innerHTML: this.data.caption,
    });
    this.nodes.caption.dataset.placeholder = 'Caption';

    captionHolder.appendChild(this.nodes.caption);

    return captionHolder;
  }

  startFetching(event) {
    let url = this.nodes.input.textContent;

    if (event.type === 'paste') {
      url = (event.clipboardData || window.clipboardData).getData('text');
    }

    this.removeErrorStyle();
    this.fetchLinkData(url);
  }
  removeErrorStyle() {
    this.nodes.inputHolder.classList.remove(this.CSS.inputError);
    this.nodes.inputHolder.insertBefore(this.nodes.progress, this.nodes.input);
  }
  selectLinkUrl(event) {
    event.preventDefault();
    event.stopPropagation();

    const selection = window.getSelection();
    const range = new Range();

    const currentNode = selection.anchorNode.parentNode;
    const currentItem = currentNode.closest(`.${this.CSS.inputHolder}`);
    const inputElement = currentItem.querySelector(`.${this.CSS.inputEl}`);

    range.selectNodeContents(inputElement);

    selection.removeAllRanges();
    selection.addRange(range);
  }
  showProgress() {
    this.nodes.progress.classList.add(this.CSS.progressLoading);
  }
  hideProgress() {
    return new Promise((resolve) => {
      this.nodes.progress.classList.remove(this.CSS.progressLoading);
      this.nodes.progress.classList.add(this.CSS.progressLoaded);

      setTimeout(resolve, 500);
    });
  }
  applyErrorStyle() {
    this.nodes.inputHolder.classList.add(this.CSS.inputError);
    this.nodes.progress.remove();
  }
  async fetchLinkData(url) {
    this.showProgress();
    try {
      const response = await axios.get('/meta', {
        params: { url, type: 'iframely' },
      });
      this.onFetch(response);
    } catch (error) {
      this.fetchingFailed(this.api.i18n.t("Couldn't fetch the link data"));
    }
  }
  onFetch(response) {
    if (!response) {
      this.fetchingFailed(this.api.i18n.t("Couldn't get this link data, try the other one"));

      return;
    }

    const metaData = response.data.meta;
    const html = response.data.html;

    this.data = {
      ...response.data,
    };
    if (!metaData) {
      this.fetchingFailed(this.api.i18n.t("Couldn't get meta data from the server"));

      return;
    }
    if (!html) {
      this.fetchingFailed(this.api.i18n.t("Couldn't get html data from the server"));

      return;
    }

    this.hideProgress().then(() => {
      this.nodes.inputHolder.remove();
      // this.nodes.container.innerHTML = html;
      this.setInnerHTML(this.nodes.container, html);
      this.nodes.container.appendChild(this.nodes.captionHolder);
      return this.nodes.container;
    });
  }
  fetchingFailed(errorMessage) {
    this.api.notifier.show({
      message: errorMessage,
      style: 'error',
    });

    this.applyErrorStyle();
  }
  save() {
    const caption = this.nodes.captionHolder.querySelector(`.${this.CSS.captionEl}`);
    return { ...this.data, caption: caption.innerHTML };
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get sanitize() {
    return {
      html: true, // Allow HTML tags
    };
  }
  make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }
  setInnerHTML(elm, html) {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll('script')).forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
}
