import { api } from './axios';
import type {
  AdLookupResponse,
  CreditRequest,
  CreditResponse,
  CreditsFilters,
  CreditStatus,
  DocumentResponse,
  LoginRequest,
  LoginResponse,
  Page,
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from './types';

export const authApi = {
  login: (payload: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get<UserResponse[]>('/users').then((r) => r.data),
  create: (payload: UserCreateRequest) =>
    api.post<UserResponse>('/users', payload).then((r) => r.data),
  update: (id: number, payload: UserUpdateRequest) =>
    api.put<UserResponse>(`/users/${id}`, payload).then((r) => r.data),
  adLookup: (username: string) =>
    api.get<AdLookupResponse>('/users/ad-lookup', { params: { username } }).then((r) => r.data),
};

function buildCreditsParams(filters: CreditsFilters) {
  const params: Record<string, string | number | boolean> = {};
  if (filters.q) params.q = filters.q;
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.stage) params.stage = filters.stage;
  if (filters.danger !== undefined) params.danger = filters.danger;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.size !== undefined) params.size = filters.size;
  if (filters.sort) params.sort = filters.sort;
  return params;
}

export const creditsApi = {
  list: (filters: CreditsFilters) =>
    api
      .get<Page<CreditResponse>>('/credits', { params: buildCreditsParams(filters) })
      .then((r) => r.data),
  export: (filters: CreditsFilters) =>
    api
      .get('/credits/export', {
        params: buildCreditsParams(filters),
        responseType: 'blob',
      })
      .then((r) => r.data as Blob),
  get: (id: number) => api.get<CreditResponse>(`/credits/${id}`).then((r) => r.data),
  create: (payload: CreditRequest) =>
    api.post<CreditResponse>('/credits', payload).then((r) => r.data),
  update: (id: number, payload: CreditRequest) =>
    api.put<CreditResponse>(`/credits/${id}`, payload).then((r) => r.data),
  updateStatus: (id: number, status: CreditStatus) =>
    api.patch<CreditResponse>(`/credits/${id}/status`, { status }).then((r) => r.data),
  advance: (id: number) =>
    api.post<CreditResponse>(`/credits/${id}/advance`).then((r) => r.data),
  uploadDocuments: (id: number, files: File[], onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api
      .post<DocumentResponse[]>(`/credits/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },
  downloadDocument: (creditId: number, docId: number) =>
    api
      .get(`/credits/${creditId}/documents/${docId}`, { responseType: 'blob' })
      .then((r) => r.data as Blob),
  deleteDocument: (creditId: number, docId: number) =>
    api.delete(`/credits/${creditId}/documents/${docId}`),
};