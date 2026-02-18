type User = { email: string };
const KEY = "selfcare_user";

export function getUser(): User | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function login(email: string, password: string) {
  void password;
  const user = { email };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(KEY);
}