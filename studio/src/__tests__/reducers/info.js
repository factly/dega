import reducer from '../../reducers/infoReducer';
import * as types from '../../constants/info';

const initialState = {
  categories: 0,
  tag: 0,
  article: {
    draft: 0,
    template: 0,
    publish: 0,
  },
  factCheck: {
    draft: 0,
    template: 0,
    publish: 0,
  },
  podcasts: 0,
};

describe('Info reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        categories: 0,
        tag: 0,
        article: {
          draft: 0,
          template: 0,
          publish: 0,
        },
        factCheck: {
          draft: 0,
          template: 0,
          publish: 0,
        },
        podcasts: 0,
      }),
    ).toEqual({
      categories: 0,
      tag: 0,
      article: {
        draft: 0,
        template: 0,
        publish: 0,
      },
      factCheck: {
        draft: 0,
        template: 0,
        publish: 0,
      },
      podcasts: 0,
    });
  });
  it('should handle ADD_INFO', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_INFO,
        payload: {
          categories: 1,
          tag: 1,
          podcasts: 1,
          episodes: 1,
          posts: [
            {
              count: 1,
              slug: 'article',
              status: 'ready',
            },
            {
              count: 2,
              slug: 'fact-check',
              status: 'draft',
            },
          ],
        },
      }),
    ).toEqual({
      categories: 1,
      tag: 1,
      episodes: 1,
      article: {
        draft: 0,
        template: 0,
        publish: 0,
        ready: 1,
      },
      factCheck: {
        draft: 2,
        template: 0,
        publish: 0,
        ready: 0,
      },
      podcasts: 1,
      posts: [
        {
          count: 1,
          slug: 'article',
          status: 'ready',
        },
        {
          count: 2,
          slug: 'fact-check',
          status: 'draft',
        },
      ],
    });
    // expect(
    //   reducer(initialState, {
    //     type: types.ADD_INFO,
    //     payload: false,
    //   }),
    // ).toEqual({
    //   collapsed: false,
    // });
  });
});
