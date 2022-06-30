import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { Collapse } from 'antd';

import '../../../matchMedia.mock';
import ClaimantCreateForm from './ClaimantForm';

const data = {
  name: 'name',
  slug: 'slug',
  description: {
    time: 1613544901542,
    blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
    version: '2.19.0',
  },
  tag_line: 'tag_line',
  medium_id: 1,
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

describe('Claimants Create Form component', () => {
  store = mockStore({
    claimants: {
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
          <ClaimantCreateForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <ClaimantCreateForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <ClaimantCreateForm onCreate={onCreate} data={data} />
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
          name: 'name',
          slug: 'slug',
          description: {
            time: 1613544901542,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          tag_line: 'tag_line',
          medium_id: 1,
          meta_fields: {
            sample: 'testing',
          },
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimantCreateForm {...props} />
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
            <ClaimantCreateForm onCreate={props.onCreate} />
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
          name: 'name',
          slug: 'slug',
          description: {
            time: 1613544901542,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          tag_line: 'tag_line',
          medium_id: 1,
        });
        done();
      }, 0);
    });
    it('Text on button should be Update for existing data', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimantCreateForm onCreate={props.onCreate} data={{ ...data, id: 1 }} />
          </Provider>,
        );
      });
      const submitButtom = wrapper.find('Button').at(1);
      expect(submitButtom.text()).toBe('Update');
    });
    it('should submit form with new name', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimantCreateForm onCreate={props.onCreate} data={data} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper.find('input').at(0);
        input.simulate('change', { target: { value: 'new name' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          slug: 'new-name',
          description: {
            time: 1613544901542,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          tag_line: 'tag_line',
          medium_id: 1,
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      act(() => {
        wrapper.find(Collapse).at(1).find('Button').at(0).simulate('click');
      });
      wrapper.update();

      act(() => {
        wrapper
          .find('FormItem')
          .at(6)
          .find('Editor')
          .props()
          .onChange({
            target: {
              value: {
                time: 1613544901542,
                blocks: [{ type: 'paragraph', data: { text: 'New-Description' } }],
                version: '2.19.0',
              },
            },
          });
        wrapper
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'new-slug' } });
        wrapper
          .find('FormItem')
          .at(4)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'new tag line' } });
        wrapper
          .find('FormItem')
          .at(7)
          .find('MonacoEditor')
          .props()
          .onChange({
            target: { value: '{"sample":"testing"}' },
          });
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          description: {
            time: 1613544901542,
            blocks: [{ type: 'paragraph', data: { text: 'New-Description' } }],
            version: '2.19.0',
          },
          slug: 'new-slug',
          medium_id: 1,
          tag_line: 'new tag line',
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
