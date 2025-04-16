// Menu related interfaces
export interface Menu {
  id: string | number;
  name: string;
  menu?: MenuItem[];
  meta_fields?: string | Record<string, any>;
  [key: string]: any;
}

// MenuItem interface for menu items
export interface MenuItem {
  name?: string;
  title?: string;
  url?: string;
  id?: string;
  menu?: MenuItem[];
  [key: string]: any;
}

// Form values interface
export interface MenuFormValues {
  id?: string | number;
  name?: string;
  menu?: MenuItem[];
  meta_fields?: string | Record<string, any>;
}

// Component props interfaces
export interface MenuFormProps {
  onCreate: (values: MenuFormValues) => void;
  data?: Partial<MenuFormValues>;
}

export interface MenuListProps {
  actions: string[];
  data: {
    menus: Menu[];
    loading: boolean;
    total: number;
  };
  filters: MenuFilters;
  setFilters: (
    filters: MenuFilters | ((prev: MenuFilters) => MenuFilters)
  ) => void;
  fetchMenus: () => void;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  isMobile?: boolean;
}

export interface MenuFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface MenuState {
  req: {
    query: MenuFilters;
    data: string[];
    total: number;
  }[];
  details: Record<string, Menu>;
  loading: boolean;
}

export interface RootState {
  menus: MenuState;
  spaces: any;
  sidebar: {
    collapsed: boolean;
  };
}

export interface MenuFieldProps {
  field: {
    name: number;
    fieldKey: number;
    key: number;
  };
  formFieldPath?: string;
}

export interface SubmenuProps {
  fieldKey: string;
  isMobileScreen: boolean;
  depth?: number;
}
