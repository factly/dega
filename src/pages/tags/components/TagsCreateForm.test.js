import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import TagsCreateForm from './TagsCreateForm';

const data = {
  name: 'name',
  slug: 'slug',
  description: 'description',
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Tags Create Form component', () => {
  beforeEach(() => {
    onCreate = jest.fn();
    onCreate.mockImplementationOnce((values) => new Promise((resolve, reject) => resolve(values)));
    store = mockStore({
      tags: {
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
          <TagsCreateForm />
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
          <TagsCreateForm data={[]} />
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
          <TagsCreateForm onCreate={onCreate} data={data} />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
