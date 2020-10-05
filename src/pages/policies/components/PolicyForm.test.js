import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import PolicyCreateForm from './PolicyForm';

const data = { id: 1, name: 'Policy 1' };

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

const permissions = {
  posts: ['get', 'create', 'update', 'delete'],
  categories: ['get', 'create', 'update', 'delete'],
  tags: ['get', 'create', 'update', 'delete'],
  formats: ['get', 'create', 'update', 'delete'],
  media: ['get', 'create', 'update', 'delete'],
  factchecks: ['get', 'create', 'update', 'delete'],
  claims: ['get', 'create', 'update', 'delete'],
  claimants: ['get', 'create', 'update', 'delete'],
  ratings: ['get', 'create', 'update', 'delete'],
  policies: ['get', 'create', 'update', 'delete'],
};

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
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        onCreate: jest.fn(),
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PolicyCreateForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PolicyCreateForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should not submit form with given data', (done) => {
      const policyData = {
        name: 'name',
        description: 'description',
        users: [1, 2],
        permissions: permissions,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PolicyCreateForm onCreate={props.onCreate} data={policyData} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'name',
          description: 'description',
          users: ['1', '2'],
          permissions: [
            { resource: 'posts', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'categories', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'tags', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'formats', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'media', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'factchecks', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'claims', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'claimants', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'ratings', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'policies', actions: ['get', 'create', 'update', 'delete'] },
          ],
        });
        done();
      }, 0);
    });
    it('should submit form with added data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'name' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'description' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Selector')
          .at(0)
          .props()
          .onChange({ target: { value: [1, 2] } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(4)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(5)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(6)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(7)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(8)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(9)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(10)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(11)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });
        wrapper
          .find('FormItem')
          .at(12)
          .find('Permission')
          .props()
          .onChange({ target: { value: ['get', 'create', 'update', 'delete'] } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'name',
          description: 'description',
          users: ['1', '2'],
          permissions: [
            { resource: 'posts', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'categories', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'tags', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'formats', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'media', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'factchecks', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'claims', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'claimants', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'ratings', actions: ['get', 'create', 'update', 'delete'] },
            { resource: 'policies', actions: ['get', 'create', 'update', 'delete'] },
          ],
        });
        done();
      }, 0);
    });
  });
});
