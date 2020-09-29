import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { Popconfirm, Button, List } from 'antd';

import '../../../matchMedia.mock';
import PostList from './PostList';
import { getPosts, deletePost } from '../../../actions/posts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/posts', () => ({
  getPosts: jest.fn(),
  deletePost: jest.fn(),
}));

let state = {
  posts: {
    req: [
      {
        data: [1],
        total: 1,
        query: {
          page: 1,
        },
      },
    ],
    details: {
      '1': {
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
        medium: { id: 1, url: 'http://example.com', alt_text: 'example' },
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
        },
        total: 1,
      },
    ],
    details: {
      '1': {
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
        },
        total: 1,
      },
    ],
    details: {
      '1': {
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
  formats: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
        },
        total: 1,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-09-09T06:48:10.839241Z',
        updated_at: '2020-09-09T06:48:10.839241Z',
        deleted_at: null,
        name: 'Factcheck',
        slug: 'factcheck',
        description: '',
        space_id: 1,
      },
    },
    loading: false,
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
  authors: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
        },
        total: 1,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-07-27T06:16:26.418566Z',
        updated_at: '2020-07-27T06:16:26.418566Z',
        deleted_at: null,
        email: 'harsha@factly.in',
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
      },
    },
    loading: false,
  },
  ratings: {
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
    loading: false,
  },
};

let mockedDispatch, store;

describe('Posts List component', () => {
  describe('snapshot component', () => {
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
            <PostList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.posts.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PostList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with posts', () => {
      state.posts.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PostList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      expect(mockedDispatch).toHaveBeenCalledTimes(5);

      expect(getPosts).toHaveBeenCalledWith({ page: 1 });
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
              <PostList />
            </Router>
          </Provider>,
        );
      });
      const list = wrapper.find(List);
      list.props().pagination.onChange(2);
      wrapper.update();
      const updatedList = wrapper.find(List);
      expect(updatedList.props().pagination.current).toEqual(2);
    });
    it('should delete post', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PostList />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find(Button).at(3);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deletePost).toHaveBeenCalled();
      expect(deletePost).toHaveBeenCalledWith(1);
      expect(getPosts).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit post', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PostList />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(2);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/posts/1/edit');
    });
    it('should have no delete and edit buttons', () => {
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
        formats: {
          req: [],
        },
      });
      const wrapper = mount(
        <Provider store={store}>
          <Router>
            <PostList />
          </Router>
        </Provider>,
      );

      const button = wrapper.find(Button).at(0);
      expect(button.text()).toEqual('Create New');
    });
    it('should check image url and alt_text', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PostList />
            </Router>
          </Provider>,
        );
      });

      const image = wrapper.find('img');
      expect(image.length).toEqual(1);
      expect(image.props().src).toEqual('http://example.com');
      expect(image.props().alt).toEqual('example');
    });

    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PostList />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'fact check' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'asc' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1] } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1] } });
        wrapper
          .find('FormItem')
          .at(4)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1] } });

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getPosts).toHaveBeenCalledWith({
          page: 1,
          q: 'fact check',
          tag: [1],
          category: [1],
          format: [1],
        });
      }, 0);
    });
  });
});
