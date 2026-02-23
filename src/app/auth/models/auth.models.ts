export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  message?: string;
}

export interface StoredUser {
  fullName: string;
  email: string;
  password: string;
}
