import { SET_SEARCH_DETAILS_LOADING, ADD_SEARCH_DETAIL } from '../constants/search';

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

export default function authorsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SEARCH_DETAILS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SEARCH_DETAIL:
      const { data, formats } = action.payload;
      if (data.length === 0) {
        return initialState;
      }

      const result = {
        articles: [],
        'fact-checks': [],
        pages: [],
        claims: [],
        tags: [],
        categories: [],
        media: [],
        ratings: [],
        total: 0,
      };

      const kind = {
        category: 'categories',
        tag: 'tags',
        claim: 'claims',
        rating: 'ratings',
        medium: 'media',
      };

      data.forEach((each) => {
        if (each.kind === 'post' && each.is_page) {
          if (each.status !== 'template') result.pages.push(each);
        } else if (each.kind === 'post') {
          if (formats[each.format_id].slug === 'article' && each.status !== 'template') {
            result.articles.push(each);
          }
          if (formats[each.format_id].slug === 'fact-check' && each.status !== 'template') {
            result['fact-checks'].push(each);
          }
        } else if (kind[each.kind]) {
          result[kind[each.kind]].push(each);
        }
      });

      return {
        ...state,
        details: result,
        total: data.length,
      };
    default:
      return state;
  }
}
