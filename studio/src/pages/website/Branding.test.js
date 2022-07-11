import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';

import Branding from './Branding';
import * as actions from '../../actions/spaces';
import { Form } from 'antd';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));
jest.mock('../../actions/spaces', () => ({
  updateSpace: jest.fn(),
}));

describe('Branding component', () => {
  let store;
  store = mockStore({
    spaces: {
      orgs: [
        {
          id: 34,
          created_at: '2022-04-29T07:10:05.626434Z',
          updated_at: '2022-04-29T07:10:05.626434Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          title: 'test',
          slug: 'test',
          permission: {
            id: 34,
            created_at: '2022-04-29T07:10:05.637767Z',
            updated_at: '2022-04-29T07:10:05.637767Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            role: 'owner',
          },
          spaces: [2],
        },
      ],
      details: {
        '2': {
          id: 2,
          created_at: '2022-04-29T11:19:00.634414Z',
          updated_at: '2022-06-28T08:58:44.782829Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          name: 'factly-eng',
          slug: 'factly-eng',
          site_title: '',
          tag_line: '',
          description: '',
          site_address: '',
          logo_id: 1,
          logo_mobile_id: 1,
          fav_icon_id: 1,
          mobile_icon_id: 1,
          social_media_urls: {
            facebook: 'fb.com',
            twitter: 'twitter.com',
            pintrest: 'pinterest.com',
            instagram: 'instagram.com',
          },
          contact_info: null,
          organisation_id: 34,
        },
      },
      loading: false,
      selected: 2,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  const mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = shallow(
          <Provider store={store}>
            <Branding />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      act(() => component.unmount());
    });
  });
  it('should match skeleton while loading', () => {
    let tree;
    store = mockStore({
      spaces: {
        orgs: [],
        details: {},
        loading: true,
        selected: 0,
      },
    });
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <Branding />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        media: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: {
          orgs: [
            {
              id: 34,
              created_at: '2022-04-29T07:10:05.626434Z',
              updated_at: '2022-04-29T07:10:05.626434Z',
              deleted_at: null,
              created_by_id: 34,
              updated_by_id: 34,
              title: 'test',
              slug: 'test',
              permission: {
                id: 34,
                created_at: '2022-04-29T07:10:05.637767Z',
                updated_at: '2022-04-29T07:10:05.637767Z',
                deleted_at: null,
                created_by_id: 34,
                updated_by_id: 34,
                role: 'owner',
              },
              spaces: [2],
            },
          ],
          details: {
            '2': {
              id: 2,
              created_at: '2022-04-29T11:19:00.634414Z',
              updated_at: '2022-06-28T08:58:44.782829Z',
              deleted_at: null,
              created_by_id: 34,
              updated_by_id: 34,
              name: 'factly-eng',
              slug: 'factly-eng',
              site_title: '',
              tag_line: '',
              description: '',
              site_address: '',
              logo_id: 1,
              logo_mobile_id: 1,
              fav_icon_id: 1,
              mobile_icon_id: 1,
              social_media_urls: {
                facebook: 'fb.com',
                twitter: 'twitter.com',
                pintrest: 'pinterest.com',
                instagram: 'instagram.com',
              },
              contact_info: null,
              organisation_id: 34,
            },
          },
          loading: false,
          selected: 2,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should display RecordNotFound when no space found', () => {
      let store = mockStore({
        spaces: {
          orgs: [],
          details: {},
          loading: false,
          selected: 0,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Branding />
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(wrapper.find(Form).length).toBe(0);
    });

    it('should call updateSpace', (done) => {
      actions.updateSpace.mockReset();
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Branding />
          </Provider>,
        );
      });
      act(() => {
        wrapper.find('Collapse').at(1).props().onChange();
        wrapper.find('CollapsePanel').at(2).find('Button').at(0).simulate('click');
      });
      wrapper.update();
      act(() => {
        wrapper
          .find('MediaSelector')
          .at(0)
          .props()
          .onChange({ target: { value: 2 } });
        wrapper
          .find('MediaSelector')
          .at(1)
          .props()
          .onChange({ target: { value: 3 } });
        wrapper
          .find('MediaSelector')
          .at(2)
          .props()
          .onChange({ target: { value: 4 } });
        wrapper
          .find('MediaSelector')
          .at(3)
          .props()
          .onChange({ target: { value: 5 } });

        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'm.fb.com' } });
        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'm.twitter.com' } });
        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(2)
          .simulate('change', { target: { value: 'm.insta.com' } });
        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(3)
          .simulate('change', { target: { value: 'm.github.com' } });
        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(4)
          .simulate('change', { target: { value: 'm.youtube.com' } });
        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(5)
          .simulate('change', { target: { value: 'm.linkedin.com' } });
        wrapper
          .find('Collapse')
          .at(1)
          .find('input')
          .at(6)
          .simulate('change', { target: { value: 'm.pin.com' } });
        wrapper.find('Button').at(0).simulate('submit');
      });
      setTimeout(() => {
        expect(actions.updateSpace).toHaveBeenCalledWith({
          id: 2,
          created_at: '2022-04-29T11:19:00.634414Z',
          updated_at: '2022-06-28T08:58:44.782829Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          organisation_id: 34,
          name: 'factly-eng',
          slug: 'factly-eng',
          site_title: '',
          tag_line: '',
          description: '',
          site_address: '',
          logo_id: 2,
          logo_mobile_id: 3,
          mobile_icon_id: 5,
          fav_icon_id: 4,
          contact_info: null,
          social_media_urls: {
            facebook: 'm.fb.com',
            github: 'm.github.com',
            instagram: 'm.insta.com',
            linkedin: 'm.linkedin.com',
            pinterest: 'm.pin.com',
            twitter: 'm.twitter.com',
            youtube: 'm.youtube.com',
          },
        });
        done();
      }, 0);
    });
  });
});
