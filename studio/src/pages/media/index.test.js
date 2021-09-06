import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Media from './index';
import { getMedia } from '../../actions/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../actions/media', () => ({
  getMedia: jest.fn(),
  createMedium: jest.fn(),
}));
let state = {
  media: {
    req: [
      {
        data: [1],
        query: {},
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        name: 'name',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      },
    },
    loading: false,
  },
};
describe('Media List component', () => {
  let store;
  let mockedDispatch;
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      const state2 = {
        media: {
          req: [],
          details: {},
          loading: false,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Media permission={{ actions: ['create'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Media permission={{ actions: ['create'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getMedia).toHaveBeenCalledWith({});
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should handle url search params', () => {
      store = mockStore(state);
      let wrapper;
      window.history.pushState({}, '', '/media?limit=20&page=1&q=desc');
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Media permission={{ actions: ['create'] }} />
            </Router>
          </Provider>,
        );
      });
      expect(getMedia).toHaveBeenCalledWith({ page: 1, limit: 20, q: 'desc' });
    });

    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Media permission={{ actions: ['update', 'delete'] }} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'pic' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: '' } });

        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Search');
        submitButtom.simulate('submit');
      });
      wrapper.update();
      setTimeout(() => {
        expect(getMedia).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'pic',
        });
      }, 0);
    });
  });
});
