import {
  ADD_EVENTS,
  ADD_EVENTS_REQUEST,
  GET_EVENT,
  RESET_EVENTS,
  SET_EVENTS_LOADING,
  UPDATE_EVENT,
} from "../constants/events";
import deepEqual from "deep-equal";

// Define interfaces for our state and event objects
interface Event {
  id: string;
  [key: string]: any;
}

interface EventRequest {
  query: any;
  [key: string]: any;
}

interface EventsState {
  req: EventRequest[];
  details: Record<string, Event>;
  loading: boolean;
}

// Define action types
interface ResetEventsAction {
  type: typeof RESET_EVENTS;
}

interface SetEventsLoadingAction {
  type: typeof SET_EVENTS_LOADING;
  payload: boolean;
}

interface AddEventsRequestAction {
  type: typeof ADD_EVENTS_REQUEST;
  payload: EventRequest;
}

interface AddEventsAction {
  type: typeof ADD_EVENTS;
  payload: Event[];
}

interface GetEventAction {
  type: typeof GET_EVENT;
  payload: Event;
}

interface UpdateEventAction {
  type: typeof UPDATE_EVENT;
  payload: Event;
}

// Union type for all possible actions
type EventsActionTypes =
  | ResetEventsAction
  | SetEventsLoadingAction
  | AddEventsRequestAction
  | AddEventsAction
  | GetEventAction
  | UpdateEventAction;

const initialState: EventsState = {
  req: [],
  details: {},
  loading: true,
};

export default function eventsReducer(
  state: EventsState = initialState,
  action: EventsActionTypes = {} as EventsActionTypes
): EventsState {
  switch (action.type) {
    case RESET_EVENTS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_EVENTS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_EVENTS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_EVENTS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce<Record<string, Event>>(
            (obj, item) => ({ ...obj, [item.id]: item }),
            {}
          ),
        },
      };
    case GET_EVENT:
    case UPDATE_EVENT:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
