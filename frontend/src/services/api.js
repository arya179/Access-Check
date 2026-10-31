/**
 * AccessCheck AI Centralized API Service
 * 
 * Features:
 * - Single configurable base URL via VITE_API_BASE_URL (fallback VITE_API_URL or http://localhost:8000)
 * - AbortController signal support for unmounting components
 * - Centralized HTTP status code handling (401, 403, 404, 422, 500)
 * - Structured ApiError class with user-friendly messages
 * - Request deduplication for concurrent GET requests
 * - Zero retry loops to protect server stability
 */

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, data = null, isTimeout = false, isConnectionRefused = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isConnectionRefused = isConnectionRefused;
  }
}

class ApiService {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
    this.defaultTimeoutMs = 60000;
    // In-flight GET request deduplication cache
    this._inFlightRequests = new Map();
  }

  /**
   * Translates HTTP statuses and error payloads into human-friendly messages
   */
  _formatErrorMessage(status, data, statusText) {
    let detail = null;
    if (data && typeof data === 'object') {
      detail = data.detail || data.message;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        detail = data.errors.map(e => e.msg || JSON.stringify(e)).join(', ');
      }
    } else if (typeof data === 'string' && data.trim()) {
      detail = data.trim();
    }

    if (detail && typeof detail === 'string') {
      return detail;
    }

    switch (status) {
      case 400:
        return 'Invalid request parameters provided.';
      case 401:
        return 'Authentication required. Please check your credentials.';
      case 403:
        return 'Access forbidden. You do not have permission for this resource.';
      case 404:
        return 'Requested resource or audit record was not found.';
      case 422:
        return 'Unprocessable request entity. Please verify input formatting.';
      case 500:
        return 'Internal server error. The backend encountered an unexpected issue.';
      case 502:
      case 503:
        return 'Backend service is currently unavailable or restarting.';
      default:
        return statusText || 'An unexpected error occurred while communicating with the server.';
    }
  }

  /**
   * Core HTTP request handler
   */
  async request(endpoint, options = {}) {
    const {
      timeout = this.defaultTimeoutMs,
      signal: externalSignal,
      headers: customHeaders = {},
      dedupe = false,
      ...fetchOptions
    } = options;

    const fullUrl = `${this.baseUrl}${endpoint}`;
    const method = (fetchOptions.method || 'GET').toUpperCase();

    // Request deduplication for identical in-flight GET requests
    if (dedupe && method === 'GET') {
      if (this._inFlightRequests.has(fullUrl)) {
        return this._inFlightRequests.get(fullUrl);
      }
    }

    const execRequest = async () => {
      const controller = new AbortController();
      let didTimeout = false;

      const timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, timeout);

      // Listen to external caller abort signal (e.g. component unmount)
      if (externalSignal) {
        externalSignal.addEventListener('abort', () => controller.abort());
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...customHeaders
      };

      try {
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type') || '';
        let data = null;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const message = this._formatErrorMessage(response.status, data, response.statusText);
          throw new ApiError(message, response.status, data);
        }

        return data;
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof ApiError) {
          throw err;
        }

        if (didTimeout) {
          throw new ApiError(
            `Request timed out after ${timeout / 1000} seconds. The backend may be busy processing.`,
            408,
            null,
            true,
            false
          );
        }

        if (err.name === 'AbortError') {
          throw new ApiError('Request was aborted.', 0, null, false, false);
        }

        if (err.name === 'TypeError' && err.message && err.message.includes('fetch')) {
          throw new ApiError(
            `Backend API is unreachable at ${this.baseUrl}. Please verify the FastAPI service is running on port 8000.`,
            0,
            null,
            false,
            true
          );
        }

        throw new ApiError(err.message || 'Network communication failure.', 0, null);
      } finally {
        if (dedupe && method === 'GET') {
          this._inFlightRequests.delete(fullUrl);
        }
      }
    };

    const promise = execRequest();
    if (dedupe && method === 'GET') {
      this._inFlightRequests.set(fullUrl, promise);
    }
    return promise;
  }

  // ================= System & Health =================
  async checkHealth(options = {}) {
    return this.request('/health', { method: 'GET', timeout: 5000, dedupe: true, ...options });
  }

  // ================= Real Website Audit =================
  async scanWebsite(payload, options = {}) {
    return this.request('/api/scan', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeout: this.defaultTimeoutMs,
      ...options
    });
  }

  // ================= AI Remediation Assistant =================
  async explainViolation(payload, options = {}) {
    return this.request('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeout: 25000,
      ...options
    });
  }

  // ================= Plotly Interactive Analytics =================
  async getAnalyticsOverview(options = {}) {
    return this.request('/api/analytics/overview', { method: 'GET', timeout: 12000, dedupe: true, ...options });
  }

  async getAnalyticsSeverity(options = {}) {
    return this.request('/api/analytics/severity', { method: 'GET', timeout: 12000, dedupe: true, ...options });
  }

  async getAnalyticsHistory(options = {}) {
    return this.request('/api/analytics/history', { method: 'GET', timeout: 12000, dedupe: true, ...options });
  }

  async getAnalyticsWcag(options = {}) {
    return this.request('/api/analytics/wcag', { method: 'GET', timeout: 12000, dedupe: true, ...options });
  }

  async getAnalyticsComparison(options = {}) {
    return this.request('/api/analytics/comparison', { method: 'GET', timeout: 12000, dedupe: true, ...options });
  }

  async getAnalyticsSummary(options = {}) {
    return this.request('/api/audit/analytics/summary', { method: 'GET', timeout: 10000, dedupe: true, ...options });
  }

  // ================= Audit Database History =================
  async getHistory({ search, startDate, endDate, limit = 100 } = {}, options = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (limit) params.append('limit', limit);

    return this.request(`/api/audit/history?${params.toString()}`, {
      method: 'GET',
      timeout: 10000,
      dedupe: true,
      ...options
    });
  }

  async getAuditById(id, options = {}) {
    return this.request(`/api/audit/${id}`, { method: 'GET', timeout: 10000, dedupe: true, ...options });
  }

  async compareScans(idA, idB, options = {}) {
    return this.request(`/api/audit/compare?scan_id_a=${idA}&scan_id_b=${idB}`, {
      method: 'GET',
      timeout: 12000,
      ...options
    });
  }

  async deleteAudit(id, options = {}) {
    return this.request(`/api/audit/${id}`, { method: 'DELETE', timeout: 10000, ...options });
  }

  async clearAllHistory(options = {}) {
    return this.request('/api/audit/history/clear', { method: 'DELETE', timeout: 10000, ...options });
  }

  // ================= Reports and Graphs =================
  getPdfDownloadUrl(scanId) {
    return `${this.baseUrl}/api/reports/${scanId}/pdf`;
  }

  getCsvDownloadUrl(scanId) {
    return `${this.baseUrl}/api/reports/${scanId}/csv`;
  }

  async getSystemGraph(options = {}) {
    return this.request('/api/audit/system/graphify', { method: 'GET', timeout: 10000, dedupe: true, ...options });
  }
}

export const api = new ApiService();
export default api;
