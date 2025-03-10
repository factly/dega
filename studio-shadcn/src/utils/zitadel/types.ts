export interface SessionData {
  sessionId: string;
  sessionToken: string;
  token: string;
}

export interface UserDetails {
  session: {
    factors: {
      user: {
        id: string;
      };
    };
  };
}

export interface AuthMethods {
  authMethodTypes: string[];
}

export interface FinalizeResult {
  callbackUrl?: string;
}

interface GoogleSignInResult {
  error?: string;
}

export interface UseGoogleSignIn {
  initiateGoogleSignIn: () => Promise<GoogleSignInResult>;
  error: string | null;
  step: string;
  totpUri: string;
  totpSecret: string;
  handleMfaSetup: (code: string) => void;
  handleMfaVerify: (code: string) => void;
}

export interface MfaFormValues {
  totpCode: string;
}

export interface MfaVerifyFormValues {
  mfaCode: string;
}

// User related types
export interface UserProfile {
  givenName: string;
  familyName: string;
}

export interface UserEmail {
  email: string;
}

export interface UserPassword {
  password: string;
}

// Authentication response types
export interface RegisterResponse {
  userId: string;
}

export interface SessionResponse {
  sessionId: string;
  sessionToken: string;
}

export interface TOTPSetupResponse {
  uri: string;
  secret: string;
}

// Form values types
export interface RecoveryFormValues {
  password: string;
  confirmPassword: string;
}

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Component prop types
export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  error?: string;
  logoSrc: string;
}

export interface TOTPSetupComponentProps {
  uri: string;
  secret: string;
  onVerify: (code: string) => Promise<void>;
}

// Google Sign In Hook types
export interface GoogleSignInHook {
  initiateGoogleSignIn: () => Promise<void>;
  error: string;
  step: "registration" | "mfa-setup" | "mfa-verify" | "";
  totpUri: string;
  totpSecret: string;
  handleGoogleSkipMfa: () => void;
  handleMfaSetup: () => Promise<void>;
  handleMfaVerify: (code: string) => Promise<void>;
}

// API Function types
export type ResetPasswordFunction = (
  userId: string,
  password: string,
  verificationCode: string
) => Promise<void>;

export type RegisterUserFunction = (
  data: RegistrationData
) => Promise<RegisterResponse>;

export type CreateSessionFunction = (email: string) => Promise<SessionResponse>;

export type VerifyPasswordFunction = (
  sessionId: string,
  sessionToken: string,
  password: string
) => Promise<SessionResponse>;

export type StartTOTPRegistrationFunction = (
  userId: string,
  sessionToken: string
) => Promise<TOTPSetupResponse>;

export type VerifyTOTPRegistrationFunction = (
  userId: string,
  sessionToken: string,
  code: string
) => Promise<void>;

interface Profile {
  givenName: string;
  familyName: string;
}

interface EmailData {
  email: string;
}

interface PasswordData {
  password: string;
}

export interface RegistrationData {
  profile: Profile;
  email: EmailData;
  password: PasswordData;
  confirmPassword: string;
}

export interface TOTPData {
  uri: string;
  secret: string;
}

export interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProviderUserData {
  email: string;
  // Add other user fields as needed
}

export interface ProviderInformation {
  idpInformation?: {
    rawInformation?: {
      User?: ProviderUserData;
    };
  };
}

export interface ExistingUser {
  userId: string;
  // Add other user fields as needed
}

export interface TOTPData {
  uri: string;
  secret: string;
}

export interface TOTPVerificationResult {
  sessionToken: string;
}

export interface GoogleSignInResponse {
  authUrl: string;
}

// Action function types
export type GetProviderInformation = (
  intentId: string,
  token: string
) => Promise<ProviderInformation>;

export type CheckUserExists = (email: string) => Promise<ExistingUser | null>;

export type LinkExistingUser = (
  userId: string,
  providerData: ProviderInformation
) => Promise<void>;

export type CreateSession = (
  userId: string,
  intentId?: string,
  token?: string
) => Promise<SessionData>;

export type RegisterUser = (
  userData: ProviderUserData,
  intentId: string,
  token: string
) => Promise<ExistingUser>;

export type StartTOTPRegistration = (
  userId: string,
  pat: string
) => Promise<TOTPData>;

export type VerifyTOTPRegistration = (
  userId: string,
  sessionToken: string,
  code: string
) => Promise<void>;

export type CheckTOTP = (
  sessionId: string,
  sessionToken: string,
  code: string
) => Promise<TOTPVerificationResult>;

export type InitiateGoogleSignIn = (
  publicUrl: string
) => Promise<GoogleSignInResponse>;
