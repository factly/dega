// types.ts
export interface Format {
  id: string;
  slug: string;
  [key: string]: any;
}

export interface FormatState {
  loading: boolean;
  article?: Format;
  [key: string]: any;
}

export interface Space {
  [key: string]: any;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  featured_medium_id?: number;
  medium?: any;
  published_date?: string;
  excerpt?: string;
  [key: string]: any;
}

export interface Author {
  id: number;
  display_name: string;
  [key: string]: any;
}

export interface Category {
  id: number;
  name: string;
  [key: string]: any;
}

export interface Tag {
  id: number;
  name: string;
  [key: string]: any;
}

export interface PostsState {
  req: Array<{
    query: {
      [key: string]: any;
    };
    data: number[];
    total: number;
  }>;
  details: {
    [key: number]: Post;
  };
  loading: boolean;
}

export interface MediaState {
  details: {
    [key: number]: any;
  };
}

export interface TagsState {
  details: {
    [key: number]: Tag;
  };
}

export interface CategoriesState {
  details: {
    [key: number]: Category;
  };
}

export interface AuthorsState {
  details: {
    [key: number]: Author;
  };
}

export interface RootState {
  spaces: Space[];
  posts: PostsState;
  media: MediaState;
  tags: TagsState;
  categories: CategoriesState;
  authors: AuthorsState;
  sidebar: {
    collapsed: boolean;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  status?: string;
  tag?: string[];
  category?: string[];
  author?: string[];
  format?: string;
  [key: string]: any;
}

export interface PostsProps {
  formats: FormatState;
}

export interface SearchInputProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearchSubmit: () => void;
  clearSearch: () => void;
  isCollapsable?: boolean;
}

export interface FiltersPopoverProps {
  form: any;
  onSave: (values: FilterParams) => void;
}

export interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedItems: number;
}

export interface PostData {
  posts: Post[];
  total: number;
  loading: boolean;
  tags: Record<number, Tag>;
  categories: Record<number, Category>;
  authors: Record<number, Author>;
}
