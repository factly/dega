// types.ts
export interface Format {
  id: number;
  name: string;
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
  updated_at?: string;
  created_at?: string;
  published_date?: string;
  tag_ids?: number[];
  category_ids?: number[];
  author_ids?: number[];
  authors?: number[] | Array<{ id: number; display_name: string }>;
  id: number;
  title: string;
  slug: string;
  status: "publish" | "draft" | "ready" | 'future';
  categories?: number[];
  tags?: number[];
  claims?: number[];
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
