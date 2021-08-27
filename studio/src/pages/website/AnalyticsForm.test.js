import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import AnalyticsForm from './AnalyticsForm';
import { updateSpace } from '../../actions/spaces';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '11' }),
}));
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../actions/spaces', () => ({
  updateSpace: jest.fn(),
}));

let onCreate, store;

describe('Analytics Form component', () => {
  store = mockStore({
    spaces: {
      orgs: [{ id: 2, title: 'Organization 2', spaces: [] }],
      details: {
        11: {
          id: 11,
          organisation_id: 1,
          name: 'name',
          slug: 'slug',
          site_title: 'site_title',
          tag_line: 'tag_line',
          description: 'description',
          site_address: 'site_address',
          analytics: {
            plausible: {
              domain: 'domain',
              embed_code: 'embed-code',
              server_url: 'url',
            },
          },
        },
      },
      loading: false,
      selected: 11,
    },
  });
  useDispatch.mockReturnValue(jest.fn());

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
          <AnalyticsForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AnalyticsForm />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should submit form with added data', (done) => {
      updateSpace.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AnalyticsForm />
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .simulate('change', { target: { value: 'new server url' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Input')
          .simulate('change', { target: { value: 'new domain' } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('TextArea')
          .simulate('change', { target: { value: 'new embed code' } });

        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(updateSpace).toHaveBeenCalledTimes(1);
        expect(updateSpace).toHaveBeenCalledWith({
          id: 11,
          organisation_id: 1,
          name: 'name',
          slug: 'slug',
          site_title: 'site_title',
          tag_line: 'tag_line',
          description: 'description',
          site_address: 'site_address',
          analytics: {
            plausible: {
              domain: 'new domain',
              embed_code: 'new embed code',
              server_url: 'new server url',
            },
          },
        });
        done();
      }, 0);
    });
    it('should display RecordNotFound when no space found', () => {
      store = mockStore({
        spaces: {
          orgs: [],
          details: {},
          loading: false,
          selected: 0,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AnalyticsForm />
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
    });
    it('should display Skeleton when loading', () => {
      store = mockStore({
        spaces: {
          orgs: [],
          details: {},
          loading: true,
          selected: 0,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AnalyticsForm />
          </Provider>,
        );
      });
      expect(wrapper.find('Skeleton').length).toBe(1);
    });
  });
});
