import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider, useSelector } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';

import CodeInjection from './CodeInjection';
import * as actions from '../../actions/spaces';
import { Form } from 'antd';

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
  useHistory: jest.fn(),
}));
jest.mock('../../actions/spaces', () => ({
  updateSpace: jest.fn(),
}));

describe('CodeInjection component', () => {
  let store;
  store = mockStore({
    spaces: {
      orgs: [
        {
          id: 34,
          created_at: '2022-04-29T07:10:05.626434Z',
          updated_at: '2022-04-29T07:10:05.626434Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          title: 'test',
          slug: 'test',
          permission: {
            id: 34,
            created_at: '2022-04-29T07:10:05.637767Z',
            updated_at: '2022-04-29T07:10:05.637767Z',
            deleted_at: null,
            created_by_id: 34,
            updated_by_id: 34,
            role: 'owner',
          },
          spaces: [2],
        },
      ],
      details: {
        '2': {
          id: 2,
          created_at: '2022-04-29T11:19:00.634414Z',
          updated_at: '2022-06-28T08:58:44.782829Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          name: 'factly-eng',
          slug: 'factly-eng',
          site_title: '',
          tag_line: '',
          description: '',
          site_address: '',
          header_code: '',
          footer_code: '',
          contact_info: null,
          organisation_id: 34,
        },
      },
      loading: false,
      selected: 2,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  const mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = shallow(
          <Provider store={store}>
            <CodeInjection />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      act(() => component.unmount());
    });
  });
  it('should match skeleton while loading', () => {
    let tree;
    store = mockStore({
      spaces: {
        orgs: [],
        details: {},
        loading: true,
        selected: 0,
      },
    });
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <CodeInjection />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        spaces: {
          orgs: [
            {
              id: 34,
              created_at: '2022-04-29T07:10:05.626434Z',
              updated_at: '2022-04-29T07:10:05.626434Z',
              deleted_at: null,
              created_by_id: 34,
              updated_by_id: 34,
              title: 'test',
              slug: 'test',
              permission: {
                id: 34,
                created_at: '2022-04-29T07:10:05.637767Z',
                updated_at: '2022-04-29T07:10:05.637767Z',
                deleted_at: null,
                created_by_id: 34,
                updated_by_id: 34,
                role: 'owner',
              },
              spaces: [2],
            },
          ],
          details: {
            '2': {
              id: 2,
              created_at: '2022-04-29T11:19:00.634414Z',
              updated_at: '2022-06-28T08:58:44.782829Z',
              deleted_at: null,
              created_by_id: 34,
              updated_by_id: 34,
              name: 'factly-eng',
              slug: 'factly-eng',
              site_title: '',
              tag_line: '',
              description: '',
              site_address: '',
              header_code: '',
              footer_code: '',
              contact_info: null,
              organisation_id: 34,
            },
          },
          loading: false,
          selected: 2,
        },
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should display RecordNotFound when no space found', () => {
      let store = mockStore({
        spaces: {
          orgs: [],
          details: {},
          loading: false,
          selected: 0,
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
            <CodeInjection />
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(wrapper.find(Form).length).toBe(0);
    });

    it('should call updateSpace', (done) => {
      actions.updateSpace.mockReset();
      useDispatch.mockReturnValueOnce(() => Promise.resolve({}));
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CodeInjection />
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('MonacoEditor')
          .at(0)
          .props()
          .onChange({ target: { value: 'header-code' } });
        wrapper
          .find('MonacoEditor')
          .at(1)
          .props()
          .onChange({ target: { value: 'footer-code' } });
        wrapper.find('Button').at(0).simulate('submit');
      });
      setTimeout(() => {
        expect(actions.updateSpace).toHaveBeenCalledWith({
          id: 2,
          created_at: '2022-04-29T11:19:00.634414Z',
          updated_at: '2022-06-28T08:58:44.782829Z',
          deleted_at: null,
          created_by_id: 34,
          updated_by_id: 34,
          organisation_id: 34,
          name: 'factly-eng',
          slug: 'factly-eng',
          footer_code: 'footer-code',
          header_code: 'header-code',
          site_title: '',
          tag_line: '',
          description: '',
          site_address: '',
          contact_info: null,
        });
        done();
      }, 0);
    });
  });
});
