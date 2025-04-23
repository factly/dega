
// hooks/usePageData.ts
import { useSelector } from "react-redux";
import deepEqual from "deep-equal";
import getUrlParams from "../../../utils/getUrlParams";
import { RootState, FilterParams } from "../types";

export const usePageData = (query: URLSearchParams) => {
  return useSelector((state: RootState) => {
    const params = getUrlParams(query, [
      "page", "limit", "q", "sort", "tag", "category", "author", "status",
    ]) as FilterParams;

    const node = state.pages.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        pages: node.data.map((element) => {
          const page = state.pages.details[element];
          page.medium = state.media.details[page.featured_medium_id || 0];
          return page;
        }),
        total: node.total,
        loading: state.pages.loading,
        tags: state.tags.details,
        categories: state.categories.details,
      };
    return {
      pages: [],
      total: 0,
      loading: state.pages.loading,
      tags: {},
      categories: {},
    };
  });
};

