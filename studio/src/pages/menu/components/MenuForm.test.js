import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import MenuForm from './MenuForm';
import MenuField from './MenuField';
import { MinusCircleOutlined } from '@ant-design/icons';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});

let onCreate, store;
const data = {
  name: 'Menu',
  menu: [
    {
      name: 'Menu 1',
      menu: [
        {
          name: 'Submenu 1',
        },
      ],
    },
    {
      name: 'Menu 2',
    },
  ],
};

describe('Menu Create Form component', () => {
  store = mockStore({
    menu: {
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
          <MenuForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <MenuForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = shallow(<MenuForm onCreate={onCreate} data={data} />);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        onCreate: jest.fn(),
        data: {
          name: 'Menu',
          menu: [
            {
              name: 'Menu 1',
              menu: [
                {
                  name: 'Submenu 1',
                },
              ],
            },
            {
              name: 'Menu 2',
            },
          ],
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MenuForm {...props} />
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
            <MenuForm onCreate={props.onCreate} />
          </Provider>,
        );
      });
      act(() => {
        const submitButton = wrapper.find('Button').at(1);
        expect(submitButton.text()).toEqual('Submit');
        submitButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButton = wrapper.find('Button').at(1);
        submitButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith(props.data);
        done(0);
      }, 0);
    });
    it('should submit form with new title', (done) => {
      const data2 = { ...data };
      data2.id = 1;
      data2.meta_fields = {
        sample: 'testing',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MenuForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper.find('input').at(0);
        input.simulate('change', { target: { value: 'New menu name' } });
        const submitButton = wrapper.find('Button').at(4);
        expect(submitButton.text()).toBe('Update');
        submitButton.simulate('submit');
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'New menu name',
          menu: [
            {
              name: 'Menu 1',
              menu: [
                {
                  name: 'Submenu 1',
                },
              ],
            },
            {
              name: 'Menu 2',
            },
          ],
          meta_fields: {
            sample: 'testing',
          },
        });
        done();
      }, 0);
    });
    it('should create new menu field on click of Add Menu', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MenuForm onCreate={props.onCreate} />
          </Provider>,
        );
      });
      expect(wrapper.find(MenuField).length).toBe(0);
      const addMenuButton = wrapper.find('Button').at(0);
      addMenuButton.simulate('click');
      wrapper.update();
      expect(wrapper.find(MenuField).length).toBe(1);
    });
    it('should remove field on click on remove field button', () => {
      const data = {
        name: 'Menu',
        menu: [
          {
            name: 'Menu 1',
          },
          {
            name: 'Menu 2',
          },
          {
            name: 'Menu 3',
          },
        ],
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MenuForm onCreate={props.onCreate} data={data} />
          </Provider>,
        );
      });
      const total_menuFields = wrapper.find(MenuField).length;
      wrapper.find(MinusCircleOutlined).at(0).simulate('click');
      expect(wrapper.find(MenuField).length).toBe(total_menuFields - 1);
    });
  });
});
