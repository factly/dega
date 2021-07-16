import React from 'react';
import { useHistory } from 'react-router-dom';
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
              description: {
                time: 1613556798273,
                blocks: [{ type: 'header', data: { text: 'Description', level: 2 } }],
                version: '2.19.0',
              },
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
            },
            '2': {
              id: 2,
              name: 'CNN',
              slug: 'cnn',
              description: {
                time: 1613556798293,
                blocks: [{ type: 'header', data: { text: 'Description-2', level: 2 } }],
                version: '2.19.0',
              },
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
      const tree = mount(
        <Provider store={store}>
          <EditClaimant />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        claimants: {
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
          <EditClaimant />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        claimants: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditClaimant />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });

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
              description: {
                time: 1613556798273,
                blocks: [{ type: 'header', data: { text: 'Description', level: 2 } }],
                version: '2.19.0',
              },
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
            },
            '2': {
              id: 2,
              name: 'CNN',
              slug: 'cnn',
              description: {
                time: 1613556798293,
                blocks: [{ type: 'header', data: { text: 'Description-2', level: 2 } }],
                version: '2.19.0',
              },
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
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
        },
      });
    });
    it('should call get action', () => {
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
    it('should display RecordNotFound if not claimant found', () => {
      store = mockStore({
        claimants: {
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
              name: 'CNN',
              slug: 'cnn',
              description: {
                time: 1613556798293,
                blocks: [{ type: 'header', data: { text: 'Description-2', level: 2 } }],
                version: '2.19.0',
              },
              tag_line: 'tag line',
              claimant_date: '2017-12-12',
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
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        );
      });
      expect(wrapper.find(ClaimantEditForm).length).toBe(0);
      expect(wrapper.find('RecordNotFound').length).toBe(1);
    });
    it('should call updateClaimant', (done) => {
      actions.updateClaimant.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditClaimant />
          </Provider>,
        );
      });
      wrapper.find(ClaimantEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateClaimant).toHaveBeenCalledWith({
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
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/claimants/1/edit');
        done();
      }, 0);
    });
  });
});
