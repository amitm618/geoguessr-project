const API_URL = process.env.REACT_APP_API_URL;

export const fetchWithAuth = async (url, options = {}, handleUnauthorized) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && handleUnauthorized) {
    handleUnauthorized(); //
  }

  return res;
};
