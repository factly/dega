import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';

import '../../../matchMedia.mock';
import EpisodeForm from './EpisodeForm';

jest.mock('@editorjs/editorjs');

const data = {
  id: 1,
  title: 'Episode 1',
  slug: 'episode-1',
  season: 1,
  episode: 1,
  type: 'full',
  description: {
    time: 1595747741807,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Description',
        },
      },
    ],
    version: '2.18.0',
  },
  audio_url: 'audioUrl',
  medium_id: 1,
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Episode Form component', () => {
  store = mockStore({
    episodes: {
      req: [
        {
          data: [1],
          query: {
            page: 1,
            limit: 5,
          },
          total: 1,
        },
      ],
      details: {
        1: {
          id: 1,
          title: 'Episode 1',
          slug: 'episode-1',
          season: 1,
          episode: 1,
          podcast: [1],
          type: 'full',
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: 'Description',
                },
              },
            ],
            version: '2.18.0',
          },
          audio_url: 'audioUrl',
          medium_id: 1,
        },
      },
      loading: false,
    },
    podcasts: {
      req: [
        {
          data: [1],
          query: {
            page: 1,
            limit: 5,
          },
          total: 1,
        },
      ],
      details: {
        1: {
          id: 1,
          title: 'Podcast-1',
          slug: 'podcast-1',
          medium_id: 1,
          language: 'english',
          categories: [1],
          episodes: [1],
        },
      },
      loading: false,
    },
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
  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EpisodeForm />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EpisodeForm onCreate={onCreate} data={data} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        onCreate: jest.fn(),
        data: {
          title: 'Episode 1',
          slug: 'episode-1',
          season: 1,
          episode: 1,
          podcast: [1],
          type: 'full',
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: 'Description',
                },
              },
            ],
            version: '2.18.0',
          },
          audio_url: 'audioUrl',
          medium_id: 1,
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EpisodeForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EpisodeForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({ ...props.data, podcast_id: [1] });
        done();
      }, 0);
    });
    it('should submit form with new title', (done) => {
      act(() => {
        const input = wrapper.find('FormItem').at(0).find('Input');
        input.simulate('change', { target: { value: 'New Episode name' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'New Episode name',
          slug: 'new-episode-name',
          season: 1,
          episode: 1,
          podcast: [1],
          podcast_id: [1],
          type: 'full',
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: 'Description',
                },
              },
            ],
            version: '2.18.0',
          },
          audio_url: 'audioUrl',
          medium_id: 1,
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EpisodeForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const input = wrapper.find('FormItem').at(0).find('Input');
        input.simulate('change', { target: { value: 'New Episode' } });

        wrapper.find('FormItem').at(10).find('Audio').props().onUpload('newAudioUrl');

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'New Episode',
          slug: 'new-episode',
          audio_url: 'newAudioUrl',
        });
        done();
      }, 0);
    });
  });
});
