// Types for analytics state and props
export interface Space {
  analytics?: {
    plausible?: {
      embed_code?: string;
    };
  };
}

export interface SpacesState {
  details: Record<string, Space>;
  selected: string;
  loading: boolean;
}

export interface RootState {
  spaces: SpacesState;
}
