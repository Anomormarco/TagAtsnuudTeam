const buildUrl = (path, params = {}) => {
  const url = new URL(`/api/v1${path}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path, options.params), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return { data };
};

const api = {
  get: (path, options) => request(path, { method: "GET", ...(options || {}) }),
  post: (path, options) => request(path, { method: "POST", ...(options || {}) }),
  patch: (path, options) => request(path, { method: "PATCH", ...(options || {}) }),
  delete: (path, options) => request(path, { method: "DELETE", ...(options || {}) }),
};

export default api;
