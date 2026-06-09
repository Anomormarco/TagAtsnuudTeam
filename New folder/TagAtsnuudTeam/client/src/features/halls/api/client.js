export const GMAIL_EMAIL_REGEX = /^[A-Z0-9._%+-]+@gmail\.com$/i;

const MAX_QUERY_LENGTH = 80;
const SORT_VALUES = new Set([
  "created_at,desc",
  "created_at,asc",
  "price,asc",
  "price,desc",
  "capacity,desc",
  "capacity,asc",
  "name,asc",
  "name,desc",
]);



export const isGmailEmail = (email = "") => GMAIL_EMAIL_REGEX.test(String(email).trim());

export const validateLoginEmail = (email = "") => {
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!isGmailEmail(normalizedEmail)) {
    throw new Error("Login email заавал @gmail.com хаяг байх ёстой");
  }

  return normalizedEmail;
};

const cleanTextQuery = (value) =>
  String(value)
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

const sanitizeParam = (key, value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (key === "page" || key === "size" || key === "category") {
    const numberValue = Number.parseInt(value, 10);
    return Number.isFinite(numberValue) && numberValue > 0 ? String(numberValue) : "";
  }

  if (key === "sort") {
    return SORT_VALUES.has(value) ? value : "created_at,desc";
  }

  if (key === "keyword" || key === "location") {
    return cleanTextQuery(value);
  }

  return cleanTextQuery(value);
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`/api/v1${path}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    const safeValue = sanitizeParam(key, value);

    if (safeValue !== "") {
      url.searchParams.set(key, safeValue);
    }
  });

  return url.toString();
};

const request = async (path, options = {}) => {
  const { params, ...fetchOptions } = options;

  if (path === "/auth/login" && fetchOptions.body) {
    const body = JSON.parse(fetchOptions.body);
    body.email = validateLoginEmail(body.email);
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), {
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
    ...fetchOptions,
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
