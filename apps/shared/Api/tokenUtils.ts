export const getToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.warn('localStorage not available:', error);
    return null;
  }
};

export const hasToken = () => {
  return !!getToken();
};
