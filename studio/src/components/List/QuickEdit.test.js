import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import moment from 'moment';

import '../../matchMedia.mock';
import QuickEdit from './QuickEdit';

import { updatePost } from '../../actions/posts';
import { updatePage } from '../../actions/pages';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

Date.now = jest.fn(() => 1487076708000);
jest.mock('../../actions/tags', () => ({
  ...jest.requireActual('../../actions/tags'),
  createTag: jest.fn(),
}));
jest.mock('../../actions/sidebar', () => ({
  setCollapse: jest.fn(),
}));

jest.mock('../../actions/posts', () => ({
  addTemplate: jest.fn(),
  updatePost: jest.fn(),
}));
jest.mock('../../actions/pages', () => ({
  updatePage: jest.fn(),
}));
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
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
  category_ids: [1],
  tags: [1],
  tag_ids: [1],
  authors: [1],
  author_ids: [1],
  claim_ids: [],
  published_date: null,
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
const setID = jest.fn();
let state = {
  posts: {
    req: [
      {
        data: [1],
        total: 1,
        query: {
          page: 1,
          limit: 20,
          format: [1],
        },
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:53:03.018593Z',
        updated_at: '2020-09-09T10:51:20.681562Z',
        deleted_at: null,
        title: 'Explainer: The US Presidential Debates – History & Format',
        subtitle: '',
        slug: 'explainer-the-us-presidential-debates-history-format',
        status: 'Publish',
        excerpt:
          'One of the unique aspects of the US Presidential election is the face to face debate of the Presidential nominees. ',
        description: {
          time: 1599648677547,
          blocks: [
            {
              data: {
                text:
                  'The United States of America (USA) is one of the oldest modern democracies in the world. Over its existence as a democracy for nearly two and half centuries, it has developed institutions and practices which strengthen the idea of democracy. Democracy wrests the choice in the people to choose a government to preside over the administration. Hence it is imperative that the people know about the political party or the individual that they would be voting for. This knowledge includes – the ideology, stance on various issues, vision etc.&nbsp;',
              },
              type: 'paragraph',
            },
          ],
          version: '2.18.0',
        },
        is_featured: false,
        is_sticky: false,
        is_highlighted: false,
        featured_medium_id: 1,
        medium: { id: 1, url: { raw: 'http://example.com' }, alt_text: 'example' },
        format_id: 1,
        format: 1,
        published_date: '0001-01-01T00:00:00Z',
        space_id: 1,
        tags: [1],
        categories: [1],
        authors: [],
        claims: [],
      },
    },
    loading: false,
  },
  categories: {
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
        created_at: '2020-09-09T06:49:36.566567Z',
        updated_at: '2020-09-09T06:49:36.566567Z',
        deleted_at: null,
        name: 'Andhra Pradesh',
        slug: 'andhra-pradesh',
        description: '',
        parent_id: 0,
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
  tags: {
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
        created_at: '2020-09-09T06:48:23.158897Z',
        updated_at: '2020-09-09T06:48:23.158897Z',
        deleted_at: null,
        name: 'cricket',
        slug: 'cricket',
        description: '',
        space_id: 1,
        posts: null,
      },
    },
    loading: false,
  },
  authors: {
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
        created_at: '2020-09-09T06:48:23.158897Z',
        updated_at: '2020-09-09T06:48:23.158897Z',
        deleted_at: null,
        name: 'author',
        slug: 'author',
        description: '',
        space_id: 1,
        posts: null,
      },
    },
    loading: false,
  },
  claims: {
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
        created_at: '2020-09-09T06:48:23.158897Z',
        updated_at: '2020-09-09T06:48:23.158897Z',
        deleted_at: null,
        claim: 'claim',
        slug: 'claim',
      },
    },
    loading: false,
  },
  media: {
    req: [],
    details: {
      1: {
        id: 1,
        url: { raw: 'http://example.com' },
        alt_text: 'example',
      },
      2: {
        id: 1,
        url: { proxy: 'http://example2.com' },
        alt_text: 'example2',
      },
    },
    loading: true,
  },
};
let mockedDispatch, store;

describe('Quick Edit component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <QuickEdit data={data} setID={setID} slug={'article'} page={false} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should handle cancel click', (done) => {
      updatePost.mockReset();
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <QuickEdit data={data} setID={setID} slug={'article'} page={false} />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Cancel');
        submitButtom.simulate('click');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updatePost).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with data', (done) => {
      updatePost.mockReset();
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <QuickEdit data={data} setID={setID} slug={'article'} page={false} />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updatePost).toHaveBeenCalled();
        expect(updatePost).toHaveBeenCalledWith(data);
        done();
      }, 0);
    });
    it('should submit form with page data', (done) => {
      updatePage.mockReset();
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <QuickEdit data={data} setID={setID} slug={'article'} page={true} />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updatePage).toHaveBeenCalled();
        expect(updatePage).toHaveBeenCalledWith(data);
        done();
      }, 0);
    });
    it('should submit form with updated name and slug', (done) => {
      const data2 = { ...data };
      data.published_date = '2017-02-14T12:51:48+00:00';
      updatePost.mockReset();
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <QuickEdit data={data} setID={setID} slug={'article'} />
            </Router>
          </Provider>,
        );
      });

      act(() => {
        const input = wrapper.find('input').at(0);
        input.simulate('change', { target: { value: 'Updated title' } });
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updatePost).toHaveBeenCalled();
        expect(updatePost).toHaveBeenCalledWith({
          id: 1,
          title: 'Updated title',
          excerpt: 'excerpt of post',
          slug: 'updated-title',
          featured_medium_id: 1,
          status: 'draft',
          format: 1,
          categories: [1],
          category_ids: [1],
          tags: [1],
          tag_ids: [1],
          authors: [1],
          author_ids: [1],
          claim_ids: [],
          published_date: null,
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
    it('should submit form with updated data', (done) => {
      const data2 = { ...data };
      data2.format = 2;
      data2.claim_ids = [1];
      data2.claims = [1];
      data2.categories = [];
      data2.tags = [];
      data2.status = 'publish';
      updatePost.mockReset();
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <QuickEdit data={data2} setID={setID} slug={'fact-check'} page={false} />
            </Router>
          </Provider>,
        );
      });

      act(() => {
        const input = wrapper.find('input').at(0);
        input.simulate('change', { target: { value: 'Updated title' } });
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updatePost).toHaveBeenCalled();
        expect(updatePost).toHaveBeenCalledWith({
          id: 1,
          title: 'Updated title',
          excerpt: 'excerpt of post',
          slug: 'post-1',
          featured_medium_id: 1,
          status: 'publish',
          format: 2,
          categories: [],
          category_ids: [],
          tags: [],
          tag_ids: [],
          authors: [1],
          author_ids: [1],
          claim_ids: [1],
          claims: [1],
          published_date: moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ'),
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
