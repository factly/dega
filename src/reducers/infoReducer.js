import { ADD_INFO } from '../constants/info';

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

export default function infoReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case ADD_INFO:
      const posts = action.payload.posts;
      let article = {
        draft: 0,
        template: 0,
        publish: 0,
        ready: 0,
      };
      let factCheck = {
        draft: 0,
        template: 0,
        publish: 0,
        ready: 0,
      };

      posts.forEach((each) => {
        if (each.slug === 'article') {
          article[each.status] = each.count;
        }
        if (each.slug === 'fact-check') {
          factCheck[each.status] = each.count;
        }
      });
      return {
        ...action.payload,
        article,
        factCheck,
      };
    default:
      return state;
  }
}
