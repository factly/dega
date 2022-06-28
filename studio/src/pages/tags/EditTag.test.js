import React from 'react';
import { useHistory } from 'react-router-dom';
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

jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/tags', () => ({
  getTag: jest.fn(),
  createTag: jest.fn(),
  updateTag: jest.fn(),
}));

describe('Tags List component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({
        tags: {
          req: [],
          details: {
            1: {
              id: 1,
              name: 'Tag-1',
              slug: 'tag-1',
              description: {
                time: 1613561493761,
                blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
                version: '2.19.0',
              },
            },
            2: {
              id: 2,
              name: 'Tag-2',
              slug: 'tag-2',
              description: {
                time: 1613561493781,
                blocks: [{ type: 'paragraph', data: { text: 'Description 2' } }],
                version: '2.19.0',
              },
            },
          },
          loading: false,
        },
        spaces: {
          orgs: [],
          details: { 1: { site_address: '' } },
          loading: true,
          selected: 1,
        },
        media: {
          req: [],
          details: {},
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
          <EditTag />
        </Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        tags: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditTag />
        </Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        tags: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditTag />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        tags: {
          req: [],
          details: {
            1: {
              id: 1,
              name: 'Tag-1',
              slug: 'tag-1',
              description: {
                time: 1613561493761,
                blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
                version: '2.19.0',
              },
            },
            2: {
              id: 2,
              name: 'Tag-2',
              slug: 'tag-2',
              description: {
                time: 1613561493781,
                blocks: [{ type: 'paragraph', data: { text: 'Description 2' } }],
                version: '2.19.0',
              },
            },
          },
          loading: false,
        },
        spaces: {
          orgs: [],
          details: { 1: { site_address: '' } },
          loading: true,
          selected: 1,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      store.dispatch = jest.fn(() => ({}));

      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should display RecordNotFound when tag not found', () => {
      store = mockStore({
        tags: {
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
            2: {
              id: 2,
              name: 'Tag-2',
              slug: 'tag-2',
              description: {
                time: 1613561493781,
                blocks: [{ type: 'paragraph', data: { text: 'Description 2' } }],
                version: '2.19.0',
              },
            },
          },
          loading: false,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditTag />
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
    });
    it('should call get action', () => {
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
      expect(actions.updateTag).toHaveBeenCalledWith({
        id: 1,
        name: 'Tag-1',
        slug: 'tag-1',
        description: {
          time: 1613561493761,
          blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
          version: '2.19.0',
        },
        test: 'test',
      });
      expect(push).toHaveBeenCalledWith('/tags/1/edit');
    });
  });
});
