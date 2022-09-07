import React from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import SpaceCreateForm from './SpaceCreateForm';

jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;
const data = {
  name: 'name',
  organisation_id: 2,
  slug: 'slug',
  site_title: 'site_title',
  tag_line: 'tag_line',
  description: {
    time: 1613715908408,
    blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
    version: '2.19.0',
  },
  site_address: 'site_address',
};

describe('Spaces Create Form component', () => {
  store = mockStore({
    spaces: {
      orgs: [{ id: 2, title: 'Organization 2', spaces: [] }],
      details: {},
      loading: false,
      selected: 0,
    },
  });
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockImplementation((state) => [{ id: 2, title: 'Organization 2', spaces: [] }]);

  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <SpaceCreateForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with props', () => {
      const tree = mount(
        <Provider store={store}>
          <SpaceCreateForm onCreate={onCreate} />
        </Provider>,
      );
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
            <SpaceCreateForm {...props} />
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
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('input')
          .at(2)
          .simulate('change', { target: { value: 'slug' } });
        wrapper
          .find('input')
          .at(3)
          .simulate('change', { target: { value: 'site title' } });
        wrapper
          .find('input')
          .at(4)
          .simulate('change', { target: { value: 'tag line' } });
        wrapper
          .find('FormItem')
          .at(7)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'New Description' } });
        wrapper
          .find('FormItem')
          .at(8)
          .find('MonacoEditor')
          .at(0)
          .props()
          .onChange({ target: { value: '{"sample":"testing"}' } });
        wrapper
          .find('input')
          .at(5)
          .simulate('change', { target: { value: 'site address' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          organisation_id: 2,
          slug: 'slug',
          site_title: 'site title',
          tag_line: 'tag line',
          description: 'New Description',
          site_address: 'site address',
          meta_fields: {
            sample: 'testing',
          },
        });
        done();
      }, 0);
    });
    it('should submit form without meta data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 2 } });
        wrapper
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('input')
          .at(2)
          .simulate('change', { target: { value: 'slug' } });
        wrapper
          .find('input')
          .at(3)
          .simulate('change', { target: { value: 'site title' } });
        wrapper
          .find('input')
          .at(4)
          .simulate('change', { target: { value: 'tag line' } });
        wrapper
          .find('FormItem')
          .at(7)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'New Description' } });
        wrapper
          .find('input')
          .at(5)
          .simulate('change', { target: { value: 'site address' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          organisation_id: 2,
          slug: 'slug',
          site_title: 'site title',
          tag_line: 'tag line',
          description: 'New Description',
          site_address: 'site address',
        });
        done();
      }, 0);
    });
  });
});
