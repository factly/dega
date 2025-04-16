import deepEqual from "deep-equal";

// Define interfaces for the state and other objects
interface Query {
  page: string | null;
  limit: string | null;
  q?: string;
  [key: string]: any;
}

interface RequestNode {
  query: Query;
  data: string[] | number[];
  total: number;
}

interface EntityState {
  req: RequestNode[];
  details: { [key: string]: any };
  loading: boolean;
}

interface State {
  [key: string]: EntityState;
}

interface SelectorResult {
  [key: string]: any[] | number | boolean;
  total: number;
  loading: boolean;
}

export const entitySelector = (
  state: State,
  query: {
    page?: number | string | null;
    limit?: number | string | null;
    [key: string]: any;
  },
  entity: string
): SelectorResult => {
  // Normalize the query format to match what is stored in state
  const normalizedQuery = {
    page: query.page?.toString() || null,
    limit: query.limit?.toString() || null,
  };

  // Find the matching request node
  const node = state[entity]?.req.find((item) => {
    return deepEqual(item.query, normalizedQuery);
  });

  if (node) {
    // Create an empty result object
    const result: SelectorResult = {
      total: node.total,
      loading: state[entity].loading,
      [entity]: [],
    };

    // Map the entity data and store it with the entity name as key
    result[entity] = node.data
      .map((element) => {
        // Make sure the element exists in details before returning it
        return state[entity].details[element] || null;
      })
      .filter(Boolean); // Remove any null values

    return result;
  }

  // Handle case where entity might not exist or req array is empty
  if (!state[entity]) {
    console.warn(`Entity "${entity}" not found in state`);
    return { [entity]: [], total: 0, loading: false };
  }

  return {
    [entity]: [],
    total: 0,
    loading: state[entity].loading,
  };
};
