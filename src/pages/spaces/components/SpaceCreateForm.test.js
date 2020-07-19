import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../../matchMedia.mock';
import SpaceCreateForm from './SpaceCreateForm';

const data = {
  name: 'name',
  organisation_id: 2,
  slug: 'slug',
  site_title: 'site_title',
  tag_line: 'tag_line',
  description: 'description',
  site_address: 'site_address',
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Spaces Create Form component', () => {
  beforeEach(() => {
    onCreate = jest.fn();
    onCreate.mockImplementationOnce((values) => new Promise((resolve, reject) => resolve(values)));
    store = mockStore({
      spaces: {
        orgs: [],
        details: {},
        loading: true,
        selected: 0,
      },
    });
  });
  it('should render the component', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <SpaceCreateForm />
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
          <SpaceCreateForm data={[]} />
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
          <SpaceCreateForm onCreate={onCreate} data={data} />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
