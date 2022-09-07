import reducer from '../../reducers/searchReducer';
import * as types from '../../constants/search';

const initialState = {
  req: [],
  details: {
    articles: [],
    'fact-checks': [],
    pages: [],
    claims: [],
    tags: [],
    categories: [],
    media: [],
    ratings: [],
    total: 0,
  },
  loading: true,
};

describe('search reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, name: 'entity' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, name: 'entity' } },
      loading: false,
    });
  });
  it('should handle  SET_SEARCH_DETAILS_LOADING ', () => {
    expect(
      reducer(initialState, {
        type: types.SET_SEARCH_DETAILS_LOADING,
        payload: true,
      }),
    ).toEqual({
      ...initialState,
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_SEARCH_DETAILS_LOADING,
        payload: false,
      }),
    ).toEqual({
      ...initialState,
      loading: false,
    });
  });
  it('should handle ADD_SEARCH_DETAIL if data is empty ', () => {
    expect(
      reducer(initialState, { type: types.ADD_SEARCH_DETAIL, payload: { data: [], formats: [] } }),
    ).toEqual(initialState);
  });

  it('should handle ADD_SEARCH_DETAIL if data has a post which is a page ', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SEARCH_DETAIL,
        payload: {
          data: [
            {
              name: 'new post',
              kind: 'post',
              is_page: true,
            },
          ],
          formats: [],
        },
      }),
    ).toEqual({
      ...initialState,
      total: 1,
      details: {
        ...initialState.details,
        pages: [{ name: 'new post', kind: 'post', is_page: true }],
      },
    });
  });

  it('should handle ADD_SEARCH_DETAIL if data has a post which is a page and a template ', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SEARCH_DETAIL,
        payload: {
          data: [
            {
              name: 'new post',
              kind: 'post',
              is_page: true,
              status: 'template',
            },
          ],
          formats: [],
        },
      }),
    ).toEqual({ ...initialState, total: 1, details: { ...initialState.details, pages: [] } });
  });

  it('should handle ADD_SEARCH_DETAIL if data has a tag , category , claims , media , ratings  ', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SEARCH_DETAIL,
        payload: {
          data: [
            { name: 'new tag', kind: 'tag' },
            { name: 'new category', kind: 'category' },
            { name: 'error', kind: 'error' },
            { name: 'new claim', kind: 'claim' },
            { name: 'new media', kind: 'medium' },
          ],

          formats: [],
        },
      }),
    ).toEqual({
      ...initialState,
      total: 5,
      details: {
        ...initialState.details,
        tags: [{ name: 'new tag', kind: 'tag' }],
        categories: [{ name: 'new category', kind: 'category' }],
        claims: [{ name: 'new claim', kind: 'claim' }],
        media: [{ name: 'new media', kind: 'medium' }],
      },
    });
  });

  it('should handle ADD_SEARCH_DETAIL if data has a fact-check ', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SEARCH_DETAIL,
        payload: {
          data: [{ name: 'new fact-check', format_id: 0, kind: 'post' }],
          formats: { 0: { slug: 'fact-check' } },
        },
      }),
    ).toEqual({
      ...initialState,
      total: 1,
      details: {
        ...initialState.details,
        'fact-checks': [{ name: 'new fact-check', format_id: 0, kind: 'post' }],
      },
    });
  });

  it('should handle ADD_SEARCH_DETAIL if data has a article ', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SEARCH_DETAIL,
        payload: {
          data: [{ name: 'new article', format_id: 0, kind: 'post' }],
          formats: { 0: { slug: 'article' } },
        },
      }),
    ).toEqual({
      ...initialState,
      total: 1,
      details: {
        ...initialState.details,
        articles: [{ name: 'new article', format_id: 0, kind: 'post' }],
      },
    });
  });
});
