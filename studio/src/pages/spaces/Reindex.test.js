import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import Reindex from './Reindex';
import * as actions from '../../actions/meiliReindex';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/meiliReindex', () => ({
  reindexSpace: jest.fn(),
  reindex: jest.fn(),
}));

describe('Spaces Reindex component', () => {
  let store;
  store = mockStore({
    admin: {
      organisation: {
        id: 34,
        created_at: '2022-04-29T11:18:24.571658Z',
        updated_at: '2022-04-29T11:18:24.571658Z',
        deleted_at: null,
        created_by_id: 1,
        updated_by_id: 1,
        organisation_id: 34,
        spaces: -1,
        space_permissions: [
          {
            id: 2,
            created_at: '2022-04-29T11:19:00.637145Z',
            updated_at: '2022-04-29T11:22:01.131442Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 1,
            fact_check: true,
            space_id: 2,
            media: -1,
            posts: -1,
            podcast: true,
            episodes: -1,
            videos: 0,
          },
          {
            id: 3,
            created_at: '2022-05-02T10:50:34.221018Z',
            updated_at: '2022-05-02T10:50:34.221018Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            fact_check: false,
            space_id: 3,
            media: 10,
            posts: 10,
            podcast: false,
            episodes: 0,
            videos: 0,
          },
        ],
      },
      loading: false,
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
          applications: [
            {
              id: 2,
              created_at: '2022-04-29T11:19:36.868351Z',
              updated_at: '2022-04-29T11:20:20.31628Z',
              deleted_at: null,
              created_by_id: 34,
              updated_by_id: 34,
              name: 'dega',
              description: '',
              url: 'http://127.0.0.1:4455/.factly/dega/studio/',
              medium_id: null,
              medium: null,
            },
          ],
          spaces: [3, 2],
        },
        {
          id: 35,
          created_at: '2022-04-29T09:49:17.813778Z',
          updated_at: '2022-04-29T09:49:17.813778Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          title: 'test-org2',
          slug: 'test-org2',
          permission: {
            id: 35,
            created_at: '2022-04-29T09:49:17.819434Z',
            updated_at: '2022-04-29T09:49:17.819434Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            role: 'owner',
          },
          applications: null,
          spaces: [],
        },
        {
          id: 36,
          created_at: '2022-04-29T10:31:16.687616Z',
          updated_at: '2022-04-29T10:31:16.687616Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          title: 'test-ORG',
          slug: 'test-org',
          permission: {
            id: 36,
            created_at: '2022-04-29T10:31:16.712003Z',
            updated_at: '2022-04-29T10:31:16.712003Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            role: 'owner',
          },
          applications: null,
          spaces: [],
        },
      ],
      details: {
        '2': {
          id: 2,
          created_at: '2022-04-29T11:19:00.634414Z',
          updated_at: '2022-05-13T10:02:01.574359Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          name: 'factly-eng',
          slug: 'factly-eng',
          site_title: '',
          tag_line: '',
          description: 'ggggg',
          site_address: '',
          logo_id: 1,
          logo: {
            id: 1,
            created_at: '2022-04-29T11:47:10.887731Z',
            updated_at: '2022-04-29T11:47:10.887731Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            name: 'sample-png-image',
            slug: 'sample-png-image',
            type: 'image/png',
            title: '',
            description: '',
            caption: '',
            alt_text: 'sample-png-image',
            file_size: 128544,
            url: {
              proxy: 'http://127.0.0.1:7001/dega/factly-eng/2022/3/1651232829590_sample-png-image',
              raw: 'http://localhost:9000/dega/factly-eng/2022/3/1651232829590_sample-png-image',
            },
            dimensions: '864x409',
            meta_fields: null,
            space_id: 2,
          },
          logo_mobile_id: 1,
          logo_mobile: {
            id: 1,
            created_at: '2022-04-29T11:47:10.887731Z',
            updated_at: '2022-04-29T11:47:10.887731Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            name: 'sample-png-image',
            slug: 'sample-png-image',
            type: 'image/png',
            title: '',
            description: '',
            caption: '',
            alt_text: 'sample-png-image',
            file_size: 128544,
            url: {
              proxy: 'http://127.0.0.1:7001/dega/factly-eng/2022/3/1651232829590_sample-png-image',
              raw: 'http://localhost:9000/dega/factly-eng/2022/3/1651232829590_sample-png-image',
            },
            dimensions: '864x409',
            meta_fields: null,
            space_id: 2,
          },
          fav_icon_id: 1,
          fav_icon: {
            id: 1,
            created_at: '2022-04-29T11:47:10.887731Z',
            updated_at: '2022-04-29T11:47:10.887731Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            name: 'sample-png-image',
            slug: 'sample-png-image',
            type: 'image/png',
            title: '',
            description: '',
            caption: '',
            alt_text: 'sample-png-image',
            file_size: 128544,
            url: {
              proxy: 'http://127.0.0.1:7001/dega/factly-eng/2022/3/1651232829590_sample-png-image',
              raw: 'http://localhost:9000/dega/factly-eng/2022/3/1651232829590_sample-png-image',
            },
            dimensions: '864x409',
            meta_fields: null,
            space_id: 2,
          },
          mobile_icon_id: 1,
          mobile_icon: {
            id: 1,
            created_at: '2022-04-29T11:47:10.887731Z',
            updated_at: '2022-04-29T11:47:10.887731Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            name: 'sample-png-image',
            slug: 'sample-png-image',
            type: 'image/png',
            title: '',
            description: '',
            caption: '',
            alt_text: 'sample-png-image',
            file_size: 128544,
            url: {
              proxy: 'http://127.0.0.1:7001/dega/factly-eng/2022/3/1651232829590_sample-png-image',
              raw: 'http://localhost:9000/dega/factly-eng/2022/3/1651232829590_sample-png-image',
            },
            dimensions: '864x409',
            meta_fields: null,
            space_id: 2,
          },
          verification_codes: null,
          social_media_urls: {
            facebook: 'sssssssttttttt',
          },
          contact_info: null,
          analytics: null,
          header_code: '',
          footer_code: '',
          meta_fields: null,
          organisation_id: 34,
          permissions: [
            {
              resource: 'admin',
              actions: ['admin'],
            },
          ],
          services: ['core', 'fact-checking', 'podcast'],
        },
        '3': {
          id: 3,
          created_at: '2022-05-02T10:50:34.211102Z',
          updated_at: '2022-05-02T10:50:34.211102Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          name: 'factly-hindi',
          slug: 'factly-hindi',
          site_title: 'factly-hindi',
          tag_line: '',
          description: '',
          site_address: '',
          logo_id: null,
          logo: null,
          logo_mobile_id: null,
          logo_mobile: null,
          fav_icon_id: null,
          fav_icon: null,
          mobile_icon_id: null,
          mobile_icon: null,
          verification_codes: null,
          social_media_urls: null,
          contact_info: null,
          analytics: null,
          header_code: '',
          footer_code: '',
          meta_fields: null,
          organisation_id: 34,
          permissions: [
            {
              resource: 'admin',
              actions: ['admin'],
            },
          ],
          services: ['core'],
        },
      },
      loading: false,
      selected: 2,
    },
    claims: {
      req: [],
      details: {},
      loading: false,
    },
    claimants: {
      req: [],
      details: {},
      loading: false,
    },
    rating: {
      req: [],
      details: {},
      loading: false,
    },
    media: {
      req: [],
      details: {},
      loading: false,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  const mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Reindex />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      act(() => component.unmount());
    });
  });
});
