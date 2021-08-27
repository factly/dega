import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateFormat from './CreateFormat';
import * as actions from '../../actions/formats';
import FormatCreateForm from './components/FormatForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

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

jest.mock('../../actions/formats', () => ({
  getFormats: jest.fn(),
  getFormat: jest.fn(),
  addFormat: jest.fn(),
}));

describe('Formats create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    formats: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {},
      loading: false,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateFormat />
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
    it('should call addFormat', (done) => {
      actions.addFormat.mockReset();
      const setReloadFlag = jest.fn();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateFormat setReloadFlag={setReloadFlag} reloadFlag={false} />
          </Provider>,
        );
      });
      wrapper.find(FormatCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addFormat).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/advanced/formats');
        expect(setReloadFlag).toHaveBeenCalledWith(true);
        done();
      }, 0);
    });
  });
});
