import deepEqual from 'deep-equal';

export const claimSelector = ({ claims, claimants, ratings }, page) => {
  const node = claims.req.find((item) => {
    return deepEqual(item.query, { page });
  });

  if (node) {
    const list = node.data.map((element) => {
      let claim = claims.details[element];
      claim.claimant = claimants.details[claim.claimant_id].name;
      claim.rating = ratings.details[claim.rating_id].name;
      return claim;
    });
    return {
      claims: list,
      total: node.total,
      loading: claims.loading,
    };
  }
  return { claims: [], total: 0, loading: claims.loading };
};
