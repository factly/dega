import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer, { act as rendererAct } from 'react-test-renderer';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditTag from './EditTag';
import * as actions from '../../actions/tags';
import TagEditForm from './components/TagForm';

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

jest.mock('../../actions/tags', () => ({
  getTag: jest.fn(),
  addTag: jest.fn(),
  updateTag: jest.fn(),
}));

describe('Tags List component', () => {
  const store = mockStore({
    tags: {
      req: [],
      details: {
        '1': {
          id: 1,
          name: 'Tag-1',
          slug: 'tag-1',
          description: 'description',
        },
        '2': {
          id: 2,
          name: 'Tag-2',
          slug: 'tag-2',
          description: 'description',
        },
      },
      loading: true,
    },
  });
  store.dispatch = jest.fn(() => ({}));

  const mockedDispatch = jest.fn();
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      useSelector.mockReturnValueOnce({
        tag: {
          id: 1,
          name: 'tag',
          slug: 'slug',
          description: 'description',
        },
        loading: false,
      });
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditTag />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      useSelector.mockReturnValueOnce({
        tag: {},
        loading: false,
      });
      let component;
      store.details = {};
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditTag />
          </Provider>,
        );
      });
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      useSelector.mockReturnValueOnce({
        tag: {},
        loading: true,
      });
      let component;
      rendererAct(() => {
        component = renderer.create(
          <Provider store={store}>
            <EditTag />
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
      useSelector.mockReturnValueOnce({ tag: null, loading: true });
      actions.getTag.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditTag />
          </Provider>,
        );
      });
      expect(actions.getTag).toHaveBeenCalledWith('1');
    });
    it('should call updateTag', () => {
      useSelector.mockReturnValueOnce({ tag: {}, loading: false });
      actions.updateTag.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditTag />
          </Provider>,
        );
      });
      wrapper.find(TagEditForm).props().onCreate({ test: 'test' });
      expect(actions.updateTag).toHaveBeenCalledWith({ test: 'test' });
      expect(push).toHaveBeenCalledWith('/tags');
    });
  });
});
