import React from 'react';
//import renderer, { act as rendererAct } from 'react-test-renderer';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { Steps, Button, DatePicker } from 'antd';
import moment from 'moment';

import '../../../matchMedia.mock';
import PolicyCreateForm from './PolicyCreateForm';

const data = { id: 1, name: 'Policy 1' };

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Policy Create Form component', () => {
  store = mockStore({
    policies: {
      req: [],
      details: {},
      loading: true,
    },
    authors: {
      req: [],
      details: {},
      loading: true,
    },
  });
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockImplementation((state) => ({ details: [], total: 0, loading: false }));

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
            <PolicyCreateForm />
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
            <PolicyCreateForm onCreate={onCreate} data={data} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
});
