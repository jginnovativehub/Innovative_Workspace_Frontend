export type UserRole = 'ADMIN' | 'CEO' | 'COO' | 'EMPLOYEE';

export interface Badge {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  awardedAt?: string;
  reason?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  active: boolean;
  xp: number;
  level: number;
  streakCount: number;
  avatarTitle: string;
  badges?: Badge[];
  createdAt: string;
  lastLogin?: string;
}

export interface ProjectMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  projectRole: string;
}

export interface ProgressUpdate {
  id: number;
  taskId?: number;
  milestoneId?: number;
  authorId: number;
  authorName?: string;
  statusSnapshot: string;
  note: string;
  workLog?: string;
  isBlocker: boolean;
  blockerReason?: string;
  impact?: string;
  proposedSolution?: string;
  expectedResolutionDate?: string;
  supportNeeded?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  milestoneId: number;
  title: string;
  description?: string;
  ownerId?: number;
  ownerName?: string;
  status: 'BACKLOG' | 'ASSIGNED' | 'IN_PROGRESS' | 'AT_RISK' | 'BLOCKED' | 'SUBMITTED_FOR_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED_COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  dueDate: string;
  originalDueDate: string;
  acceptanceCriteria?: string;
  deliverableExpected?: string;
  xpReward: number;
  submittedAt?: string;
  completedAt?: string;
  milestoneTitle?: string;
  projectName?: string;
  predecessorIds?: number[];
  updates?: ProgressUpdate[];
}

export interface Milestone {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  sequence: number;
  ownerId?: number;
  ownerName?: string;
  reviewerId?: number;
  reviewerName?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'BLOCKED' | 'SUBMITTED_FOR_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED_COMPLETED' | 'CANCELLED';
  startDate: string;
  dueDate: string;
  acceptanceCriteria: string;
  acceptedAt?: string;
  evidenceNotes?: string;
  evidenceUrl?: string;
  xpReward: number;
  projectName?: string;
  predecessorIds?: number[];
  tasks?: Task[];
}

export interface Project {
  id: number;
  code: string;
  name: string;
  objective: string;
  scope?: string;
  deliverables?: string;
  ownerId: number;
  ownerName?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  targetDate: string;
  createdAt: string;
  archivedAt?: string;
  members: ProjectMember[];
  milestones: Milestone[];
  milestonesCount: number;
  tasksCount: number;
  completedMilestones: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface WeeklyReportVersion {
  id: number;
  reportId: number;
  versionNumber: number;
  completedThisWeek: string;
  inProgress: string;
  blockersRisks?: string;
  reasonForDelay?: string;
  proposedSolution?: string;
  nextWeekPlan: string;
  supportDecisionsRequired?: string;
  submittedAt: string;
  submittedBy: number;
  submitterName?: string;
}

export interface WeeklyReport {
  id: number;
  userId: number;
  userName?: string;
  periodStart: string;
  periodEnd: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'REVIEWED' | 'CHANGES_REQUESTED';
  currentVersion: number;
  submittedAt?: string;
  reviewedBy?: number;
  reviewerName?: string;
  reviewedAt?: string;
  reviewerFeedback?: string;
  xpAwarded: number;
  versions: WeeklyReportVersion[];
}

export interface ScheduleChangeRequest {
  id: number;
  taskId?: number;
  taskTitle?: string;
  milestoneId?: number;
  requesterId: number;
  requesterName?: string;
  approverId?: number;
  approverName?: string;
  oldDueDate: string;
  newDueDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  decidedAt?: string;
  decisionNotes?: string;
}

export interface NotificationItem {
  id: number;
  recipientId: number;
  type: string;
  title: string;
  body: string;
  targetType?: string;
  targetId?: number;
  readAt?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: number;
  actorId?: number;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: number;
  beforeSummary?: string;
  afterSummary?: string;
  reason?: string;
  timestamp: string;
}

export interface DashboardMetrics {
  milestoneCompletionRate: number;
  totalMilestones: number;
  approvedMilestones: number;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  overdueCount: number;
  atRiskCount: number;
  blockedCount: number;
  weeklyReportComplianceRate: number;
  reviewBacklogCount: number;
  userXP: number;
  userLevel: number;
  userStreak: number;
  userTitle: string;
}

export interface LeaderboardUser {
  id: number;
  fullName: string;
  role: string;
  department: string;
  xp: number;
  level: number;
  streakCount: number;
  avatarTitle: string;
  completedTasksCount: number;
  badgesCount: number;
  rank: number;
}

export interface SystemConfig {
  id: number;
  reportingWeekStart: string;
  reportingDeadlineDay: string;
  reportingDeadlineTime: string;
  companyTimezone: string;
  maxFileSizeMb: number;
  retentionDays: number;
}

