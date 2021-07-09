import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { List } from 'antd';

import '../../matchMedia.mock';
import GoogleFactCheck from './GoogleFactCheck';
import { getGoogleFactChecks } from '../../actions/googleFactChecks';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  googleFactChecks: {
    req: [
      {
        data: [
          {
            text: 'Video shows Russian doctors celebrating the new COVID-19 vaccine.',
            claimant: 'Facebook posts',
            claimDate: '2020-09-08T02:48:10Z',
            claimReview: [
              {
                publisher: {
                  name: 'BOOM',
                  site: 'boomlive.in',
                },
                url:
                  'https://www.boomlive.in/world/video-from-saudi-arabia-shared-as-russian-doctors-celebrating-covid-19-vaccine-9654',
                title:
                  'Video From Saudi Arabia Shared As Russian Doctors Celebrating COVID-19 Vaccine',
                reviewDate: '2020-09-08T02:48:10Z',
                textualRating: 'False',
                languageCode: 'en',
              },
            ],
          },
          {
            text:
              'Pelosi travels weekly to California on a 200-seat Boeing that costs millions annually in fuel',
            claimant: 'social media users',
            claimDate: '2021-02-21T00:00:00Z',
            claimReview: [
              {
                publisher: {
                  name: 'BOOM',
                  site: 'boomlive.in',
                },
                url:
                  'https://www.usatoday.com/story/news/factcheck/2021/02/28/fact-check-false-claim-pelosi-travels-weekly-200-seat-plane/6860043002/',
                title: 'Fact check: False claim that Pelosi travels weekly on 200-seat ...',
                reviewDate: '2021-02-28T21:23:54Z',
                textualRating: 'False',
                languageCode: 'en',
              },
            ],
          },
        ],
        query: {
          page: 1,
          query: 'factcheck',
        },
        total: 2,
        nextPage: 'nextpage',
      },
    ],
    loading: false,
  },
};
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/googleFactChecks', () => ({
  getGoogleFactChecks: jest.fn(),
}));
describe('GoogleFactCheck component', () => {
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
          <GoogleFactCheck />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match when component loading', () => {
      state.googleFactChecks.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <GoogleFactCheck />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match when data', () => {
      state.googleFactChecks.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <GoogleFactCheck />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getGoogleFactChecks).toHaveBeenCalledWith({ page: 1, query: 'factcheck' });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should handle loadmore', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <GoogleFactCheck />
          </Provider>,
        );
      });
      const nextButton = wrapper.find('Button').at(2);
      expect(nextButton.text()).toBe('Next');
      nextButton.simulate('click');
      expect(getGoogleFactChecks).toHaveBeenCalledWith({ page: 1, query: 'factcheck' });
    });
    it('should handle loadPrevious ', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <GoogleFactCheck />
          </Provider>,
        );
      });
      const nextButton = wrapper.find('Button').at(2);
      expect(nextButton.text()).toBe('Next');
      nextButton.simulate('click');
      const previousButton = wrapper.find('Button').at(1);
      expect(previousButton.text()).toBe('Back');
      previousButton.simulate('click');
      expect(getGoogleFactChecks).toHaveBeenCalledWith({ page: 1, query: 'factcheck' });
    });
    it('should submit filters', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <GoogleFactCheck />
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'Russian doctors' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'en' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      setTimeout(() => {
        expect(getGoogleFactChecks).toHaveBeenCalledWith({
          page: 1,
          q: 'Russian doctors',
        });
      }, 0);
    });
    it('should submit with language as all', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <GoogleFactCheck />
          </Provider>,
        );
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'Russian doctors' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'all' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      setTimeout(() => {
        expect(getGoogleFactChecks).toHaveBeenCalledWith({
          page: 1,
          q: 'Russian doctors',
          language: 'all',
        });
      }, 0);
    });
  });
});
