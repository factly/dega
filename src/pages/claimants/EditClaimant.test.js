import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer, { act as rendererAct } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditClaimant from './EditClaimant';
import * as actions from '../../actions/claimants';
import ClaimantEditForm from './components/ClaimantForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/claimants', () => ({
  addClaimant: jest.fn(),
  getClaimant: jest.fn(),
  updateClaimant: jest.fn(),
}));

describe('Claimants edit component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({
        claimants: {
          req: [
            {
              data: [1, 2],
              query: {
                page: 1,
              },
              total: 2,
            },
          ],
          details: {
            '1': {
              id: 1,
              name: 'TOI',
              slug: 'toi',
              description: 'description',
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
            },
            '2': {
              id: 2,
              name: 'CNN',
              slug: 'cnn',
              description: 'description',
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
            },
          },
          loading: true,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      useSelector.mockReturnValueOnce({
        claimant: {
          id: 1,
          name: 'TOI',
          slug: 'toi',
          description: 'description',
          tag_line: 'tag line',
          claimant_date: '2017-12-12',
        },
        loading: false,
      });
      const tree = renderer
        .create(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      useSelector.mockReturnValueOnce({
        claimant: {},
        loading: false,
      });
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      useSelector.mockReturnValueOnce({
        claimant: {},
        loading: true,
      });
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      useSelector.mockReturnValueOnce({ rating: null, loading: true });
      actions.getClaimant.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        );
      });
      expect(actions.getClaimant).toHaveBeenCalledWith('1');
    });
    it('should call updateClaimant', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      useSelector.mockReturnValueOnce({ rating: {}, loading: false });
      actions.updateClaimant.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        );
      });
      wrapper.find(ClaimantEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateClaimant).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/claimants');
        done();
      }, 0);
    });
  });
});
