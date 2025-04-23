// Define the state interface
interface OrganisationsState {
  req: any[];
  details: Record<string, any>;
  loading: boolean;
}

// Define the action interface
interface Action {
  type: string;
  payload?: any;
}

// Initial state
const initialState: OrganisationsState = {
  req: [],
  details: {},
  loading: true,
};

// Reducer function with type annotations
export default function organisationsReducer(
  state: OrganisationsState = initialState,
  action: Action = { type: "" }
): OrganisationsState {
  switch (action.type) {
    default:
      return state;
  }
}
