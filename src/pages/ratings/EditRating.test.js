import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer, { act as rendererAct } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditRating from './EditRating';
import * as actions from '../../actions/ratings';
import RatingEditForm from './components/RatingForm';

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

jest.mock('../../actions/ratings', () => ({
  getRating: jest.fn(),
  updateRating: jest.fn(),
  addRating: jest.fn(),
}));

describe('Ratings Edit component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({
        ratings: {
          req: [],
          details: {
            '1': {
              id: 1,
              name: 'True',
              slug: 'true',
              description: 'description',
              numeric_value: 5,
            },
            '2': {
              id: 2,
              name: 'False',
              slug: 'false',
              description: 'description',
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
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      useSelector.mockReturnValueOnce({
        rating: {
          id: 1,
          name: 'True',
          slug: 'true',
          description: 'description',
          numeric_value: 5,
        },
        loading: false,
      });
      const tree = renderer
        .create(
          <Provider store={store}>
            <EditRating />
          </Provider>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      useSelector.mockReturnValueOnce({
        rating: {},
        loading: false,
      });
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditRating />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      useSelector.mockReturnValueOnce({
        rating: {},
        loading: true,
      });
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditRating />
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
      actions.getRating.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditRating />
          </Provider>,
        );
      });
      expect(actions.getRating).toHaveBeenCalledWith('1');
    });
    it('should call updateRating', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      useSelector.mockReturnValueOnce({ rating: {}, loading: false });
      actions.updateRating.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditRating />
          </Provider>,
        );
      });
      wrapper.find(RatingEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateRating).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/ratings');
        done();
      }, 0);
    });
  });
});
