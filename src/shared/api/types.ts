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
  username: string;
  fullName: string;
  registered: boolean;
}

export interface CreditSummary {
  total: number;
  overdue: number;
  ownStage: number;
  completed: number;
}

export interface UserUpdateRequest {
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
  /** Optimistic-lock version; sent back on update so a stale screen gets 409 instead of overwriting. */
  version: number;
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
  version?: number;
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

export type CardStatus = 'ACTIVE' | 'BLOCKED';
export type CardRestrictionType = 'FULL' | 'PARTIAL';
export type CardBasisCategory = 'CENTRAL_BANK' | 'INTERNAL_AFFAIRS' | 'OTHER';
export type CardDocumentKind = 'RESTRICTION' | 'UNBLOCK';

export interface ExecutorResponse {
  id: number;
  name: string;
  phone: string;
  extension: string;
}

export interface ExecutorRequest {
  name: string;
  phone?: string;
  extension?: string;
}

export interface CardDocumentResponse {
  id: number;
  fileName: string;
  sizeBytes: number;
  kind: CardDocumentKind;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CardResponse {
  id: number;
  cardNumber: string;
  mfo: string | null;
  restrictionDate: string | null;
  balance: number | null;
  restrictionType: CardRestrictionType | null;
  basisCategory: CardBasisCategory;
  basisComment: string | null;
  status: CardStatus;
  statusComment: string | null;
  executor: ExecutorResponse;
  senderName: string;
  createdAt: string;
  updatedAt: string;
  unblockOrderNumber: string | null;
  unblockComment: string | null;
  unblockedAt: string | null;
  unblockedBy: string | null;
  version: number;
  documents: CardDocumentResponse[] | null;
}

export interface CardUnblockPayload {
  orderNumber: string;
  comment?: string;
  file: File;
}

export interface CardRequest {
  cardNumber: string;
  mfo?: string;
  restrictionDate?: string;
  balance?: number;
  restrictionType?: CardRestrictionType;
  basisCategory: CardBasisCategory;
  basisComment?: string;
  status: CardStatus;
  statusComment?: string;
  executorId: number;
  version?: number;
}

export interface CardsFilters {
  q?: string;
  status?: CardStatus;
  mfo?: string;
  restrictionType?: CardRestrictionType;
  basisCategory?: CardBasisCategory;
  executorId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}