export type UrlParamValue = string | number | number[] | string[];

export interface UrlParams {
  [key: string]: UrlParamValue | undefined;
}

/**
 * Extract URL parameters from a URLSearchParams object
 * @param query URLSearchParams object containing query parameters
 * @param keys Optional array of keys to extract (defaults to common fields)
 * @returns Object with extracted parameters
 */
function getUrlParams(query: URLSearchParams, keys?: string[]): UrlParams {
  const paramKeys = keys || [
    "page",
    "limit",
    "q",
    "sort",
    "rating",
    "claimant",
  ];
  const params: UrlParams = {
    // Default values
    sort: "desc",
    limit: 10,
    page: 1,
  };

  paramKeys.forEach((key) => {
    // Skip if the key doesn't exist in the URL
    if (!query.has(key)) return;

    // Handle array parameters (rating, claimant, etc.)
    if (
      key === "claimant" ||
      key === "rating" ||
      key === "format" ||
      key === "tag" ||
      key === "category" ||
      key === "author"
    ) {
      const values = query.getAll(key);

      // If multiple values, store as array
      if (values.length > 1) {
        // Try to convert to numbers if possible
        if (values.every((val) => !isNaN(Number(val)))) {
          params[key] = values.map((v) => parseInt(v));
        } else {
          params[key] = values;
        }
      }
      // If single value
      else if (values.length === 1) {
        // Try to store as number if possible
        if (!isNaN(Number(values[0]))) {
          params[key] = [parseInt(values[0])];
        } else {
          params[key] = [values[0]];
        }
      }
    }
    // Handle sort parameter
    else if (key === "sort") {
      const sortValue = query.get(key);
      params[key] = sortValue || "desc";
    }
    // Handle pagination parameters
    else if (key === "page" || key === "limit") {
      const value = query.get(key);
      params[key] = value ? parseInt(value) : key === "page" ? 1 : 10;
    }
    // Handle string parameters
    else if (key === "q" || key === "status" || key === "language") {
      params[key] = query.get(key) || undefined;
    }
    // Default handler for other parameters
    else {
      const value = query.get(key);
      if (value === null) return;

      // Try to convert to number if possible
      if (!isNaN(Number(value))) {
        params[key] = parseInt(value);
      } else {
        params[key] = value;
      }
    }
  });

  return params;
}

export default getUrlParams;
