import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { Collapse } from 'antd';

import '../../../matchMedia.mock';
import TagForm from './TagForm';
import { SketchPicker } from 'react-color';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
let onCreate, store;
const data = {
  name: 'name',
  slug: 'slug',
  background_colour: null,
  description: {
    time: 1613561493761,
    blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
    version: '2.19.0',
  },
  is_featured: true,
  medium_id: 1,
};

describe('Tags Create Form component', () => {
  store = mockStore({
    tags: {
      req: [],
      details: {},
      loading: true,
    },
    spaces: {
      orgs: [],
      details: { 1: { site_address: '' } },
      loading: true,
      selected: 1,
    },
    media: {
      req: [],
      details: {},
      loading: true,
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
      const tree = mount(
        <Provider store={store}>
          <TagForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <TagForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <TagForm onCreate={onCreate} data={data} />
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
            <TagForm {...props} />
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
            <TagForm onCreate={props.onCreate} />
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
      const data2 = { ...data };
      data2.id = 1;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <TagForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith(props.data);
        done();
      }, 0);
    });
    it('should submit form with new name', (done) => {
      act(() => {
        const input = wrapper.find('input').at(0);
        input.simulate('change', { target: { value: 'new name' } });
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          slug: 'new-name',
          background_colour: null,
          description: {
            time: 1613561493761,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          is_featured: true,
          medium_id: 1,
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      const data2 = { ...data };
      data2.meta_fields = {
        sample: 'testing',
      };
      data2.background_colour = {
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
            <TagForm onCreate={props.onCreate} data={data2} />
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
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'new-slug' } });
        wrapper
          .find('DescriptionInput')
          .find('Editor')
          .props()
          .onChange({
            target: {
              value: {
                time: 1613561493761,
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
          .at(10)
          .find('MonacoEditor')
          .props()
          .onChange({
            target: { value: '{"sample":"testing"}' },
          });
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(wrapper.find(SketchPicker).length).toBe(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          background_colour: {
            hex: '#f0f0fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          },
          name: 'new name',
          slug: 'new-slug',
          description: {
            time: 1613561493761,
            blocks: [{ type: 'paragraph', data: { text: 'New Description' } }],
            version: '2.19.0',
          },
          is_featured: true,
          medium_id: 1,
          meta: {
            canonical_URL: undefined,
            description: undefined,
            title: undefined,
          },
          meta_fields: {
            sample: 'testing',
          },
        });
        done();
      }, 0);
    });
    it('should handle open and close SketchPicker', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <TagForm onCreate={props.onCreate} data={data} />
          </Provider>,
        );
      });
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
