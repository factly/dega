import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { SketchPicker } from 'react-color';
import { Collapse } from 'antd';

import '../../../matchMedia.mock';
import RatingForm from './RatingForm';
jest.mock('@editorjs/editorjs');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;
const data = {
  name: 'name',
  slug: 'slug',
  numeric_value: 3,
  medium_id: 1,
  background_colour: {
    hex: '#f9f9fa',
    hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
    hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
    oldHue: 240,
    rgb: { r: 249, g: 249, b: 250, a: 1 },
    source: 'hsv',
  },
  description: {
    time: 1613559903378,
    blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
    version: '2.19.0',
  },
};

describe('Ratings Create Form component', () => {
  store = mockStore({
    ratings: {
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
      window.HTMLCanvasElement.prototype.getContext = () => {
        return;
        // return whatever getContext has to return
      };
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <RatingForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <RatingForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <RatingForm onCreate={onCreate} data={data} />
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
            <RatingForm {...props} />
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
            <RatingForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
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
      data2.background_colour = null;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <RatingForm onCreate={props.onCreate} data={data2} />
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
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'name',
          slug: 'slug',
          numeric_value: 3,
          medium_id: 1,
          background_colour: null,
          text_colour: null,
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with new name', (done) => {
      const data2 = { ...data };
      data2.id = 1;
      data2.text_colour = {
        hex: '#f9f9fa',
        hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
        hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
        oldHue: 240,
        rgb: { r: 249, g: 249, b: 250, a: 1 },
        source: 'hsv',
      };
      data2.meta_fields = {
        sample: 'testing',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <RatingForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper
          .find('TitleInput')
          .find('FormItem')
          .find('FormItemInput')
          .find('BaseInput')
          .find('input');
        input.simulate('change', { target: { value: 'new name' } });

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          slug: 'new-name',
          numeric_value: 3,
          medium_id: 1,
          background_colour: {
            hex: '#f9f9fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 249, g: 249, b: 250, a: 1 },
            source: 'hsv',
          },
          text_colour: {
            hex: '#f9f9fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 249, g: 249, b: 250, a: 1 },
            source: 'hsv',
          },
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      const data2 = { ...data };
      data2.text_colour = {
        hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
        hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
        oldHue: 240,
        rgb: { r: 249, g: 249, b: 250, a: 1 },
        source: 'hsv',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <RatingForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const btn = wrapper.find('Button').at(5);
        expect(btn.text()).toBe('Expand');
        btn.simulate('click');
        wrapper.find(Collapse).at(1).find('Button').at(0).simulate('click');
      });
      wrapper.update();
      wrapper.find('FormItem').at(4).find('div').at(6).simulate('click');
      wrapper.find('FormItem').at(5).find('div').at(6).simulate('click');
      act(() => {
        wrapper
          .find('TitleInput')
          .find('FormItem')
          .find('FormItemInput')
          .find('BaseInput')
          .find('input')
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('SlugInput')
          .find('FormItem')
          .find('FormItemInput')
          .find('BaseInput')
          .find('input')
          .simulate('change', { target: { value: 'new-slug' } });
        wrapper
          .find('FormItem')
          .at(8)
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
          .at(3)
          .find('InputNumber')
          .props()
          .onChange({ target: { value: 4 } });
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
          .at(5)
          .find(SketchPicker)
          .at(0)
          .props()
          .onChange({
            hex: '#f0f1fa',
            hsl: { h: 245, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 245, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          });
        wrapper
          .find('FormItem')
          .at(11)
          .find('MonacoEditor')
          .props()
          .onChange({
            target: { value: '{"sample":"testing"}' },
          });
        wrapper.find('FormItem').at(4).find('div').at(9).simulate('click');
        wrapper.find('FormItem').at(5).find('div').at(9).simulate('click');

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          slug: 'new-slug',
          numeric_value: 4,
          medium_id: 1,
          background_colour: {
            hex: '#f0f0fa',
            hsl: { h: 240, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 240, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          },
          text_colour: {
            hex: '#f0f1fa',
            hsl: { h: 245, s: 0.0945170115208253, l: 0.9792376, a: 1 },
            hsv: { h: 245, s: 0.003999999999999949, v: 0.9812000000000001, a: 1 },
            oldHue: 240,
            rgb: { r: 240, g: 240, b: 250, a: 1 },
            source: 'hsv',
          },
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'New Description' } }],
            version: '2.19.0',
          },
          meta_fields: {
            sample: 'testing',
          },
        });
        done();
      }, 0);
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
