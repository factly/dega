import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import { useHistory } from 'react-router-dom';

import '../../../matchMedia.mock';
import PostForm from './PostForm';

import { addTemplate } from '../../../actions/posts';
import { setCollapse } from './../../../actions/sidebar';

jest.mock('@editorjs/editorjs');
jest.mock('../../../actions/tags', () => ({
  ...jest.requireActual('../../../actions/tags'),
  addTag: jest.fn(),
}));
jest.mock('./../../../actions/sidebar', () => ({
  setCollapse: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));
jest.mock('../../../actions/posts', () => ({
  addTemplate: jest.fn(),
}));

const data = {
  id: 1,
  title: 'Post-1',
  excerpt: 'excerpt of post',
  slug: 'post-1',
  featured_medium_id: 1,
  status: 'draft',
  format: 1,
  categories: [1],
  tags: [1],
  authors: [1],
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

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Posts Create Form component', () => {
  store = mockStore({
    posts: {
      req: [],
      details: {},
      loading: true,
    },
    formats: {
      req: [],
      details: {
        1: {
          name: 'Fact check',
          slug: 'fact-check',
        },
      },
      loading: true,
    },
    authors: {
      req: [],
      details: {},
      loading: true,
    },
    tags: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    claims: {
      req: [],
      details: {},
      loading: true,
    },
    ratings: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {
        1: {
          name: 'Sample Image',
          slug: 'sample-img',
        },
      },
      loading: true,
    },
    sidebar: {
      collapsed: false,
    },
  });
  useDispatch.mockReturnValue(jest.fn(() => Promise.resolve({})));
  useSelector.mockImplementation((state) => ({
    details: [],
    total: 0,
    loading: false,
    sidebar: false,
  }));

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
            <PostForm actions={['publish']} />
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
            <PostForm
              actions={['publish']}
              onCreate={onCreate}
              data={data}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with open drawer', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <PostForm
              actions={['publish']}
              onCreate={onCreate}
              data={data}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
          </Provider>,
        );
      });
      act(() => {
        const settingButton = tree.find('Button').at(2);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        expect(tree.find('Drawer').length).toBe(1);
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match with different permission actions', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <PostForm
              actions={['create']}
              data={data}
              onCreate={onCreate}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
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
        data: data,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PostForm
              actions={['publish']}
              {...props}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
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
            <PostForm actions={['publish']} onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        //submit button
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Post-1',
          excerpt: 'excerpt of post',
          slug: 'post-1',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          tag_ids: [1],
          tags: [1],
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
    it('should submit form with new name', (done) => {
      act(() => {
        const input = wrapper.find('FormItem').at(4).find('TextArea').at(0);
        input.simulate('change', { target: { value: 'Post test' } });

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');

        submitButtom.simulate('click');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Post test',
          excerpt: 'excerpt of post',
          slug: 'post-test',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          tag_ids: [1],
          tags: [1],
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
    it('should create template on click of Add template button', (done) => {
      addTemplate.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PostForm
              actions={['publish']}
              {...props}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
          </Provider>,
        );
      });
      act(() => {
        const templateButtom = wrapper.find('Button').at(0);
        templateButtom.simulate('click');
        wrapper.update();
      });

      setTimeout(() => {
        expect(addTemplate).toHaveBeenCalledTimes(1);
        expect(addTemplate).toHaveBeenCalledWith({
          post_id: 1,
        });
        expect(push).toHaveBeenCalledWith('/posts');
        done();
      }, 0);
    });
    it('should open and close drawer for settings', () => {
      act(() => {
        const settingButton = wrapper.find('Button').at(2);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        expect(wrapper.find('Drawer').length).toBe(1);
        const closeButtonn = wrapper.find('DrawerChild').find('button').at(0);
        closeButtonn.simulate('click');
      });
    });
    it('should submit form with no categories, no tags, no authors data', (done) => {
      const data2 = {
        id: 1,
        title: 'Post-1',
        excerpt: 'excerpt of post',
        slug: 'post-1',
        featured_medium_id: 1,
        status: 'draft',
        format: 1,
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
            <PostForm
              actions={['publish']}
              data={data2}
              onCreate={props.onCreate}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Post-1',
          excerpt: 'excerpt of post',
          slug: 'post-1',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 1,
          author_ids: [],
          category_ids: [],
          tag_ids: [],
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
    it('should not change slug with title change when status is publish', (done) => {
      const data2 = {
        id: 1,
        title: 'Post-1',
        excerpt: 'excerpt of post',
        slug: 'post-1',
        featured_medium_id: 1,
        status: 'publish',
        format: 1,
        categories: [1],
        tags: [1],
        authors: [1],
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
            <PostForm
              actions={['publish']}
              data={data2}
              onCreate={props.onCreate}
              format={{ id: 1, name: 'article', slug: 'article' }}
            />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper.find('FormItem').at(4).find('TextArea').at(0);
        input.simulate('change', { target: { value: 'Post test' } });

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');

        submitButtom.simulate('click');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Post test',
          excerpt: 'excerpt of post',
          slug: 'post-1',
          featured_medium_id: 1,
          status: 'publish',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          tag_ids: [1],
          tags: [1],
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
