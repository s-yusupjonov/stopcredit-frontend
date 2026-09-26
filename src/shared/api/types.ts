export type Role =
  | 'ADMIN'
  | 'ANTI_FRAUD'
  | 'CREDIT_MANAGEMENT'
  | 'LEGAL'
  | 'UNDERWRITING'
  | 'MANAGEMENT';

export type CreditType = 'ONLINE' | 'CHAKANA' | 'OPEN';
export type CreditStatus = 'ACTIVE' | 'STOPPED';
export type CreditStage =
  | 'ANTI_FRAUD'
  | 'CREDIT_MANAGEMENT'
  | 'LEGAL'
  | 'UNDERWRITING'
  | 'COMPLETED';

export type AuthSource = 'LOCAL' | 'AD';

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  authSource: AuthSource;
  createdAt: string;
}

export interface UserCreateRequest {
  username: string;
  fullName: string;
  role: Role;
  password?: string;
  authSource: AuthSource;
}

export interface AdLookupResponse {
  found: boolean;
  fullName: string | null;
  alreadyRegistered: boolean;
}

export interface UserUpdateRequest {
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  password?: string;
}

export interface DocumentResponse {
  id: number;
  stage: CreditStage;
  fileName: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CreditResponse {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  pinfl: string;
  type: CreditType;
  mfo: string;
  applicationNumber: string;
  amount: number;
  status: CreditStatus;
  stage: CreditStage;
  stageDeadline: string | null;
  danger: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  documents: DocumentResponse[] | null;
}

export interface CreditRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  pinfl: string;
  type: CreditType;
  mfo: string;
  applicationNumber: string;
  amount: number;
  status: CreditStatus;
}

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ProblemDetail {
  status: number;
  detail: string;
  errors?: Record<string, string>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface CreditsFilters {
  q?: string;
  status?: CreditStatus;
  type?: CreditType;
  stage?: CreditStage;
  danger?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}