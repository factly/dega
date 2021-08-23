import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import ClaimList from './ClaimList';
import { getClaims, deleteClaim } from '../../../actions/claims';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/claims', () => ({
  getClaims: jest.fn(),
  deleteClaim: jest.fn(),
}));
const filters = {
  page: 1,
  limit: 20,
};
const setFilters = jest.fn();
const fetchClaims = jest.fn();
const info = {
  claims: [
    {
      id: 1,
      created_at: '2020-09-10T10:12:47.819677Z',
      updated_at: '2020-09-10T10:12:47.819677Z',
      deleted_at: null,
      title: 'No, these three IPS officers are not siblings, they are batch mates',
      slug: 'no-these-three-ips-officers-are-not-siblings-they-are-batch-mates',
      claim_date: '2020-09-02T10:12:41Z',
      checked_date: '2020-09-10T10:12:44Z',
      claim_sources: '',
      description: {
        time: 1599732752528,
        blocks: [
          {
            data: {
              text:
                'Fact: The three people in the image are identified as Pooja Vashisth, Tushar Gupta and Shruta Kirti Somavanshi. All these three are IPS officers. They are batchmates but not siblings which was confirmed by Tushar when we reached out to him. Also, Somavanshi reiterated the same through an Instagram account called ‘upscmeme’ of which he is the admin. Hence the claim made in the post is FALSE.',
            },
            type: 'paragraph',
          },
        ],
        version: '2.18.0',
      },
      claimant_id: 1,
      claimant: 'Facebook',
      rating_id: 1,
      rating: 'False',
      review: '',
      review_tag_line: '',
      review_sources: '',
      space_id: 1,
    },
    {
      id: 2,
      created_at: '2020-09-10T10:12:47.819677Z',
      updated_at: '2020-09-10T10:12:47.819677Z',
      deleted_at: null,
      title: 'No, these three IPS officers are not siblings, they are batch mates',
      slug: 'no-these-three-ips-officers-are-not-siblings-they-are-batch-mates',
      checked_date: '2020-09-10T10:12:44Z',
      claim_sources: '',
      description: {
        time: 1599732752528,
        blocks: [
          {
            data: {
              text:
                'Fact: The three people in the image are identified as Pooja Vashisth, Tushar Gupta and Shruta Kirti Somavanshi. All these three are IPS officers. They are batchmates but not siblings which was confirmed by Tushar when we reached out to him. Also, Somavanshi reiterated the same through an Instagram account called ‘upscmeme’ of which he is the admin. Hence the claim made in the post is FALSE.',
            },
            type: 'paragraph',
          },
        ],
        version: '2.18.0',
      },
      claimant_id: 1,
      claimant: 'Facebook',
      rating_id: 1,
      rating: 'False',
      review: '',
      review_tag_line: '',
      review_sources: '',
      space_id: 1,
    },
  ],
  total: 2,
  loading: false,
};
let state = {
  claims: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-10T10:12:47.819677Z',
        updated_at: '2020-09-10T10:12:47.819677Z',
        deleted_at: null,
        claim: 'No, these three IPS officers are not siblings, they are batch mates',
        slug: 'no-these-three-ips-officers-are-not-siblings-they-are-batch-mates',
        claim_date: '2020-09-02T10:12:41Z',
        checked_date: '2020-09-10T10:12:44Z',
        claim_sources: '',
        description: {
          time: 1599732752528,
          blocks: [
            {
              data: {
                text:
                  'Fact: The three people in the image are identified as Pooja Vashisth, Tushar Gupta and Shruta Kirti Somavanshi. All these three are IPS officers. They are batchmates but not siblings which was confirmed by Tushar when we reached out to him. Also, Somavanshi reiterated the same through an Instagram account called ‘upscmeme’ of which he is the admin. Hence the claim made in the post is FALSE.',
              },
              type: 'paragraph',
            },
          ],
          version: '2.18.0',
        },
        claimant_id: 1,
        claimant: 'Facebook',
        rating_id: 1,
        rating: 'False',
        fact: '',
        review_tag_line: '',
        review_sources: '',
        space_id: 1,
      },
      2: {
        id: 2,
        created_at: '2020-09-10T10:12:47.819677Z',
        updated_at: '2020-09-10T10:12:47.819677Z',
        deleted_at: null,
        claim: 'No, these three IPS officers are not siblings, they are batch mates',
        slug: 'no-these-three-ips-officers-are-not-siblings-they-are-batch-mates',
        checked_date: '2020-09-10T10:12:44Z',
        claim_sources: '',
        description: {
          time: 1599732752528,
          blocks: [
            {
              data: {
                text:
                  'Fact: The three people in the image are identified as Pooja Vashisth, Tushar Gupta and Shruta Kirti Somavanshi. All these three are IPS officers. They are batchmates but not siblings which was confirmed by Tushar when we reached out to him. Also, Somavanshi reiterated the same through an Instagram account called ‘upscmeme’ of which he is the admin. Hence the claim made in the post is FALSE.',
              },
              type: 'paragraph',
            },
          ],
          version: '2.18.0',
        },
        claimant_id: 1,
        claimant: 'Facebook',
        rating_id: 1,
        rating: 'False',
        fact: '',
        review_tag_line: '',
        review_sources: '',
        space_id: 1,
      },
    },
    loading: false,
  },
  ratings: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 5,
        },
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:50:18.471677Z',
        updated_at: '2020-09-09T06:50:18.471677Z',
        deleted_at: null,
        name: 'True',
        slug: 'true',
        description: '',
        numeric_value: 5,
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
  claimants: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 5,
        },
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:51:15.770644Z',
        updated_at: '2020-09-09T06:51:15.770644Z',
        deleted_at: null,
        name: 'Whatsapp',
        slug: 'whatsapp',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
};

let mockedDispatch, store;
describe('Claims List component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimList
              actions={['update', 'delete']}
              data={{ claimants: [], total: 0, loading: false }}
              filters={filters}
              setFilters={setFilters}
              fetchClaims={fetchClaims}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.claims.loading = true;
      store = mockStore(state);
      const info2 = { ...info };
      info2.loading = true;
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimList
              actions={['update', 'delete']}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchClaims={fetchClaims}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with claims', () => {
      state.claims.loading = false;
      store = mockStore(state);

      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimList
              actions={['update', 'delete']}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchClaims={fetchClaims}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchClaims={fetchClaims}
              />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(1);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(1);
    });
    it('should delete claim', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchClaims={fetchClaims}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(0);
      expect(button.text()).toEqual('');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(deleteClaim).toHaveBeenCalled();
      expect(deleteClaim).toHaveBeenCalledWith(1);
    });
    it('should edit claim', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchClaims={fetchClaims}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.prop('to')).toEqual('/claims/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        claims: {
          req: [],
        },
        ratings: {
          req: [],
        },
        claimants: {
          req: [],
        },
      });
      const info2 = { ...info };
      info2.claims = [];
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                actions={['update', 'delete']}
                data={info2}
                filters={filters}
                setFilters={setFilters}
                fetchClaims={fetchClaims}
              />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
