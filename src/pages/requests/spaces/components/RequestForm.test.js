import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../../../matchMedia.mock';
import SpaceRequestForm from './RequestForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../../../selectors/spaces', () => ({
  spaceSelector: jest.fn(),
}));

let onCreate, store;
const data = {
  space_id: 11,
  media: -1,
  posts: -1,
  episodes: 2,
  fact_check: true,
  description: 'Description',
};

describe('Space Request Form component', () => {
  store = mockStore({
    spaceRequests: {
      req: [],
      details: {},
      loading: true,
    },
    spaces:  {
      orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
      details: {
        11: { id: 11, name: 'Space 11' },
      },
      loading: false,
      selected: 11,
    },
  });
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockImplementation((state) => ({ spaces: [{ id: 11, name: 'Space 11' }] , loading: false }));

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
          <SpaceRequestForm />
        </Provider>,
        );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <SpaceRequestForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree = mount(
          <Provider store={store}>
            <SpaceRequestForm onCreate={onCreate} data={data} />
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
            <SpaceRequestForm {...props} />
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
            <SpaceRequestForm onCreate={props.onCreate} />
          </Provider>,
        );
      });
      act(() => {
        const submitButton = wrapper.find('Button').at(0);
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
    it('should submit form with updated data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Select')
          .props()
          .onChange({ target: { value: 12 } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('InputNumber')
          .props()
          .onChange({ target: { value:  10} });
        wrapper
          .find('FormItem')
          .at(2)
          .find('InputNumber')
          .props()
          .onChange({ target: { value:  15} });
        wrapper
          .find('FormItem')
          .at(3)
          .find('InputNumber')
          .props()
          .onChange({ target: { value:  20} });
        wrapper
          .find('FormItem')
          .at(4)
          .find('Switch')
          .at(0)
          .props()
          .onChange({target: {checked: false} });  
        wrapper
          .find('FormItem')
          .at(6)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'New description' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          space_id: 12,
          posts: 10,
          media: 20,
          episodes: 15,
          fact_check: false,
          description: 'New description',
        });
        done();
      }, 0);
    });
  });
})

