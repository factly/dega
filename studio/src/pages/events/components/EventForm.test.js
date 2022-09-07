import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import EventForm from './EventForm';

jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store, mockedDispatch;

const data = {
  name: 'event',
};

describe('Event form component', () => {
  store = mockStore({});
  store.dispatch = jest.fn();
  mockedDispatch = jest.fn();
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({
    events: {
      req: [],
      details: {},
      loading: false,
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
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EventForm />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <EventForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <EventForm onCreate={onCreate} data={data} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    store = mockStore({
      events: {
        req: [],
        details: {},
        loading: true,
      },
    });
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
      props = {
        onCreate: jest.fn(),
        data: data,
      };
    });
    it('should submit form with given data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EventForm {...props} />
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Submit');
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
      const data2 = { ...data };
      data2.tags = JSON.stringify({ app: 'dega' });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EventForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper.find('input').at(0);
        input.simulate('change', { target: { value: 'new name' } });

        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          tags: {
            app: 'dega',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      const data2 = { ...data };
      data2.tags = {
        app: 'dega',
      };
      data2.id = 1;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EventForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'new name' } });
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          tags: {
            app: 'dega',
          },
        });
        done();
      }, 0);
    });
  });
});
