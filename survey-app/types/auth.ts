export interface AuthUser {
  id:    number;
  name:  string;
  email: string;
  role:  string;
}

export interface AuthResponse {
  user: AuthUser;
}
