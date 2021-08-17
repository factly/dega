import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';
import { UpOutlined, DownOutlined, EditOutlined } from '@ant-design/icons';

import '../../../matchMedia.mock';
import ClaimList from './ClaimList';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const filters = {
  page: 1,
  limit: 20,
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
      3: {
        id: 3,
        created_at: '2020-09-10T10:12:47.819677Z',
        updated_at: '2020-09-10T10:12:47.819677Z',
        deleted_at: null,
        claim: 'No, these three IPS ',
        slug: 'no-these-three-ips',
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
};

let mockedDispatch, store;
describe('Factcheck claim list component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <ClaimList
              ids={[1, 2]}
              claimOrder={[2, 1]}
              setClaimID={jest.fn()}
              showModal={jest.fn()}
              setClaimOrder={jest.fn()}
              details={state.claims.details}
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
    it('should move claim up', () => {
      store = mockStore(state);
      let wrapper;
      const setClaimOrder = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                ids={[1, 2]}
                claimOrder={[2, 1]}
                setClaimID={jest.fn()}
                showModal={jest.fn()}
                setClaimOrder={setClaimOrder}
                details={state.claims.details}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(UpOutlined).at(1).simulate('click');
      });
      wrapper.update();
      expect(setClaimOrder).toBeCalledWith([1, 2]);
    });
    it('should move claim down', () => {
      store = mockStore(state);
      const setClaimOrder = jest.fn();
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                ids={[1, 2, 3]}
                claimOrder={[2, 1]}
                setClaimID={jest.fn()}
                showModal={jest.fn()}
                setClaimOrder={setClaimOrder}
                details={state.claims.details}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(DownOutlined).at(0).simulate('click');
      });
      wrapper.update();
      expect(setClaimOrder).toBeCalledWith([1, 2, 3]);
    });
    it('should handle edit and open claim modal', () => {
      store = mockStore(state);
      let wrapper;
      const showModal = jest.fn();
      const setClaimID = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                ids={[1, 2]}
                claimOrder={[2, 1]}
                setClaimID={setClaimID}
                showModal={showModal}
                setClaimOrder={jest.fn()}
                details={state.claims.details}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(EditOutlined).at(0).simulate('click');
      });
      expect(showModal).toBeCalledWith();
      expect(setClaimID).toBeCalledWith(2);
    });
    it('should disable up button for first element in list', () => {
      store = mockStore(state);
      let wrapper;
      const setClaimOrder = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                ids={[1, 2]}
                claimOrder={[2, 1]}
                setClaimID={jest.fn()}
                showModal={jest.fn()}
                setClaimOrder={setClaimOrder}
                details={state.claims.details}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(UpOutlined).at(0).simulate('click');
      });
      wrapper.update();
      expect(setClaimOrder).not.toBeCalled();
    });
    it('should disable down button form last element in list', () => {
      store = mockStore(state);
      const setClaimOrder = jest.fn();
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                ids={[1, 2, 3]}
                claimOrder={[2, 1]}
                setClaimID={jest.fn()}
                showModal={jest.fn()}
                setClaimOrder={setClaimOrder}
                details={state.claims.details}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper.find(DownOutlined).at(2).simulate('click');
      });
      wrapper.update();
      expect(setClaimOrder).not.toBeCalled();
    });
    it('should handle collapse', () => {
      store = mockStore(state);
      const setClaimOrder = jest.fn();
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimList
                ids={[1, 2, 3]}
                claimOrder={[2, 1]}
                setClaimID={jest.fn()}
                showModal={jest.fn()}
                setClaimOrder={setClaimOrder}
                details={state.claims.details}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const closeBtn = wrapper.find('Button').at(0);
        expect(closeBtn.text()).toBe('Close');
        closeBtn.simulate('click');
      });
      wrapper.update();
      expect(wrapper.find('Button').at(0).text()).toBe('Expand');
    });
  });
});
