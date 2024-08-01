function getUrlParams(query, filters) {
  const keys = filters ? filters : ['page', 'limit', 'q', 'sort','year_month'];
  const params = {
    sort: 'desc',
    limit: 10,
    page: 1,
    year_month: '',
  };
  keys.forEach((key) => {
    if (query.get(key)) {
      if (
        key === 'claimant' ||
        key === 'rating' ||
        key === 'format' ||
        key === 'tag' ||
        key === 'category' ||
        key === 'author' ||
        key === 'podcast'
      ) {
        const val = query.getAll(key).map((v) => parseInt(v));
        params[key] = val;
      } else if (key === 'sort' || key === 'q' || key === 'status' || key === 'language' || key === 'year_month') {
        params[key] = query.get(key);
      } else {
        params[key] = parseInt(query.get(key));
      }
    }
  });
  return params;
}
export default getUrlParams;
