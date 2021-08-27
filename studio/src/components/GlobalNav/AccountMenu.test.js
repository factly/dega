import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import { mount } from 'enzyme';
import AccountMenu from './AccountMenu';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Account Menu component', () => {
  it('should render the component', () => {
    let store = mockStore({
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
    });
    let component = mount(
      <Provider store={store}>
        <AccountMenu />
      </Provider>,
    );
    expect(component).toMatchSnapshot();
  });
  it('should render the component with profile image', () => {
    let store = mockStore({
      profile: {
        details: {
          id: '1',
          first_name: 'abc',
          last_name: 'xyz',
          display_name: 'abc',
          slug: 'abc',
          email: 'abc@gmail.com',
          medium: {
            id: 1,
            name: 'medium',
            url: {
              proxy: 'url',
            },
          },
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
    });
    let component = mount(
      <Provider store={store}>
        <AccountMenu />
      </Provider>,
    );
    expect(component).toMatchSnapshot();
  });
  it('should render the component with no profile', () => {
    let store = mockStore({
      profile: {
        loading: false,
      },
    });
    let component = mount(
      <Provider store={store}>
        <AccountMenu />
      </Provider>,
    );
    expect(component).toMatchSnapshot();
  });
});
