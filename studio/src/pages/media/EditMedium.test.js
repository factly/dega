import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import { Form, Popconfirm } from 'antd';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditMedium from './EditMedium';
import * as actions from '../../actions/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/media', () => ({
  createMedium: jest.fn(),
  getMedium: jest.fn(),
  updateMedium: jest.fn(),
  deleteMedium: jest.fn(),
}));

describe('Media edit component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({
        media: {
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
              name: 'name',
              url: 'some-url',
              file_size: 'file_size',
              caption: 'caption',
              description: 'description',
            },
          },
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditMedium />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        media: {
          req: [],
          details: {},
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditMedium />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        media: {
          req: [],
          details: {},
          loading: true,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditMedium />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        media: {
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
              name: 'name',
              url: 'some-url',
              file_size: 'file_size',
              caption: 'caption',
              description: 'description',
            },
          },
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getMedium.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditMedium />
            </Router>
          </Provider>,
        );
      });
      expect(actions.getMedium).toHaveBeenCalledWith('1');
    });
    it('should display RecordNotFound when media not found', () => {
      store = mockStore({
        media: {
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
              name: 'name',
              url: 'some-url',
              file_size: 'file_size',
              caption: 'caption',
              description: 'description',
            },
          },
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      actions.getMedium.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditMedium />
          </Provider>,
        );
      });
      expect(actions.getMedium).toHaveBeenCalledWith('1');
      expect(wrapper.find('RecordNotFound').length).toBe(1);
    });
    it('should call updateMedia', () => {
      actions.updateMedium.mockReset();
      store = mockStore({
        media: {
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
              name: 'name',
              url: 'some-url',
              file_size: 'file_size',
              caption: 'caption',
              description: 'description',
              meta_fields: {
                sample: 'testing',
              },
            },
          },
          loading: false,
        },
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: {
              id: 11,
              name: 'Space 11',
              permissions: [{ resource: 'admin', actions: ['admin'] }],
            },
          },
          loading: false,
          selected: 11,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditMedium permission={{ actions: ['admin'] }} />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('input')
          .at(2)
          .simulate('change', { target: { value: 'caption ' } });
        const submitButton = wrapper.find('Button').at(2);
        expect(submitButton.text()).toBe('Submit');
        submitButton.simulate('submit');
      });
      wrapper.update();
      wrapper.find(Form).props().onFinish({ test: 'test' });
      expect(actions.updateMedium).toHaveBeenCalledWith({
        id: 1,
        name: 'name',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
        test: 'test',
        meta_fields: '{"sample":"testing"}',
      });
    });
    it('should call deleteMedia', (done) => {
      actions.deleteMedium.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditMedium permission={{ actions: ['admin'] }} />
            </Router>
          </Provider>,
        );
      });
      const submitButton = wrapper.find('Button').at(1);
      expect(submitButton.text()).toBe('Delete');
      submitButton.simulate('click');

      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      setTimeout(() => {
        expect(actions.deleteMedium).toHaveBeenCalledWith('1');
        done();
      }, 0);
    });
  });
});
