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

jest.mock('../../actions/ratings', () => ({
  getRating: jest.fn(),
  updateRating: jest.fn(),
  addRating: jest.fn(),
}));

describe('Ratings Edit component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    window.HTMLCanvasElement.prototype.getContext = () => {
      return;
      // return whatever getContext has to return
    };
    beforeEach(() => {
      store = mockStore({
        ratings: {
          req: [],
          details: {
            '1': {
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
            '2': {
              id: 2,
              name: 'False',
              slug: 'false',
              description: {
                time: 1613559903398,
                blocks: [{ type: 'paragraph', data: { text: 'Description2' } }],
                version: '2.19.0',
              },
              numeric_value: 5,
            },
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: {
          orgs: [],
          details: {},
          loading: true,
          selected: 0,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditRating />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        ratings: {
          req: [],
          details: {},
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditRating />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        ratings: {
          req: [],
          details: {},
          loading: true,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditRating />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
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
            2: {
              id: 2,
              name: 'False',
              slug: 'false',
              description: {
                time: 1613559903398,
                blocks: [{ type: 'paragraph', data: { text: 'Description2' } }],
                version: '2.19.0',
              },
              numeric_value: 5,
            },
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: {
          orgs: [],
          details: {},
          loading: true,
          selected: 0,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
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
    it('should display RecordNotFound when rating not found', () => {
      store = mockStore({
        ratings: {
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
            2: {
              id: 2,
              name: 'False',
              slug: 'false',
              description: {
                time: 1613559903398,
                blocks: [{ type: 'paragraph', data: { text: 'Description2' } }],
                version: '2.19.0',
              },
              numeric_value: 5,
            },
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      actions.getRating.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditRating />
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(actions.getRating).toHaveBeenCalledWith('1');
    });
    it('should call updateRating', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
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
        expect(actions.updateRating).toHaveBeenCalledWith({
          id: 1,
          name: 'True',
          slug: 'true',
          description: {
            time: 1613559903378,
            blocks: [{ type: 'paragraph', data: { text: 'Description' } }],
            version: '2.19.0',
          },
          numeric_value: 5,
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/ratings/1/edit');
        done();
      }, 0);
    });
  });
});
