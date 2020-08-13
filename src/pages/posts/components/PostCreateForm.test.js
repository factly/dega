import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import PostCreateForm from './PostCreateForm';

const data = {
  id: 1,
  title: 'Post-1',
  excerpt: 'excerpt of post',
  slug: 'post-1',
  featured_medium_id: 1,
  status: 'draft',
  format: 1,
  categories: [1],
  tags: [1],
  claims: [1],
  authors: [1],
  description: {
    time: 1595747741807,
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Editor.js',
          level: 2,
        },
      },
      {
        type: 'paragraph',
        data: {
          text:
            'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
        },
      },
    ],
    version: '2.18.0',
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Posts Create Form component', () => {
  store = mockStore({
    posts: {
      req: [],
      details: {},
      loading: true,
    },
    formats: {
      req: [],
      details: {
        '1': {
          name: 'Fact check',
          slug: 'factcheck',
        },
      },
      loading: true,
    },
    authors: {
      req: [],
      details: {},
      loading: true,
    },
    tags: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    claims: {
      req: [],
      details: {},
      loading: true,
    },
    ratings: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {
        '1': {
          name: 'Sample Image',
          slug: 'sample-img',
        },
      },
      loading: true,
    },
  });
  useDispatch.mockReturnValue(jest.fn());
  useSelector.mockImplementation((state) => ({ details: [], total: 0, loading: false }));

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
            <PostCreateForm />
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
            <PostCreateForm onCreate={onCreate} data={data} />
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
        data: data,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PostCreateForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PostCreateForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        // draft button
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);

      act(() => {
        // publish button
        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
      wrapper.unmount();
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
        wrapper.update();
        submitButtom.simulate('click');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Post-1',
          excerpt: 'excerpt of post',
          slug: 'post-1',
          featured_medium_id: 1,
          status: 'Publish',
          format: 1,
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          claim_ids: [1],
          claims: [1],
          tag_ids: [1],
          tags: [1],
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with new name', (done) => {
      act(() => {
        const input = wrapper.find('FormItem').at(1).find('Input');
        input.simulate('change', { target: { value: 'Post test' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');

        submitButtom.simulate('click');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'Post test',
          excerpt: 'excerpt of post',
          slug: 'post-test',
          featured_medium_id: 1,
          status: 'Draft',
          format: 1,
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          claim_ids: [1],
          claims: [1],
          tag_ids: [1],
          tags: [1],
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
  });
});
