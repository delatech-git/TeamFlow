export type AdminUserDto = {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserBody = {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
};
