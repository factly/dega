// Media entity interface
export interface MediaItem {
  id: string | number;
  name: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  meta_fields?: string | Record<string, any>;
  url?: {
    proxy?: string;
    raw?: string;
  };
  dimensions?: string;
  file_size?: number;
  slug?: string;
  title?: string;
  type?: string;
}

export interface UploadItem {
  alt_text: string;
  caption?: string;
  description?: string;
  dimensions: string;
  file_size: number;
  name: string;
  slug: string;
  title: string;
  type: string;
  url: {
    raw: string;
  };
}

// Form values interface
export interface MediaFormValues {
  id?: string | number;
  name: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  meta_fields?: string | Record<string, any>;
}

// Component props interfaces
export interface MediaFilters {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  [key: string]: any;
}

export interface MediaListData {
  media: MediaItem[];
  total: number;
  loading: boolean;
}

export interface MediaListProps {
  data: MediaListData;
  actions?: string[];
  isMobile?: boolean;
}
