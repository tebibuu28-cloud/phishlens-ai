export interface User {
  name: string;
  email: string;
}

export function signup(user: User & { password: string }) {
  localStorage.setItem(
    "phishlens_user",
    JSON.stringify(user)
  );
}


export function login(email: string, password: string) {

  const savedUser = localStorage.getItem(
    "phishlens_user"
  );

  if (!savedUser) {
    return false;
  }

  const user = JSON.parse(savedUser);

  if (
    user.email === email &&
    user.password === password
  ) {
    localStorage.setItem(
      "phishlens_session",
      JSON.stringify(user)
    );

    return true;
  }

  return false;
}


export function logout() {
  localStorage.removeItem(
    "phishlens_session"
  );
}


export function getCurrentUser() {

  const user = localStorage.getItem(
    "phishlens_session"
  );

  return user ? JSON.parse(user) : null;
}