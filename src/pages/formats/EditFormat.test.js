import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditFormat from './EditFormat';
import * as actions from '../../actions/formats';
import FormatEditForm from './components/FormatForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/formats', () => ({
  getFormat: jest.fn(),
  addFormat: jest.fn(),
  updateFormat: jest.fn(),
}));

describe('Formats edit component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({
        formats: {
          req: [],
          details: {
            '1': {
              id: 1,
              name: 'Article',
              slug: 'article',
              description: 'description',
            },
            '2': {
              id: 2,
              name: 'Factcheck',
              slug: 'factcheck',
              description: 'description',
            },
          },
          loading: false,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditFormat />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        formats: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditFormat />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        formats: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditFormat />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        formats: {
          req: [],
          details: {
            '1': {
              id: 1,
              name: 'Article',
              slug: 'article',
              description: 'description',
            },
            '2': {
              id: 2,
              name: 'Factcheck',
              slug: 'factcheck',
              description: 'description',
            },
          },
          loading: false,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getFormat.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditFormat />
          </Provider>,
        );
      });
      expect(actions.getFormat).toHaveBeenCalledWith('1');
    });
    it('should display RecordNotFound when format not found', () => {
      store = mockStore({
        formats: {
          req: [
            {
              data: [2],
              query: {
                page: 1,
              },
              total: 1,
            },
          ],
          details: {
            '2': {
              id: 2,
              name: 'Factcheck',
              slug: 'factcheck',
              description: 'description',
            },
          },
          loading: false,
        },
      });
      actions.getFormat.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditFormat />
          </Provider>,
        );
      });
      expect(actions.getFormat).toHaveBeenCalledWith('1');
      expect(wrapper.find('RecordNotFound').length).toBe(1);
    });
    it('should call updateFormat', () => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      actions.updateFormat.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditFormat />
          </Provider>,
        );
      });
      wrapper.find(FormatEditForm).props().onCreate({ test: 'test' });
      expect(actions.updateFormat).toHaveBeenCalledWith({
        id: 1,
        name: 'Article',
        slug: 'article',
        description: 'description',
        test: 'test',
      });
      expect(push).toHaveBeenCalledWith('/formats/1/edit');
    });
  });
});
