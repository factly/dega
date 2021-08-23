import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import MediumList from './MediumList';
import * as actions from '../../../actions/media';
import { mount } from 'enzyme';
import { List } from 'antd';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/media', () => ({
  getMedia: jest.fn(),
  deleteMedium: jest.fn(),
}));

let mockedDispatch, store;
const filters = {
  page: 1,
  limit: 20,
};
const setFilters = jest.fn();
const fetchMedia = jest.fn();
const info = {
  media: [
    {
      id: 1,
      created_at: '2020-09-23T09:21:29.245873Z',
      updated_at: '2020-09-23T09:21:29.245873Z',
      deleted_at: null,
      name: 'uppy/english/2020/8/1600852886756_pnggrad16rgb.png',
      slug: 'uppy-english-2020-8-1600852886756-pnggrad16rgb-png',
      type: 'image/png',
      title: 'png',
      description: 'png',
      caption: 'png',
      alt_text: 'png',
      file_size: 3974,
      url: 'http://storage.googleapis.com/sample.png',
      dimensions: '100x100',
      space_id: 1,
    },
    {
      id: 2,
      created_at: '2020-09-23T09:21:29.245873Z',
      updated_at: '2020-09-23T09:21:29.245873Z',
      deleted_at: null,
      name: 'uppy/english/2020/8/1600852886756_pnggrad16rgb.png',
      slug: 'uppy-english-2020-8-1600852886756-pnggrad16rgb-png',
      type: 'image/png',
      title: 'png',
      description: 'png',
      caption: 'png',
      alt_text: 'png',
      file_size: 3974,
      url: { proxy: 'http://storage.googleapis.com/sample.png' },
      dimensions: '100x100',
      space_id: 1,
    },
  ],
  total: 2,
  loading: false,
};
let state = {
  media: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-23T09:21:29.245873Z',
        updated_at: '2020-09-23T09:21:29.245873Z',
        deleted_at: null,
        name: 'uppy/english/2020/8/1600852886756_pnggrad16rgb.png',
        slug: 'uppy-english-2020-8-1600852886756-pnggrad16rgb-png',
        type: 'image/png',
        title: 'png',
        description: 'png',
        caption: 'png',
        alt_text: 'png',
        file_size: 3974,
        url: 'http://storage.googleapis.com/sample.png',
        dimensions: '100x100',
        space_id: 1,
      },
      2: {
        id: 2,
        created_at: '2020-09-23T09:21:29.245873Z',
        updated_at: '2020-09-23T09:21:29.245873Z',
        deleted_at: null,
        name: 'uppy/english/2020/8/1600852886756_pnggrad16rgb.png',
        slug: 'uppy-english-2020-8-1600852886756-pnggrad16rgb-png',
        type: 'image/png',
        title: 'png',
        description: 'png',
        caption: 'png',
        alt_text: 'png',
        file_size: 3974,
        url: { proxy: 'http://storage.googleapis.com/sample.png' },
        dimensions: '100x100',
        space_id: 1,
      },
    },
    loading: false,
  },
};

describe('Media List component', () => {
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
            <MediumList
              actions={['update', 'delete']}
              data={{ media: [], total: 0, loading: false }}
              filters={filters}
              setFilters={setFilters}
              fetchMedia={fetchMedia}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.media.loading = true;
      store = mockStore(state);
      const info2 = { ...info };
      info2.loading = true;
      const tree = mount(
        <Provider store={store}>
          <Router>
            <MediumList
              actions={['update', 'delete']}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchMedia={fetchMedia}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with media', () => {
      state.media.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <MediumList
              actions={['update', 'delete']}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchMedia={fetchMedia}
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
              <MediumList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchMedia={fetchMedia}
              />
            </Router>
          </Provider>,
        );
      });
      const list = wrapper.find(List);
      list.props().pagination.onChange(1);
      wrapper.update();
      const updatedList = wrapper.find(List);
      expect(updatedList.props().pagination.current).toEqual(1);
    });
    it('should edit medium', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MediumList
                actions={['update', 'delete']}
                data={info}
                filters={{ page: 1 }}
                setFilters={setFilters}
                fetchMedia={fetchMedia}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.prop('to').pathname).toEqual('/media/1/edit');
    });
  });
});
