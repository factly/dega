import React from 'react';
import { Provider } from 'react-redux';
import { act } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';

import '../../../matchMedia.mock';
import Audio from './Audio';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('../../../components/Uppy', () => ({
  UppyUploader: jest.fn().mockReturnValue([{ url: { raw: 'returnedUrl' } }]),
}));

describe('Audio Component', () => {
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const onUpload = jest.fn();
      const tree = mount(<Audio onUpload={onUpload} />);
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with url', () => {
      const onUpload = jest.fn();
      const url = 'dummyUrl';
      const tree = mount(<Audio onUpload={onUpload} url={url} />);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should remove audio on click of remove button', () => {
      const onUpload = jest.fn();
      const url = 'dummyUrl';
      const store = mockStore({
        spaces: {
          orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
      });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Audio onUpload={onUpload} url={url} />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);

      expect(selectButton.text()).toBe('Remove');
      selectButton.simulate('click');
    });
  });
});
