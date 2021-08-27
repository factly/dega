import React from 'react';
import { DatePicker, Radio } from 'antd';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import moment from 'moment';

import '../../matchMedia.mock';
import Profile from './index';
import { getUserProfile, updateProfile } from '../../actions/profile';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

global.fetch = jest.fn();

let m = moment('12 Dec 2020 00:00:00 IST', 'DD MMM YYYY HH:mm:ss');
const birthDate = m.format();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/profile', () => ({
  getUserProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

describe('Profiles index component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));

  describe('snapshot testing', () => {
    it('should render the component', () => {
      store = mockStore({
        profile: {},
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Profile />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      store = mockStore({
        profile: {
          details: {
            id: '1',
            first_name: 'abc',
            last_name: 'xyz',
            display_name: 'abc',
            slug: 'abc',
            email: 'abc@gmail.com',
            birth_date: birthDate,
            social_media_urls: {
              facebook: 'facebook/abc',
              twitter: 'twitter/abc',
              linkedin: 'linkedin/abc',
              instagram: 'instagram/abc',
            },
            description: 'Description',
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Profile />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getUserProfile).toHaveBeenCalled();
    });
  });
  describe('component testing', () => {
    store = mockStore({
      profile: {
        details: {
          id: '1',
          first_name: 'abc',
          last_name: 'xyz',
          display_name: 'abc',
          slug: 'abc',
          email: 'abc@gmail.com',
          birth_date: birthDate,
          social_media_urls: {
            facebook: 'facebook/abc',
            twitter: 'twitter/abc',
            linkedin: 'linkedin/abc',
            instagram: 'instagram/abc',
          },
          description: 'Description',
        },
        loading: false,
      },
      media: {
        req: [],
        details: {},
        loading: false,
      },
    });
    let wrapper;
    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Profile />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should submit form with data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .simulate('change', { target: { value: 'firstname' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Input')
          .simulate('change', { target: { value: 'lastname' } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Input')
          .simulate('change', { target: { value: 'new Display Name' } });
        wrapper
          .find('FormItem')
          .at(5)
          .find(DatePicker)
          .at(0)
          .props()
          .onChange({
            target: { value: moment('10 Oct 2020 00:00:00 IST') },
          });
        wrapper
          .find('FormItem')
          .at(6)
          .find(Radio.Group)
          .at(0)
          .props()
          .onChange({ target: { value: 'male' } });

        const updateButtom = wrapper.find('Button').at(1);
        expect(updateButtom.text()).toBe('Update');
        updateButtom.simulate('submit');
      });

      wrapper.update();

      setTimeout(() => {
        expect(getUserProfile).toHaveBeenCalled();
        expect(updateProfile).toHaveBeenCalledTimes(1);
        expect(wrapper.find('FormItem').at(12).find('Button').props().disabled).toBe(false);
        expect(updateProfile).toHaveBeenCalledWith({
          first_name: 'firstname',
          last_name: 'lastname',
          display_name: 'new Display Name',
          slug: 'new-display-name',
          birth_date: moment('10 Oct 2020 00:00:00 IST').format('YYYY-MM-DDTHH:mm:ssZ'),
          social_media_urls: {
            facebook: 'facebook/abc',
            twitter: 'twitter/abc',
            linkedin: 'linkedin/abc',
            instagram: 'instagram/abc',
          },
          description: 'Description',
          featured_medium_id: undefined,
          gender: 'male',
        });
        done();
      });
    });
    it('should disable update button unless any change', () => {
      const store2 = mockStore({
        profile: {
          details: {
            id: '1',
            first_name: 'abc',
            last_name: 'xyz',
            display_name: 'abc',
            slug: 'abc',
            email: 'abc@gmail.com',
            social_media_urls: {
              facebook: 'facebook/abc',
              twitter: 'twitter/abc',
              linkedin: 'linkedin/abc',
              instagram: 'instagram/abc',
            },
            description: 'Description',
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Profile />
          </Provider>,
        );
      });
      expect(wrapper.find('FormItem').at(12).find('Button').props().disabled).toBe(true);
    });
  });
});
