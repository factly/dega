export interface FilterOptions {
  q?: string | null;
  sort?: string;
  tag?: number[] | string[];
  category?: number[] | string[];
  author?: number[] | string[];
  status?: string;
  claimant?: string[] | number[];
  rating?: string[] | number[];
  language?: string;
  page?: number | string;
  limit?: number | string;
  [key: string]: any;
}

class Filters {
  q: string | null;
  sort: string;
  tag: string[] | number[];
  category: string[] | number[];
  author: string[] | number[];
  status: string;
  claimant: string[] | number[];
  rating: string[] | number[];
  language: string;
  page?: number;
  limit?: number;

  constructor({
    q,
    sort,
    tag,
    category,
    author,
    status,
    claimant,
    rating,
    language,
    page,
    limit,
    ...rest
  }: FilterOptions = {}) {
    // Set default values
    this.q = q ?? null;
    this.sort = sort ?? "desc";
    this.tag = this.normalizeArray(tag);
    this.category = this.normalizeArray(category);
    this.author = this.normalizeArray(author);
    this.status = status ?? "all";
    this.language = language ?? "all";

    // Handle pagination
    this.page = page ? Number(page) : 1;
    this.limit = limit ? Number(limit) : 10;

    // Critical filters for claims
    this.claimant = this.normalizeArray(claimant);
    this.rating = this.normalizeArray(rating);

    // Add any other fields
    Object.entries(rest).forEach(([key, value]) => {
      (this as any)[key] = value;
    });
  }

  /**
   * Normalize a value to an array, handling string, number, and array inputs
   */
  private normalizeArray(value: any): string[] | number[] {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value;
    }

    // Handle single string/number value
    return [value];
  }
}

export default Filters;
