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

let state = {
  claims: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
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
      '2': {
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
      '1': {
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
      '1': {
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
            <ClaimList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.claims.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimList actions={['update', 'delete']} />
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
            <ClaimList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      expect(mockedDispatch).toHaveBeenCalledTimes(3);

      expect(getClaims).toHaveBeenCalledWith({ page: 1, limit: 5 });
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
              <ClaimList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(2);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(2);
    });
    it('should delete claim', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(2);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(deleteClaim).toHaveBeenCalled();
      expect(deleteClaim).toHaveBeenCalledWith(1);
      expect(getClaims).toHaveBeenCalledWith({ page: 1, limit: 5 });
    });
    it('should edit claim', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
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
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find(Button);
      expect(button.length).toEqual(1);
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'fact check' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'asc' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1] } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1] } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(getPosts).toHaveBeenCalledWith({
          page: 1,
          limit: 5,
          q: 'fact check',
          rating: [1],
          claimant: [1],
        });
      }, 0);
    });
  });
});
