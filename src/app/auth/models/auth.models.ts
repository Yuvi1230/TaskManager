export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}
