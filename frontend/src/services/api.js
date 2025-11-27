const API_BASE_URL = "/api";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson
      ? data.message || data.error || "Request failed"
      : "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("shukuma_auth_token");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token && !options.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.", 0, null);
  }
}

export const authApi = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true,
    }),

  signup: (userData) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
      skipAuth: true,
    }),

  verifyToken: () => request("/auth/verify"),

  logout: () => request("/auth/logout", { method: "POST" }),
};

export const userApi = {
  getProfile: () => request("/users/profile"),
  updateProfile: (data) =>
    request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getStats: () => request("/users/stats"),
  getProgress: () => request("/users/progress"),
};

export const workoutApi = {
  getAll: () => request("/exercises"),
  getById: (id) => request(`/exercises/${id}`),
  create: (data) =>
    request("/exercises", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const challengeApi = {
  getAll: () => request("/challenges"),
  join: (id) =>
    request(`/challenges/${id}/join`, {
      method: "POST",
    }),
};

export const journalApi = {
  getAll: () => request("/journal"),
  create: (data) =>
    request("/journal", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const nutritionApi = {
  getByDate: (date) => request(`/nutrition?date=${date}`),
  create: (data) =>
    request("/nutrition", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const socialApi = {
  getFriends: () => request("/social/friends"),
  addFriend: (userId) =>
    request("/social/friends", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};

export const taskApi = {
  getAll: () => request("/tasks"),
  create: (data) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  complete: (id) =>
    request(`/tasks/${id}/complete`, {
      method: "PUT",
    }),
};
