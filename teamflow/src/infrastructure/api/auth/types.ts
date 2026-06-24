export type LoginBody = {
  username: string;
  password: string;
};

export type RegisterBody = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
};

/** `GET /auth/me` — matches Prisma `select` in AuthService.me */
export type MeUser = {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
};
