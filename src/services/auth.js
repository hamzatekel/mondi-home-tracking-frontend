export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error('Failed to parse token', e);
    return null;
  }
}

export function getUserRole() {
  const user = getCurrentUser();
  if (!user) return null;
  // support different claim shapes
  if (user.role) return user.role;
  if (user.roles && Array.isArray(user.roles)) return user.roles;
  if (user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) return user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  return null;
}
