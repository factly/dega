import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, List } from 'antd';

import '../../matchMedia.mock';
import ListComponent from './index';
import { getPosts, deletePost } from '../../actions/posts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

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
          limit: 5,
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
  media: {
    req: [],
    details: {
      '1': {
        id: 1,
        url: { raw: 'http://example.com' },
        alt_text: 'example',
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
            <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article'} } />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match when component loading', () => {
      state.posts.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article'} } />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match when component loading', () => {
      state.posts.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article'} } />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getPosts).toHaveBeenCalledWith({ page: 1, limit: 20, format: [1] });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve)=> resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article'} } />
            </Router>
          </Provider>,
        );
      });
      const list = wrapper.find(List);
      list.props().pagination.onChange(3);
      wrapper.update();
      const updatedList = wrapper.find(List);
      expect(updatedList.props().pagination.current).toEqual(3);
    });
    it('should delete the post', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article'} } />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(2);
      expect(button.text()).toEqual('Delete');
      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deletePost).toHaveBeenCalled();
      expect(deletePost).toHaveBeenCalledWith(1);
      expect(getPosts).toHaveBeenCalledWith({ page: 1, limit: 20, format: [1] });
    });
    it('should edit the post', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article', slug: 'article'} } />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(1);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/posts/1/edit');
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article', slug: 'article'} } />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'Explainer' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .props()
          .onChange({ target: { value: 'asc' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Selector')
          .at(0)
          .props()
          .onChange({ target: { value: [2] } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Selector')
          .at(0)
          .props()
          .onChange({ target: { value: [2] } });
  
        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
      });
      setTimeout(() => {
        expect(getPosts).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          sort: 'asc',
          format: [1],
          q: 'Explainer',
          tag: [2],
          category: [2],
        });
      }, 0);
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
              <ListComponent actions={['update', 'delete']} format={ {id: 1, name: 'article', slug: 'article'} } />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button);
      expect(button.length).toEqual(1);
    })
  });
});


