import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, List, Table } from 'antd';
import { FormOutlined } from '@ant-design/icons';

import '../../matchMedia.mock';
import ListComponent from './index';
import { getPosts, deletePost } from '../../actions/posts';
import QuickEdit from './QuickEdit';

jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;
const onPagination = jest.fn();
const filters = {
  page: 1,
  limit: 20,
};
const fetchPosts = jest.fn();
const setFilters = jest.fn();
const info = {
  loading: false,
  total: 3,
  tags: {
    1: {
      id: 1,
      name: 'Tag',
    },
  },
  categories: {
    1: {
      id: 1,
      name: 'Category',
    },
  },
  posts: [
    {
      id: 1,
      created_at: '2020-09-09T06:53:03.018593Z',
      updated_at: '2020-09-09T10:51:20.681562Z',
      deleted_at: null,
      title: 'Explainer: The US Presidential Debates – History & Format',
      subtitle: '',
      slug: 'explainer-the-us-presidential-debates-history-format',
      status: 'publish',
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
    {
      id: 2,
      created_at: '2020-09-09T06:53:03.018593Z',
      updated_at: '2020-09-09T10:51:20.681562Z',
      deleted_at: null,
      title: 'Explainer: The US Presidential Debates – History & Format',
      subtitle: '',
      slug: 'explainer-the-us-presidential-debates-history-format',
      status: 'draft',
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
      featured_medium_id: null,
      format_id: 1,
      format: 1,
      space_id: 1,
      tags: [],
      categories: [],
      authors: [],
      claims: [],
    },
    {
      id: 3,
      created_at: '2020-09-09T06:53:03.018593Z',
      updated_at: '2020-09-09T10:51:20.681562Z',
      deleted_at: null,
      title: 'Explainer: The US Presidential Debates – History & Format',
      subtitle: '',
      slug: 'explainer-the-us-presidential-debates',
      status: 'ready',
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
      featured_medium_id: 2,
      medium: { id: 2, url: { proxy: 'http://example2.com' }, alt_text: 'example' },
      format_id: 1,
      format: 1,
      published_date: '0001-01-01T00:00:00Z',
      space_id: 1,
      tags: [1],
      categories: [1],
      authors: [],
      claims: [],
    },
    {
      id: 4,
      created_at: '2020-09-09T06:53:03.018593Z',
      updated_at: '2020-09-09T10:51:20.681562Z',
      deleted_at: null,
      title: 'Explainer: The US Presidential Debates – History & Format',
      subtitle: '',
      slug: 'explainer-the-us-presidential-debates',
      status: 'other',
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
      featured_medium_id: 2,
      medium: { id: 2, url: { proxy: 'http://example2.com' }, alt_text: 'example' },
      format_id: 1,
      format: 1,
      published_date: '0001-01-01T00:00:00Z',
      space_id: 1,
      tags: [1],
      categories: [1],
      authors: [],
      claims: [],
    },
  ],
};
let state = {
  posts: {
    req: [
      {
        data: [1, 2, 3],
        total: 3,
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
      2: {
        id: 2,
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
        featured_medium_id: null,
        format_id: 1,
        format: 1,
        published_date: '0001-01-01T00:00:00Z',
        space_id: 1,
        tags: [1],
        categories: [1],
        authors: [],
        claims: [],
      },
      3: {
        id: 3,
        created_at: '2020-09-09T06:53:03.018593Z',
        updated_at: '2020-09-09T10:51:20.681562Z',
        deleted_at: null,
        title: 'Explainer: The US Presidential Debates – History & Format',
        subtitle: '',
        slug: 'explainer-the-us-presidential-debates',
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
        featured_medium_id: 2,
        medium: { id: 2, url: { proxy: 'http://example2.com' }, alt_text: 'example' },
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
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/posts', () => ({
  getPosts: jest.fn(),
  deletePost: jest.fn(),
}));

describe('List component', () => {
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
            <ListComponent
              actions={['update', 'delete']}
              format={{ id: 1, name: 'article' }}
              data={{ posts: [], tags: {}, categories: {}, loading: false, total: 0 }}
              filters={filters}
              setFilters={setFilters}
              fetchPosts={fetchPosts}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match when component loading', () => {
      state.posts.loading = true;
      store = mockStore(state);
      const info2 = { ...info };
      info2.loading = true;
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ListComponent
              actions={['update', 'delete']}
              format={{ id: 1, name: 'article' }}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchPosts={fetchPosts}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match with posts', () => {
      state.posts.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ListComponent
              actions={['update', 'delete']}
              format={{ id: 1, name: 'article' }}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchPosts={fetchPosts}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent
                actions={['update', 'delete']}
                format={{ id: 1, name: 'article' }}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPosts={fetchPosts}
                onPagination={onPagination}
              />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(1);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(1);
    });
    it('should delete the post', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent
                actions={['update', 'delete']}
                format={{ id: 1, name: 'article' }}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPosts={fetchPosts}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(2);
      expect(button.text()).toEqual('');
      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deletePost).toHaveBeenCalled();
      expect(deletePost).toHaveBeenCalledWith(1);
    });
    it('should edit the post', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent
                actions={['update', 'delete']}
                format={{ id: 1, name: 'article', slug: 'article' }}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPosts={fetchPosts}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.prop('to')).toEqual('/posts/1/edit');
    });
    it('should handle quick edit', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent
                actions={['update', 'delete']}
                format={{ id: 1, name: 'article', slug: 'article' }}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchPosts={fetchPosts}
              />
            </Router>
          </Provider>,
        );
      });
      const button2 = wrapper.find(Button).at(4);
      expect(button2.find(FormOutlined).length).toBe(1);
      button2.simulate('click');
      wrapper.update();
      button2.simulate('click');

      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('');
      button.simulate('click');
      expect(wrapper.find(QuickEdit).length).toBe(2);
      expect(wrapper.find('FormItem').at(0).props().name).toBe('title');
      wrapper
        .find('input')
        .at(0)
        .simulate('change', { target: { value: 'New title' } });
      wrapper.update();
      wrapper.find(QuickEdit).at(0).props().onQuickEditUpdate();
      const updateBtn = wrapper.find(Button).at(4);
      expect(updateBtn.text()).toBe('Update');
      updateBtn.simulate('submit');
    });
    it('should have not delete and edit buttons', () => {
      store = mockStore({
        posts: {
          req: [],
        },
        tags: {
          req: [],
        },
        categories: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent
                actions={['update', 'delete']}
                format={{ id: 1, name: 'article', slug: 'article' }}
                data={{ posts: [], tags: {}, categories: {}, total: 0, loading: false }}
                filters={{ page: 1 }}
                setFilters={setFilters}
                fetchPosts={fetchPosts}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
