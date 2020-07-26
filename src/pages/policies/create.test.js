import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { mount } from 'enzyme';
import '../../matchMedia.mock';

import Create from './create';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Policies Create Form component', () => {
  beforeEach(() => {
    onCreate = jest.fn();
    onCreate.mockImplementationOnce((values) => new Promise((resolve, reject) => resolve(values)));
    store = mockStore({
      policies: {
        req: [],
        details: {},
        loading: false,
      },
      authors: {
        req: [{ query: { page: 1, limit: 5 }, total: 1, data: [1] }],
        details: { 1: { id: 1, name: 'Author', email: 'author@aut.co' } },
        loading: false,
      },
    });
  });
  it.only('should render the component', () => {
    const tree = mount(
      <Provider store={store}>
        <Create />
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
