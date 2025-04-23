// Format related interfaces
export interface Format {
  id: string;
  name: string;
  slug?: string;
  is_featured?: boolean;
  description?: string;
  medium_id?: number | string;
  meta_fields?: string | Record<string, unknown>;
  [key: string]: any; // For other properties
}

// Form values interface
export interface FormatFormValues {
  id?: string;
  name: string;
  slug: string;
  is_featured?: boolean;
  description?: string;
  medium_id?: number | string;
  meta_fields?: string | Record<string, unknown>;
}

// Component props interface
export interface FormatFormProps {
  onCreate: (values: FormatFormValues) => void;
  data?: Partial<FormatFormValues>;
}

export interface FormatListProps {
  data: {
    formats: Format[];
    loading: boolean;
    total: number;
  };
  filters?: FormatFilters;
  setFilters?: (filters: Partial<FormatFilters>) => void;
  fetchFormats: () => void;
  isMobile?: boolean;
}

export interface FormatFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface FormatState {
  req: {
    query: Record<string, any>;
    data: string[];
    total: number;
  }[];
  details: Record<string, Format>;
  loading: boolean;
}

export interface RootState {
  formats: FormatState;
  sidebar: {
    collapsed: boolean;
  };
}

export interface CreateFormatProps {
  setReloadFlag: React.Dispatch<React.SetStateAction<boolean>>;
  reloadFlag: boolean;
}
