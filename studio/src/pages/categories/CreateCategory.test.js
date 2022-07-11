import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, render } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateCategory from './CreateCategory';
import * as actions from '../../actions/categories';
import CategoryCreateForm from './components/CategoryForm';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('@editorjs/editorjs');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/categories', () => ({
  getCategories: jest.fn(),
  createCategory: jest.fn(),
}));

describe('Categories create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    categories: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {},
      loading: true,
    },
    spaces: {
      orgs: [],
      details: { 1: { site_address: '' } },
      loading: true,
      selected: 1,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateCategory />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call createCategory', (done) => {
      actions.createCategory.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateCategory />
          </Provider>,
        );
      });
      wrapper.find(CategoryCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.createCategory).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/categories');
        done();
      }, 0);
    });
  });
});
