import {
  User, Project, Milestone, Task, WeeklyReport, ScheduleChangeRequest,
  NotificationItem, AuditEvent, DashboardMetrics, LeaderboardUser, Badge, SystemConfig
} from './types';

const BASE_URL = '/api/v1';

function getHeaders() {
  const token = localStorage.getItem('jg_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('jg_auth_token', res.token);
    return res;
  },

  getCurrentUser: async (): Promise<User> => {
    return request<User>('/auth/me');
  },


  logout: () => {
    localStorage.removeItem('jg_auth_token');
  },

  // Users (Admin)
  getUsers: async (): Promise<User[]> => {
    return request<User[]>('/users');
  },

  createUser: async (userData: any): Promise<User> => {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id: number | string, updates: any): Promise<User> => {
    return request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  deleteUser: async (id: number | string): Promise<{ message: string; deletedId: number }> => {
    return request<{ message: string; deletedId: number }>(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Projects
  getProjects: async (includeArchived = false): Promise<Project[]> => {
    return request<Project[]>(`/projects?includeArchived=${includeArchived}`);
  },

  getProject: async (id: number): Promise<Project> => {
    return request<Project>(`/projects/${id}`);
  },

  createProject: async (data: any): Promise<Project> => {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateProject: async (id: number | string, data: any): Promise<Project> => {
    return request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  addProjectMember: async (projectId: number | string, userId: number | string, projectRole: string): Promise<Project> => {
    return request<Project>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, projectRole })
    });
  },

  archiveProject: async (id: number | string): Promise<Project> => {
    return request<Project>(`/projects/${id}/archive`, { method: 'POST' });
  },

  restoreProject: async (id: number | string): Promise<Project> => {
    return request<Project>(`/projects/${id}/restore`, { method: 'POST' });
  },

  deleteProject: async (id: number | string, reason: string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/projects/${id}?reason=${encodeURIComponent(reason)}`, {
      method: 'DELETE'
    });
  },

  // Milestones
  createMilestone: async (projectId: number, data: any): Promise<Milestone> => {
    return request<Milestone>(`/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateMilestone: async (id: number, data: any): Promise<Milestone> => {
    return request<Milestone>(`/milestones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  submitMilestoneForReview: async (id: number, evidenceNotes: string, evidenceUrl?: string): Promise<Milestone> => {
    return request<Milestone>(`/milestones/${id}/submit-review`, {
      method: 'POST',
      body: JSON.stringify({ evidenceNotes, evidenceUrl })
    });
  },

  reviewMilestone: async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string): Promise<Milestone> => {
    return request<Milestone>(`/milestones/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments })
    });
  },

  // Tasks
  getTasks: async (params: { projectId?: number; milestoneId?: number; onlyMine?: boolean } = {}): Promise<Task[]> => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', String(params.projectId));
    if (params.milestoneId) query.append('milestoneId', String(params.milestoneId));
    if (params.onlyMine) query.append('onlyMine', 'true');
    return request<Task[]>(`/tasks?${query.toString()}`);
  },

  createTask: async (milestoneId: number, data: any): Promise<Task> => {
    return request<Task>(`/milestones/${milestoneId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateTask: async (id: number, data: any): Promise<Task> => {
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  submitTaskForReview: async (id: number, notes?: string): Promise<Task> => {
    return request<Task>(`/tasks/${id}/submit-review`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  },

  reviewTask: async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string): Promise<Task> => {
    return request<Task>(`/tasks/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments })
    });
  },

  reportBlocker: async (taskId: number, blockerData: {
    summary: string;
    impact: string;
    proposedSolution: string;
    expectedResolutionDate?: string;
    supportNeeded: string;
    workLog?: string;
  }): Promise<Task> => {
    return request<Task>(`/tasks/${taskId}/updates`, {
      method: 'POST',
      body: JSON.stringify(blockerData)
    });
  },

  requestScheduleChange: async (taskId: number, newDueDate: string, reason: string): Promise<ScheduleChangeRequest> => {
    return request<ScheduleChangeRequest>(`/tasks/${taskId}/request-schedule-change`, {
      method: 'POST',
      body: JSON.stringify({ newDueDate, reason })
    });
  },

  // Weekly Reports
  getWeeklyReports: async (userId?: number): Promise<WeeklyReport[]> => {
    const q = userId ? `?userId=${userId}` : '';
    return request<WeeklyReport[]>(`/weekly-reports${q}`);
  },

  getWeeklyReport: async (id: number): Promise<WeeklyReport> => {
    return request<WeeklyReport>(`/weekly-reports/${id}`);
  },

  saveWeeklyReport: async (reportData: any): Promise<WeeklyReport> => {
    return request<WeeklyReport>('/weekly-reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  reviewWeeklyReport: async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string): Promise<WeeklyReport> => {
    return request<WeeklyReport>(`/weekly-reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments })
    });
  },

  // Review Inbox & Schedule Requests
  getReviewInbox: async (): Promise<{
    pendingMilestones: Milestone[];
    pendingTasks: Task[];
    pendingReports: WeeklyReport[];
    pendingSchedules: ScheduleChangeRequest[];
    totalBacklog: number;
  }> => {
    return request('/review-inbox');
  },

  getScheduleRequests: async (): Promise<ScheduleChangeRequest[]> => {
    return request<ScheduleChangeRequest[]>('/schedule-requests');
  },

  reviewScheduleRequest: async (id: number, status: 'APPROVED' | 'REJECTED', decisionNotes?: string): Promise<ScheduleChangeRequest> => {
    return request<ScheduleChangeRequest>(`/schedule-requests/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, decisionNotes })
    });
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    return request<NotificationItem[]>('/notifications');
  },

  markNotificationRead: async (id: number): Promise<void> => {
    await request(`/notifications/${id}/read`, { method: 'POST' });
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await request('/notifications/read-all', { method: 'POST' });
  },

  createNotificationStream: (onNotification: (notif: NotificationItem) => void) => {
    const token = localStorage.getItem('jg_auth_token');
    if (!token) return () => {};

    const url = `${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const notif = JSON.parse(e.data);
        onNotification(notif);
      } catch (err) {
        console.error('[Frontend SSE] Error parsing notification:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('[Frontend SSE] Connection warning, browser will auto-reconnect:', err);
    };

    return () => {
      eventSource.close();
    };
  },

  // Audit Logs
  getAuditEvents: async (params: { actorId?: number; entityType?: string } = {}): Promise<AuditEvent[]> => {
    const query = new URLSearchParams();
    if (params.actorId) query.append('actorId', String(params.actorId));
    if (params.entityType) query.append('entityType', params.entityType);
    return request<AuditEvent[]>(`/audit-events?${query.toString()}`);
  },

  // Dashboard & Gamification
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    return request<DashboardMetrics>('/dashboard/summary');
  },

  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    return request<LeaderboardUser[]>('/gamification/leaderboard');
  },

  getBadges: async (): Promise<Badge[]> => {
    return request<Badge[]>('/gamification/badges');
  },

  // System Config
  getSystemConfig: async (): Promise<SystemConfig> => {
    return request<SystemConfig>('/config');
  },

  updateSystemConfig: async (updates: Partial<SystemConfig>): Promise<SystemConfig> => {
    return request<SystemConfig>('/config', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
};

