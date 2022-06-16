import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateTag from './CreateTag';
import * as actions from '../../actions/tags';
import TagCreateForm from './components/TagForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/tags', () => ({
  getTags: jest.fn(),
  createTag: jest.fn(),
}));

describe('Tags create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    tags: {
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
    media: {
      req: [],
      details: {},
      loading: true,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateTag />
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
    it('should call createTag', (done) => {
      actions.createTag.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateTag />
          </Provider>,
        );
      });
      wrapper.find(TagCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.createTag).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/tags');
        done();
      }, 0);
    });
  });
});
