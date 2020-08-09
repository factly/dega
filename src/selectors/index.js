import deepEqual from 'deep-equal';

export const entitySelector = (state, page, entity) => {
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
