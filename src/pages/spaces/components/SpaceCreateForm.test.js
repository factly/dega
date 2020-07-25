import React from 'react';
import renderer, { act as rendererAct } from 'react-test-renderer';
import { Provider, useDispatch, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act, render } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import SpaceCreateForm from './SpaceCreateForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;
const data = {
  name: 'name',
  organisation_id: 2,
  slug: 'slug',
  site_title: 'site_title',
  tag_line: 'tag_line',
  description: 'description',
  site_address: 'site_address',
};

describe('Spaces Create Form component', () => {
  store = mockStore({
    spaces: {
      orgs: [],
      details: {},
      loading: true,
      selected: 0,
    },
  });

  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <SpaceCreateForm />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      rendererAct(() => component.unmount());
    });
    it('should render the component with props', () => {
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <SpaceCreateForm onCreate={onCreate} />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      rendererAct(() => component.unmount());
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
            <SpaceCreateForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <SpaceCreateForm onCreate={props.onCreate} />
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
      wrapper.unmount();
    });
    it('should submit form with added data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 2 } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Input')
          .simulate('change', { target: { value: 'name' } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Input')
          .simulate('change', { target: { value: 'slug' } });
        wrapper
          .find('FormItem')
          .at(4)
          .find('Input')
          .simulate('change', { target: { value: 'site title' } });
        wrapper
          .find('FormItem')
          .at(5)
          .find('Input')
          .simulate('change', { target: { value: 'tag line' } });
        wrapper
          .find('FormItem')
          .at(6)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'description' } });
        wrapper
          .find('FormItem')
          .at(7)
          .find('Input')
          .simulate('change', { target: { value: 'site address' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'name',
          organisation_id: 2,
          slug: 'slug',
          site_title: 'site title',
          tag_line: 'tag line',
          description: 'description',
          site_address: 'site address',
        });
        done();
      }, 0);
    });
  });
});
