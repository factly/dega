import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import CategoryCreateForm from './CategoryCreateForm';

const data = { parent_id: 1, name: 'Name', description: 'Description', medium_id: 2 };

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Categories Create Form component', () => {
  beforeEach(() => {
    onCreate = jest.fn();
    onCreate.mockImplementationOnce((values) => new Promise((resolve, reject) => resolve(values)));
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
    });
  });
  it('should render the component', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <CategoryCreateForm />
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <CategoryCreateForm data={[]} />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with data', () => {
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <CategoryCreateForm onCreate={onCreate} data={data} />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
