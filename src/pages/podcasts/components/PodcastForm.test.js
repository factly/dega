import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';

import '../../../matchMedia.mock';
import PodcastForm from './PodcastForm';

jest.mock('@editorjs/editorjs');

const data = {
  id: 1,
  title: 'Podcast-1',
  slug: 'podcast-1',
  medium_id: 1,
  language: 'english',
  categories: [1],
  episodes: [1],
  description: {
    time: 1595747741807,
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Editor.js',
          level: 2,
        },
      },
      {
        type: 'paragraph',
        data: {
          text:
            'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
        },
      },
    ],
    version: '2.18.0',
  },
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Podcast form component', () => {
  store = mockStore({
    podcasts: {
      req: [
        {
          data: [1],
          query: {
            page: 1,
            limit: 5,
          },
          total: 1,
        },
      ],
      details: {
        1: {
          id: 1,
          title: 'Podcast-1',
          slug: 'podcast-1',
          medium_id: 1,
          language: 'english',
          categories: [1],
          episodes: [1],
        },
      },
      loading: false,
    },
    media: {
      req: [],
      details: {
        1: {
          name: 'Sample Image',
          slug: 'sample-img',
        },
      },
      loading: false,
    },
    spaces: {
      orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
      details: {
        11: { id: 11, name: 'Space 11' },
      },
      loading: false,
      selected: 11,
    },
    categories: {
      req: [],
      details: {},
      loading: false,
    },
    episodes: {
      req: [],
      details: {},
      loading: false,
    },
  });
  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <PodcastForm actions={['publish']} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <PodcastForm onCreate={onCreate} data={data} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        onCreate: jest.fn(),
        data: {
          title: 'Podcast-1',
          slug: 'podcast-1',
          medium_id: 1,
          language: 'english',
          categories: [1],
          episodes: [1],
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PodcastForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PodcastForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Podcast-1',
          slug: 'podcast-1',
          medium_id: 1,
          language: 'english',
          categories: [1],
          category_ids: [1],
          episodes: [1],
          episode_ids: [1],
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with no categories and no episodes', (done) => {
      
      const data2 = {
        id: 1,
        title: 'Podcast-1',
        slug: 'podcast-1',
        medium_id: 1,
        language: 'english',
        description: {
          time: 1595747741807,
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Editor.js',
                level: 2,
              },
            },
            {
              type: 'paragraph',
              data: {
                text:
                  'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
              },
            },
          ],
          version: '2.18.0',
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PodcastForm onCreate={props.onCreate} data={data2}/>
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Podcast-1',
          slug: 'podcast-1',
          medium_id: 1,
          language: 'english',
          category_ids: [],
          episode_ids: [],
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);  
    });
    it('should submit form with new title', (done) => {
      act(() => {
        const input = wrapper.find('FormItem').at(0).find('Input');
        input.simulate('change', { target: { value: 'new name' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'new name',
          slug: 'new-name',
          language: 'english',
          categories: [1],
          category_ids: [1],
          episodes: [1],
          episode_ids: [1],
          medium_id: 1,
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
  });
});
