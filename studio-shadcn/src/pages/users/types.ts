// User related types
export interface SpaceUser {
  id: string;
  display_name: string;
  email: string;
}

export interface SpaceUsersState {
  details: Record<string, SpaceUser>;
  req: Array<{
    query: {
      page: string | null;
      limit: string | null;
      q?: string;
    };
    data: string[];
    total: number;
  }>;
  loading: boolean;
}

export interface RootState {
  spaceUsers: SpaceUsersState;
  sidebar: {
    collapsed: boolean;
  };
}

export interface FiltersState {
  page: number;
  limit: number;
}

export interface FormValues {
  users?: string[];
}
