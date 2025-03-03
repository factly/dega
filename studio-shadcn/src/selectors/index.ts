import deepEqual from "deep-equal";

// Define interfaces for the state and other objects
interface Query {
  page: number | string;
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
  [key: string]: any[];
  total: number;
  loading: boolean;
}

export const entitySelector = (
  state: State,
  page: number | string,
  entity: string
): SelectorResult => {
  const node = state[entity].req.find((item) => {
    return deepEqual(item.query, { page });
  });

  if (node)
    return {
      [entity]: node.data.map((element) => state[entity].details[element]),
      total: node.total,
      loading: state[entity].loading,
    };
  return { [entity]: [], total: 0, loading: state[entity].loading };
};
