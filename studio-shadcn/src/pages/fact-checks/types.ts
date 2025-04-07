// types.ts for FactCheck
export interface Format {
  id: number;
  name: string;
  slug: string;
}

export interface Formats {
  loading: boolean;
  factcheck: Format | null;
  article: Format | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_medium_id: number;
  status: string;
  published_date: string;
  medium?: Media;
  [key: string]: any;
}

export interface Media {
  id: number;
  url: string;
  alt_text: string;
  [key: string]: any;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}

export interface Author {
  id: number;
  display_name: string;
  slug: string;
  [key: string]: any;
}

export interface FilterValues {
  format?: number[];
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  tag?: number[];
  category?: number[];
  author?: number[];
  status?: string;
}

export interface FactCheckProps {
  formats: Formats;
}

export interface FactCheckListData {
  posts: Post[];
  total: number;
  loading: boolean;
  tags: Record<number, Tag>;
  categories: Record<number, Category>;
  authors: Record<number, Author>;
}

export interface FactCheckListProps {
  actions: any;
  format: Format | null;
  data: FactCheckListData;
  filters: FilterValues;
  fetchPosts: () => void;
  query: string;
}

export interface FiltersPopoverProps {
  form: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (values: FilterValues) => void;
  hasActiveFilters: boolean;
}

export interface StatusTabsProps {
  status: string;
  handleStatusChange: (value: string) => void;
  isMobile: boolean;
  children: React.ReactNode;
}

export interface RootState {
  posts: {
    loading: boolean;
    details: Record<number, Post>;
    req: Array<{
      query: FilterValues;
      data: number[];
      total: number;
    }>;
  };
  media: {
    details: Record<number, Media>;
  };
  tags: {
    details: Record<number, Tag>;
  };
  categories: {
    details: Record<number, Category>;
  };
  authors: {
    details: Record<number, Author>;
  };
  spaces: any;
  sidebar: {
    collapsed: boolean;
  };
}
