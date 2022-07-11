import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import { Steps, Button, Collapse } from 'antd';

import '../../../matchMedia.mock';
import WebsiteEditForm from './WebsiteEditForm';
const data = {
  organisation_id: 1,
  name: 'name',
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

describe('WebsiteEditForm Form component', () => {
  store = mockStore({
    claims: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    rating: {
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
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockReturnValue([{ id: 1, organazation: 'Organization 1', spaces: [11] }]);

  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      const tree = shallow(
        <Provider store={store}>
          <WebsiteEditForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = shallow(
        <Provider store={store}>
          <WebsiteEditForm onCreate={onCreate} data={data} />
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
        data: data,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <WebsiteEditForm {...props} />
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
            <WebsiteEditForm onCreate={props.onCreate} />
          </Provider>,
        );
      });
      wrapper.update();

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButtom = wrapper.find(Button).at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          organisation_id: 1,
          name: 'name',
          slug: 'slug',
          site_title: 'site_title',
          tag_line: 'tag_line',
          description: {
            time: 1613715908408,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          site_address: 'site_address',
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      const data2 = { ...data };
      data2.meta_fields = {
        sample: 'testing',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <WebsiteEditForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find('CollapsePanel').at(2).find('Button').at(0).simulate('click');
      });
      wrapper.update();
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
          .at(4)
          .simulate('change', { target: { value: 'new-slug' } });
        wrapper
          .find('input')
          .at(2)
          .simulate('change', { target: { value: 'new site title' } });
        wrapper
          .find('input')
          .at(3)
          .simulate('change', { target: { value: 'new tag line' } });
        wrapper
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'New Description' } });
        wrapper
          .find('input')
          .at(5)
          .simulate('change', { target: { value: 'new site address' } });
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          organisation_id: 2,
          name: 'new name',
          slug: 'new-slug',
          site_title: 'new site title',
          tag_line: 'new tag line',
          description: 'New Description',
          meta_fields: {
            sample: 'testing',
          },
          site_address: 'new site address',
        });
        done();
      }, 0);
    });
    it('should highlight form fields with error', () => {
      wrapper.update();
      act(() => {
        wrapper
          .find('input')
          .at(2)
          .simulate('change', { target: { value: '' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      expect(props.onCreate).not.toHaveBeenCalled();
    });
  });
});
