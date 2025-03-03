export type UrlParamValue = string | number | number[];

export interface UrlParams {
  sort: "asc" | "desc";
  limit: number;
  page: number;
  q?: string;
  claimant?: number[];
  rating?: number[];
  format?: number[];
  tag?: number[];
  category?: number[];
  author?: number[];
  status?: string;
  language?: string;
  [key: string]: UrlParamValue | undefined;
}

function getUrlParams(query: URLSearchParams, filters?: string[]): UrlParams {
  const keys = filters ? filters : ["page", "limit", "q", "sort"];
  const params: UrlParams = {
    sort: "desc",
    limit: 10,
    page: 1,
  };

  keys.forEach((key) => {
    if (query.get(key)) {
      if (
        key === "claimant" ||
        key === "rating" ||
        key === "format" ||
        key === "tag" ||
        key === "category" ||
        key === "author"
      ) {
        const val = query.getAll(key).map((v) => parseInt(v));
        params[key] = val;
      } else if (key === "sort") {
        const sortValue = query.get(key);
        params[key] =
          sortValue === "asc" || sortValue === "desc" ? sortValue : "desc";
      } else if (key === "q" || key === "status" || key === "language") {
        params[key] = query.get(key) as string;
      } else {
        const paramValue = query.get(key);
        params[key] = paramValue ? parseInt(paramValue) : undefined;
      }
    }
  });

  return params;
}

export default getUrlParams;
