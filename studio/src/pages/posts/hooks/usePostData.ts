import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import getUrlParams from "../../../utils/getUrlParams";
import { RootState, FilterParams } from "../types";

export const usePostData = (query: URLSearchParams) => {
  return useSelector((state: RootState) => {
    const params = getUrlParams(query, [
      "page",
      "limit",
      "q",
      "sort",
      "tag",
      "category",
      "author",
      "status",
    ]) as FilterParams;

    const node = state.posts.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        posts: node.data.map((element) => {
          const post = state.posts.details[element];
          post.medium = state.media.details[post.featured_medium_id || 0];
          return post;
        }),
        total: node.total,
        loading: state.posts.loading,
        tags: state.tags.details,
        categories: state.categories.details,
        authors: state.authors.details,
      };
    return {
      posts: [],
      total: 0,
      loading: state.posts.loading,
      tags: {},
      categories: {},
      authors: {},
    };
  });
};
