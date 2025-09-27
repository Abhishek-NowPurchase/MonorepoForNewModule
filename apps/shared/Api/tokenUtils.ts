// Simple token utilities
export const getToken = () => {
  // 🔧 TEMPORARY: Set a test token for development if none exists
  const existingToken = localStorage.getItem('authToken');
  if (!existingToken) {
    const testToken = '5bafe9a848533c466a69e116bf06d0a6d0a47811';
    localStorage.setItem('authToken', testToken);
    return testToken;
  }
  return existingToken;
};

export const setToken = (token: string) => localStorage.setItem('authToken', token);
export const removeToken = () => localStorage.removeItem('authToken');
export const hasToken = () => !!getToken();
