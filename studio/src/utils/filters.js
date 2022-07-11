class Filters {
  constructor(
    { q, sort, tag, category, author, status, claimant, rating } = {
      q: null,
      sort: 'asc',
      tag: [],
      category: [],
      author: [],
      claimant: [],
      rating: [],
      status: 'all',
    },
  ) {
    this.q = q;
    this.sort = sort;
    this.tag = tag;
    this.category = category;
    this.author = author;
    this.status = status;
    this.claimant = claimant;
    this.rating = rating;
  }
}

export default Filters;
