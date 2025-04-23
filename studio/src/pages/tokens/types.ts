// Token related interfaces
export interface Token {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

// Form values interface
export interface TokenFormValues {
  name: string;
  description: string;
}

// Component props interface
export interface TokenListProps {
  data: {
    tokens: Token[];
    loading: boolean;
    total: number;
  };
  filters: TokenFilters;
  setFilters: (
    filters: TokenFilters | ((prev: TokenFilters) => TokenFilters)
  ) => void;
  fetchTokens: () => void;
  isMobile?: boolean;
}

export interface TokenFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface TokenState {
  req: {
    query: Record<string, any>;
    data: string[];
    total: number;
  }[];
  details: Record<string, Token>;
  loading: boolean;
}

export interface RootState {
  tokens: TokenState;
  sidebar: {
    collapsed: boolean;
  };
}
