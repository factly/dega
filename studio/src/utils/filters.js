class Filters {
  constructor(
    { q, sort, tag, category, author, status, claimant, rating, podcast, language, year, month } = {
      q: null,
      sort: 'asc',
      tag: [],
      category: [],
      author: [],
      claimant: [],
      rating: [],
      status: 'all',
      podcast: [],
      language: 'all',
      year: null,
      month: null,
    },
  ) {
    this.q = q;
    this.sort = sort;
    this.tag = tag;
    this.category = category;
    this.author = author;
    this.status = status;
    this.claimant = claimant;
    this.podcast = podcast;
    this.language = language;
    this.rating = rating;
    this.year = year; 
    this.month = month;
  }
}

export default Filters;
