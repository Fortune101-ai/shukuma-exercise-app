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
  
  } else if (!token && !options.skipAuth) {
    console.warn(`No token available for ${endpoint}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
     
      if (error.status === 401 && token) {
        console.error("❌ 401 Error - Clearing token");
        localStorage.removeItem("shukuma_auth_token");
        window.location.href = "/login";
      }
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

  verifyToken: () => request("/auth/verify-token"),

  getCurrentUser: () => request("/auth/me"),

  changePassword: (data) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  resetPassword: (data) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),

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

  getWorkoutSummary: () => request("/users/workout-summary"),

  deleteAccount: (password) =>
    request("/users/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),
};

export const exerciseApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exercises?${query}`);
  },

  getRandom: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exercises/random?${query}`);
  },

  search: (q) => request(`/exercises/search?q=${encodeURIComponent(q)}`),

  getPopular: (limit = 10) => request(`/exercises/popular?limit=${limit}`),

  getById: (id) => request(`/exercises/${id}`),

  getByCategory: (category, limit = 10) =>
    request(`/exercises/category/${category}?limit=${limit}`),

  getByDifficulty: (difficulty, limit = 10) =>
    request(`/exercises/difficulty/${difficulty}?limit=${limit}`),

  getStats: () => request("/exercises/stats"),
};

export const workoutApi = {
  log: (data) =>
    request("/workouts/log", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/workouts/history?${query}`);
  },

  getStats: () => request("/workouts/stats"),

  getCalendar: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/workouts/calendar?${query}`);
  },

  deleteWorkout: (workoutId) =>
    request(`/workouts/${workoutId}`, {
      method: "DELETE",
    }),
};

export const taskApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks?${query}`);
  },
  create: (data) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getById: (taskId) => request(`/tasks/${taskId}`),
  update: (taskId, data) =>
    request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  toggle: (taskId) =>
    request(`/tasks/${taskId}/toggle`, {
      method: "PATCH",
    }),
  delete: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: "DELETE",
    }),
  deleteAllCompleted: () =>
    request("/tasks/completed/all", {
      method: "DELETE",
    }),
  completeAll: () =>
    request("/tasks/complete/all", {
      method: "PATCH",
    }),
  getStats: () => request("/tasks/stats"),
};

export const journalApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/journals?${query}`);
  },
  create: (data) =>
    request("/journals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getById: (entryId) => request(`/journals/${entryId}`),
  update: (entryId, data) =>
    request(`/journals/${entryId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (entryId) =>
    request(`/journals/${entryId}`, {
      method: "DELETE",
    }),
  getStats: () => request("/journals/stats"),
  getMoodTrends: (days = 30) => request(`/journals/mood-trends?days=${days}`),
  search: (q) => request(`/journals/search?q=${encodeURIComponent(q)}`),
  getRecent: (limit = 5) => request(`/journals/recent?limit=${limit}`),
};

export const challengeApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/challenges?${query}`);
  },
  getActive: () => request("/challenges/active"),
  getUpcoming: () => request("/challenges/upcoming"),
  getStats: () => request("/challenges/stats"),
  getMyJoinedChallenges: (status = "active") =>
    request(`/challenges/my-challenges?status=${status}`),
  create: (data) =>
    request("/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getById: (id) => request(`/challenges/${id}`),
  join: (id) =>
    request(`/challenges/${id}/join`, {
      method: "POST",
    }),
  leave: (id) =>
    request(`/challenges/${id}/leave`, {
      method: "POST",
    }),
  updateProgress: (id, value) =>
    request(`/challenges/${id}/progress`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),
  getLeaderboard: (id, limit = 10) =>
    request(`/challenges/${id}/leaderboard?limit=${limit}`),
  delete: (id) =>
    request(`/challenges/${id}`, {
      method: "DELETE",
    }),
};

export const nutritionApi = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/nutrition/logs?${query}`);
  },
  createLog: (data) =>
    request("/nutrition/logs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getLogById: (logId) => request(`/nutrition/logs/${logId}`),
  updateLog: (logId, data) =>
    request(`/nutrition/logs/${logId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteLog: (logId) =>
    request(`/nutrition/logs/${logId}`, {
      method: "DELETE",
    }),
  getGuides: () => request("/nutrition/guides"),
  getStats: (days = 7) => request(`/nutrition/stats?days=${days}`),
};

export const socialApi = {
  getFriends: () => request("/social/friends"),
  getFriendRequests: () => request("/social/friend-requests"),
  getActivityFeed: (limit = 20) => request(`/social/feed?limit=${limit}`),
  searchUsers: (q) => request(`/social/search?q=${encodeURIComponent(q)}`),
  sendFriendRequest: (friendId) =>
    request(`/social/friend-request/${friendId}`, {
      method: "POST",
    }),
  acceptFriendRequest: (friendId) =>
    request(`/social/accept-friend/${friendId}`, {
      method: "POST",
    }),
  rejectFriendRequest: (friendId) =>
    request(`/social/reject-friend/${friendId}`, {
      method: "POST",
    }),
  removeFriend: (friendId) =>
    request(`/social/friends/${friendId}`, {
      method: "DELETE",
    }),
};

export const triggerApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/triggers?${query}`);
  },
  create: (data) =>
    request("/triggers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getById: (triggerId) => request(`/triggers/${triggerId}`),
  update: (triggerId, data) =>
    request(`/triggers/${triggerId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (triggerId) =>
    request(`/triggers/${triggerId}`, {
      method: "DELETE",
    }),
  getStats: () => request("/triggers/stats"),
};

export { ApiError };