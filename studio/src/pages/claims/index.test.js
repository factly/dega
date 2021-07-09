import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Claims from './index';
import { shallow, mount } from 'enzyme';
import { getClaims } from '../../actions/claims';

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

jest.mock('../../actions/claims', () => ({
  getClaims: jest.fn(),
  addClaim: jest.fn(),
}));
let state = {
  claims: {
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
    details: {
      1: {
        id: 1,
        created_at: '2020-07-17T10:14:44.251814Z',
        updated_at: '2020-07-17T10:14:44.251814Z',
        checked_date: '2020-07-17T10:14:44.251814Z',
        claim_date: '2020-07-17T10:14:44.251814Z',
        deleted_at: null,
        name: 'claim-1',
        slug: 'claim-1',
        description: '',
        claimant_id: 1,
        rating_id: 1,
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
        },
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        name: 'TOI',
        slug: 'toi',
        description: {
          time: 1613556798273,
          blocks: [{ type: 'header', data: { text: 'Description', level: 2 } }],
          version: '2.19.0',
        },
        tag_line: 'tag line',
        claimant_date: '2017-12-12',
      },
    },
    loading: false,
  },
  ratings: {
    req: [],
    details: {
      1: {
        id: 1,
        name: 'True',
        slug: 'true',
        description: {
          time: 1613559903378,
          blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
          version: '2.19.0',
        },
        numeric_value: 5,
      },
    },
    loading: true,
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
  sidebar: {
    collapsed: false,
  },
};
describe('Claims List component', () => {
  let store;
  let mockedDispatch;
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore(state);
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      let state2 = {
        claims: {
          req: [],
          details: {},
          loading: false,
        },
        claimants: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              name: 'TOI',
              slug: 'toi',
              description: {
                time: 1613556798273,
                blocks: [{ type: 'header', data: { text: 'Description', level: 2 } }],
                version: '2.19.0',
              },
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
            },
          },
          loading: false,
        },
        ratings: {
          req: [],
          details: {
            1: {
              id: 1,
              name: 'True',
              slug: 'true',
              description: {
                time: 1613559903378,
                blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
                version: '2.19.0',
              },
              numeric_value: 5,
            },
          },
          loading: true,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: {
          orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
        sidebar: {
          collapsed: false,
        },
      };
      store = mockStore(state2);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Claims permission={{ actions: ['create'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Claims permission={{ actions: ['create'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getClaims).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Claims permission={{ actions: ['update', 'delete'] }} />
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
          .at(2)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'asc' } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1] } });
        wrapper
          .find('FormItem')
          .at(4)
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
