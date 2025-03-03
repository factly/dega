export interface FilterOptions {
  q: string | null;
  sort: "asc" | "desc";
  tag: number[];
  category: number[];
  author: number[];
  status: string;
  claimant: number[];
  rating: number[];
  language: string;
}

class Filters {
  q: string | null;
  sort: "asc" | "desc";
  tag: number[];
  category: number[];
  author: number[];
  status: string;
  claimant: number[];
  rating: number[];
  language: string;

  constructor(
    {
      q,
      sort,
      tag,
      category,
      author,
      status,
      claimant,
      rating,
      language,
    }: Partial<FilterOptions> = {
      q: null,
      sort: "asc",
      tag: [],
      category: [],
      author: [],
      claimant: [],
      rating: [],
      status: "all",
      language: "all",
    }
  ) {
    this.q = q ?? null;
    this.sort = sort ?? "asc";
    this.tag = tag ?? [];
    this.category = category ?? [];
    this.author = author ?? [];
    this.status = status ?? "all";
    this.claimant = claimant ?? [];
    this.language = language ?? "all";
    this.rating = rating ?? [];
  }
}

export default Filters;
