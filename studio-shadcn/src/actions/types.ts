// User related types
export interface UserProfile {
  givenName: string;
  familyName: string;
  displayName: string;
}

export interface EmailData {
  email: string;
  isVerified: boolean;
}

export interface IdpLink {
  idpId: string;
  idpExternalId?: string;
  userId: string;
  userName: string;
}

export interface UserData {
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  email_verified: boolean;
  sub: string;
}

export interface ProviderData {
  idpInformation?: {
    rawInformation?: {
      User?: {
        sub: string;
        name: string;
      };
    };
  };
}

// Response types
export interface UserResponse {
  result: Array<{
    userId: string;
    details?: any;
  }>;
}

export interface SessionResponse {
  sessionId: string;
  sessionToken: string;
  details?: any;
}

export interface ErrorResponse {
  message: string;
  details?: any;
}

export interface AuthRequestResponse {
  details?: any;
}

export interface AuthRequestFinalization {
  session: {
    sessionId: string;
    sessionToken: string;
  };
}

export interface ProviderInformation {
  idpInformation?: {
    rawInformation?: {
      User?: {
        sub: string;
        name: string;
        email?: string;
        given_name?: string;
        family_name?: string;
        email_verified?: boolean;
      };
    };
  };
}

export interface UserDetails {
  user: {
    human: {
      email: {
        isVerified: boolean;
      };
    };
  };
}

export interface AuthRequestResponse {
  details?: any;
}

export interface AuthRequestDetails {
  id: string;
  // Add other fields as needed
}

// Ratings types
export interface Description {
  json: any;
  html: string;
}

export interface Rating {
  id: number;
  description: Description;
  description_html?: string;
  medium?: Medium;
  [key: string]: any;
}

export interface RatingsRequest {
  data: number[];
  query: QueryParams;
  total: number;
}

export interface RatingsAction {
  type: string;
  payload: any;
}

// Registration types
export interface RegistrationData {
  email: {
    email: string;
    isVerified?: boolean;
    sendCode?: {
      urlTemplate: string;
    };
  };
  [key: string]: any;
}

// Session types
export interface SessionData {
  userId: string;
  email: string;
  [key: string]: any;
}

export interface ExtendedSessionResponse {
  success: boolean;
  noToken: boolean;
}

export interface UserInfoResponse {
  error?: any;
  data?: SessionData;
}

export interface AddSessionAction {
  type: "ADD_SESSION";
  payload: SessionData;
}

export interface SetLoadingAction {
  type: "SET_SESSIONS_LOADING";
  payload: boolean;
}

export type SessionActionTypes = AddSessionAction | SetLoadingAction;

export interface RootState {
  session: SessionData;
}

// Query related types
export interface QueryParams {
  offset?: string;
  limit?: number;
  asc?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface EmailQuery {
  emailQuery: {
    emailAddress: string;
    method: string;
  };
}

export interface UserQuery {
  query: QueryParams;
  queries: EmailQuery[];
}

export interface UserSearchResult {
  result: Array<{
    userId: string;
    [key: string]: any;
  }>;
}

// Request types
export interface IdpLinkRequest {
  idpLink: IdpLink;
}

export interface SessionRequest {
  checks: {
    user: {
      userId: string;
    };
    idpIntent?: {
      idpIntentId: string;
      idpIntentToken: string;
    };
  };
}

export interface HumanUserRegistration {
  username: string;
  profile: {
    givenName: string;
    familyName: string;
    displayName: string;
  };
  email: {
    email: string;
    isVerified: boolean;
  };
  idpLinks: Array<{
    idpId: string;
    idpExternalId: string;
    userId: string;
    userName: string;
  }>;
}

export interface GoogleSignInRequest {
  idpId: string;
  urls: {
    successUrl: string;
    failureUrl: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Password Reset types
export interface PasswordResetResponse {
  details?: any;
}

// Media related types
export interface Medium {
  id: number;
  [key: string]: any;
}

export interface MediaResponse {
  nodes: Medium[];
  total: number;
}

// Media Action types
export interface SetMediaLoadingAction {
  type: "SET_MEDIA_LOADING";
  payload: boolean;
}

export interface AddMediaAction {
  type: "ADD_MEDIA";
  payload: Medium[];
}

export interface AddMediaRequestAction {
  type: "ADD_MEDIA_REQUEST";
  payload: {
    data: number[];
    query: QueryParams;
    total: number;
  };
}

export interface GetMediumAction {
  type: "GET_MEDIUM";
  payload: Medium;
}

export interface UpdateMediumAction {
  type: "UPDATE_MEDIUM";
  payload: Medium;
}

export interface ResetMediaAction {
  type: "RESET_MEDIA";
}

export type MediaActionTypes =
  | SetMediaLoadingAction
  | AddMediaAction
  | AddMediaRequestAction
  | GetMediumAction
  | UpdateMediumAction
  | ResetMediaAction;
