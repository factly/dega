// Policy related interfaces
export interface PolicyPermission {
  resource: string;
  actions: string[];
}

export interface Policy {
  id: string;
  name: string;
  users: string[];
  description?: string;
  permissions?: PolicyPermission[];
  [key: string]: any;
}

export interface PolicyWithFormattedPermissions
  extends Omit<Policy, "permissions"> {
  permissions: Record<string, string[]>;
}

// Form values interface
export interface PolicyFormValues {
  name: string;
  users: string[];
  description?: string;
  permissions?: PolicyPermission[];
  [key: string]: any;
}

// Component props interfaces
export interface PolicyListProps {
  actions: string[];
  data: {
    policies: Policy[];
    loading: boolean;
    total: number;
  };
  filters: PolicyFilters;
  setFilters: (filters: any) => void;
  fetchPolicies: () => void;
  isMobile?: boolean;
}

// State interfaces
export interface PolicyFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface PolicyState {
  details: Record<string, Policy>;
  loading: boolean;
  req: Array<{
    query: PolicyFilters;
    data: string[];
    total: number;
  }>;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface PolicyFormData {
  id?: string;
  name: string;
  users: string[];
  description?: string;
  permissions: Record<string, string[]>; // Already required, which is correct
}

export interface PolicyFormProps {
  data?: PolicyFormData;
  onCreate: (values: {
    name: string;
    users: string[];
    description?: string;
    permissions: Permission[];
  }) => void;
}

export interface RootState {
  policies: PolicyState;
  spaces: any;
}
