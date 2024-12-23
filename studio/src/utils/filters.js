class Filters {
  constructor(
    { q, sort, tag, category, author, status, claimant, rating, language } = {
      q: null,
      sort: 'asc',
      tag: [],
      category: [],
      author: [],
      claimant: [],
      rating: [],
      status: 'all',
      language: 'all',
    },
  ) {
    this.q = q;
    this.sort = sort;
    this.tag = tag;
    this.category = category;
    this.author = author;
    this.status = status;
    this.claimant = claimant;
    this.language = language;
    this.rating = rating;
  }
}

export default Filters;
