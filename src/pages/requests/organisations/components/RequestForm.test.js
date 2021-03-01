import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../../matchMedia.mock';
import CreateOrganisationRequestForm from './RequestForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;
const data = {
  organisation_id: 1,
  spaces: 4,
  description: 'Description',
};

describe('Organisation Request Form component', () => {
  store = mockStore({
    organisationRequests: {
      req: [],
      details: {},
      loading: false,
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
  
  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      const tree = mount (
        <Provider store={store}>
          <CreateOrganisationRequestForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      const tree  = mount(
          <Provider store={store}>
            <CreateOrganisationRequestForm data={[]} />
          </Provider>,
        );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      const tree =  mount(
          <Provider store={store}>
            <CreateOrganisationRequestForm onCreate={onCreate} data={data} />
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
          organisation_id: 1,
          spaces: 4,
          description: 'Description',
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateOrganisationRequestForm {...props} />
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
            <CreateOrganisationRequestForm onCreate={props.onCreate} />
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
    it('should submit data with given data', (done) => {
      act(() => {
        const submitButton = wrapper.find('Button').at(0);
        submitButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith(props.data);
        done();
      }, 0);
    });
    it('should submit form with new updated data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(1)
          .find('InputNumber')
          .props()
          .onChange({ target: { value : 5 }});
        wrapper
          .find('FormItem')
          .at(0)
          .find('Select')
          .props()
          .onChange({ target : { value: 2}});
        wrapper
          .find('FormItem')
          .at(2)  
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value : 'New Description'}});
        
        const submitButton = wrapper.find('Button').at(0);
        submitButton.simulate('submit');
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          organisation_id: 2,
          spaces: 5,
          description: 'New Description',
        });
        done();
      }, 0);
    });

  });
});