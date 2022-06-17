import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Collapse } from 'antd';

import '../../../matchMedia.mock';
import CategoryCreateForm from './CategoryForm';
import { SketchPicker } from 'react-color';
import { SlugInput } from '../../../components/FormItems';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('../../../actions/categories', () => ({
  getCategories: jest.fn(),
  deleteCategory: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

let onCreate, store;
const data = {
  name: 'Name',
  description: {
    time: 1613559903378,
    blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
    version: '2.19.0',
  },
  medium_id: 2,
};

describe('Categories Create Form component', () => {
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
      const tree = mount(
        <Provider store={store}>
          <CategoryCreateForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <CategoryCreateForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <CategoryCreateForm onCreate={onCreate} data={data} />
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
        data: {
          name: 'Name',
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          slug: 'slug',
          is_featured: false,
          medium_id: 2,
          meta_fields: {
            sample: 'testing',
          },
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CategoryCreateForm {...props} />
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
            <CategoryCreateForm onCreate={props.onCreate} />
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
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          background_colour: null,
          name: 'Name',
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          slug: 'slug',
          is_featured: false,
          medium_id: 2,
          parent_id: undefined,
        });
        done();
      }, 0);
    });
    it('should submit form with new title', (done) => {
      const data2 = {
        id: 1,
        name: 'Name',
        description: {
          time: 1613559903378,
          blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
          version: '2.19.0',
        },
        slug: 'slug',
        is_featured: false,
        medium_id: 2,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CategoryCreateForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper
          .find('TitleInput')
          .find('FormItem')
          .find('FormItemInput')
          .find('BaseInput')
          .find('input')
          .simulate('change', { target: { value: 'new name' } });

        input.simulate('change', { target: { value: 'new name' } });

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          background_colour: null,
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          slug: 'new-name',
          is_featured: false,
          parent_id: undefined,
          medium_id: 2,
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      const data3 = {
        id: 1,
        name: 'Name',
        description: {
          time: 1613559903378,
          blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
          version: '2.19.0',
        },
        slug: 'slug',
        is_featured: false,
        medium_id: 2,
      };
      data3.background_colour = {
        hex: '#e0f0fa',
        hsl: { h: 240, s: 0.094517011520825, l: 0.979237, a: 1 },
        hsv: { h: 240, s: 0.00399999999999994, v: 0.9812, a: 1 },
        oldHue: 240,
        rgb: { r: 240, g: 240, b: 250, a: 1 },
        source: 'hsv',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CategoryCreateForm onCreate={props.onCreate} data={data3} />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(Collapse).at(0).find('Button').at(0).simulate('click');
        wrapper.find(Collapse).at(1).find('Button').at(0).simulate('click');
        wrapper.find('FormItem').at(4).find('div').at(6).simulate('click');
      });
      wrapper.update();
      act(() => {
        wrapper
          .find('DescriptionInput')
          .find('Editor')
          .props()
          .onChange({
            target: {
              value: {
                time: 1613559903378,
                blocks: [{ type: 'paragraph', data: { text: 'New Description' } }],
                version: '2.19.0',
              },
            },
          });
        wrapper
          .find('FormItem')
          .at(4)
          .find(SketchPicker)
          .at(0)
          .props()
          .onChange({
            hex: '#f0f0fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          });
        wrapper
          .find('FormItem')
          .at(4)
          .find(SketchPicker)
          .at(0)
          .props()
          .onChange({
            hex: '#f0f0fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          });

        wrapper
          .find(SlugInput)
          .at(0)
          .props()
          .onChange({ target: { value: 'new-name' } });

        wrapper
          .find('FormItem')
          .at(11)
          .find('MonacoEditor')
          .props()
          .onChange({
            target: { value: '{"sample":"testing"}' },
          });
        const input = wrapper
          .find('TitleInput')
          .find('FormItem')
          .find('FormItemInput')
          .find('BaseInput')
          .find('input')
          .simulate('change', { target: { value: 'new name' } });
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          background_colour: {
            hex: '#f0f0fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          },
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'New Description' } }],
            version: '2.19.0',
          },
          slug: 'new-name',
          is_featured: false,
          medium_id: 2,
          meta: {
            canonical_URL: 'new-name',
            description: undefined,
            title: undefined,
          },
          meta_fields: {
            sample: 'testing',
          },
          parent_id: undefined,
        });
        done();
      }, 0);
    });
    it('should handle open and close SketchPicker', () => {
      act(() => {
        wrapper.find('FormItem').at(4).find('div').at(6).simulate('click');
      });
      wrapper.update();
      expect(wrapper.find(SketchPicker).length).toBe(1);
      act(() => {
        wrapper.find('FormItem').at(4).find('div').at(9).simulate('click');
      });
      wrapper.update();
      expect(wrapper.find(SketchPicker).length).toBe(0);
    });
    it('should handle collapse open and close', () => {
      act(() => {
        wrapper.find(Collapse).at(0).find('Button').at(0).simulate('click');
        wrapper.find(Collapse).at(1).find('Button').at(0).simulate('click');
      });
      wrapper.update();
      expect(wrapper.find(Collapse).at(0).find('Button').at(0).text()).toBe('Close');
      expect(wrapper.find(Collapse).at(1).find('Button').at(0).text()).toBe('Close');
    });
  });
});
