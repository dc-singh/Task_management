/**
 * ============================================================================
 * Task Management App - API Client Layer
 * Handles authentication, token persistence, and all CRUD endpoints.
 * ============================================================================
 */

const API_BASE = window.location.origin.includes('http') 
  ? window.location.origin 
  : 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.tokenKey = 'task_app_jwt_token';
  }

  // --- Token Management ---
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // --- Helper for HTTP Requests ---
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      // Backend expects "Bearer <token>" or token in Authorization header
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // If unauthorized, token expired or invalid
        if (response.status === 401 && endpoint !== '/user/login') {
          this.clearToken();
        }

        const errorMessage = data?.detail || data?.message || `Request failed with status ${response.status}`;
        const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  // ==========================================================================
  // USER / AUTHENTICATION ENDPOINTS
  // ==========================================================================

  /**
   * Register a new user account
   * POST /user/register
   */
  async register({ name, username, password, email }) {
    return this.request('/user/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, password, email })
    });
  }

  /**
   * Login user and save JWT token
   * POST /user/login
   */
  async login({ username, password }) {
    const data = await this.request('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data && data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  /**
   * Verify token and fetch current user profile
   * GET /user/is_auth
   */
  async getCurrentUser() {
    return this.request('/user/is_auth', {
      method: 'GET'
    });
  }

  /**
   * Delete user profile
   * DELETE /user/delete/{id}
   */
  async deleteAccount(userId) {
    const res = await this.request(`/user/delete/${userId}`, {
      method: 'DELETE'
    });
    this.clearToken();
    return res;
  }

  // ==========================================================================
  // TASK MANAGEMENT ENDPOINTS
  // ==========================================================================

  /**
   * Fetch all tasks for authenticated user
   * GET /tasks/all_tasks
   */
  async getAllTasks() {
    const response = await this.request('/tasks/all_tasks', {
      method: 'GET'
    });
    // Backend returns { status: "All Tasks", data: [...] }
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Fetch a single task by ID
   * GET /tasks/one_task/{task_id}
   */
  async getTask(taskId) {
    const response = await this.request(`/tasks/one_task/${taskId}`, {
      method: 'GET'
    });
    return response.Data || response.data || response;
  }

  /**
   * Create a new task
   * POST /tasks/create
   */
  async createTask({ title, description, is_completed = false }) {
    return this.request('/tasks/create', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: description || '',
        is_completed: Boolean(is_completed)
      })
    });
  }

  /**
   * Update an existing task
   * PUT /tasks/update_task/{task_id}
   */
  async updateTask(taskId, { title, description, is_completed }) {
    const response = await this.request(`/tasks/update_task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        description: description || '',
        is_completed: Boolean(is_completed)
      })
    });
    return response.Data || response.data || response;
  }

  /**
   * Delete a task by ID
   * DELETE /tasks/delete_task/{task_id}
   */
  async deleteTask(taskId) {
    return this.request(`/tasks/delete_task/${taskId}`, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
const api = new ApiClient();
