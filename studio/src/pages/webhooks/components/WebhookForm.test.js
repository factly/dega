import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import WebhookForm from './WebhookForm';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store, mockedDispatch;

const data = {
  name: 'webhook',
  url: 'url',
  enabled: true,
  events: [],
};

describe('Webhook form component', () => {
  store = mockStore({});
  store.dispatch = jest.fn();
  mockedDispatch = jest.fn();
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({
    webhooks: {
      req: [],
      details: {},
      loading: true,
    },
    events: {
      req: [
        {
          data: [1],
          query: {
            page: 1,
            limit: 20,
          },
          total: 1,
        },
      ],
      loading: false,
      details: {
        1: {
          id: 1,
          name: 'event.created',
        },
      },
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
            <WebhookForm />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <WebhookForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <WebhookForm onCreate={onCreate} data={data} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    store = mockStore({
      webhooks: {
        req: [],
        details: {},
        loading: true,
      },
      events: {
        req: [
          {
            data: [1],
            query: {
              page: 1,
              limit: 20,
            },
            total: 1,
          },
        ],
        loading: false,
        details: {
          1: {
            id: 1,
            name: 'event',
          },
        },
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
            <WebhookForm {...props} />
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({ ...props.data, event_ids: [], events: [] });
        done();
      }, 0);
    });
    it('should submit form with new name', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <WebhookForm {...props} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper.find('FormItem').at(0).find('Input');
        input.simulate('change', { target: { value: 'new name' } });

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          url: 'url',
          enabled: true,
          events: [],
          event_ids: [],
        });
        done();
      }, 0);
    });
    it('should load more events', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <WebhookForm {...props} />
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Load More Events');
        submitButtom.simulate('click');
        wrapper.update();
      });
    });
    it('should submit form with updated data', (done) => {
      const data2 = { ...data };
      data2.events = [1];
      data2.id = 1;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <WebhookForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .simulate('change', { target: { value: 'new url' } });
        wrapper.find('FormItem').at(2).find('Switch').at(0).props().onChange(false);

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          url: 'new url',
          events: [1],
          enabled: false,
          event_ids: [1],
        });
        done();
      }, 0);
    });
    it('should submit form with no events', (done) => {
      const data2 = {
        id: 1,
        name: 'webhook',
        url: 'url',
        enabled: true,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <WebhookForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .simulate('change', { target: { value: 'new url' } });
        wrapper.find('FormItem').at(2).find('Switch').at(0).props().onChange(false);

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'new name',
          url: 'new url',
          enabled: false,
          event_ids: [],
          events: undefined,
        });
        done();
      }, 0);
    });
  });
});
