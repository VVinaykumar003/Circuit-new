export  type User = {
  userId: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  department: string;
};

export  type AuthState = {
  user: User | null;
  slug: string | null;
};

export  type AuthContextType = {
  auth: AuthState;
  login: (data: { user: User; slug: string }) => void;
  logout: () => void;
  loading: boolean;
};

