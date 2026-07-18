import { create } from 'zustand';
import type { 
  Project, Task, TeamMember, Sprint, ActivityLog 
} from '../utils/initialData';
import type { AIRiskAlert } from '../utils/aiEngine';
import { generateRiskAlerts } from '../utils/aiEngine';
import { API_URL } from '../config';

export interface SystemNotification {
  id: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  read: boolean;
  type: 'deadline' | 'workload' | 'dependency' | 'system';
}

interface ProjectState {
  isLoading: boolean;
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  sprints: Sprint[];
  logs: ActivityLog[];
  notifications: SystemNotification[];
  currentUserId: string;
  theme: 'light' | 'dark';
  
  // Filters
  searchQuery: string;
  selectedProjectId: string; // for filtering tasks
  selectedPriority: string;
  selectedAssignee: string;
  
  // Helpers
  updateProjectProgress: (projectId: string) => Promise<void>;
  checkAndGenerateSystemAlerts: () => Promise<void>;
  
  // Actions
  bootstrap: () => Promise<void>;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedProjectId: (id: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSelectedAssignee: (assigneeId: string) => void;
  
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'comments' | 'attachments' | 'timeSpent'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<void>;
  
  // Task Detail Sub-actions
  addComment: (taskId: string, content: string, userId: string) => Promise<void>;
  addChecklistItem: (taskId: string, text: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  deleteChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  logTime: (taskId: string, hours: number) => Promise<void>;
  addAttachment: (taskId: string, name: string, size: string, type: string) => Promise<void>;
  
  // Notifications
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Sprint Management
  addSprint: (sprint: Omit<Sprint, 'id'>) => Promise<void>;
  
  // System Log helper
  addLog: (action: string, targetType: ActivityLog['targetType'], targetName: string, userId?: string) => Promise<void>;
  
  // Refresh alerts based on current state
  getAlerts: () => AIRiskAlert[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  isLoading: true,
  projects: [],
  tasks: [],
  team: [],
  sprints: [],
  logs: [],
  notifications: [],
  currentUserId: 'team-1', // Default to Victus
  theme: 'light',
  
  searchQuery: '',
  selectedProjectId: 'all',
  selectedPriority: 'all',
  selectedAssignee: 'all',

  bootstrap: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(API_URL + '/api/bootstrap');
      if (!res.ok) throw new Error('Failed to bootstrap');
      const data = await res.json();
      set({
        team: data.team,
        projects: data.projects,
        sprints: data.sprints,
        tasks: data.tasks,
        logs: data.logs,
        notifications: data.notifications,
        isLoading: false,
      });
    } catch (err) {
      console.error('Bootstrap failed:', err);
      set({ isLoading: false });
    }
  },
  
  toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),
  setSelectedAssignee: (assigneeId) => set({ selectedAssignee: assigneeId }),

  addLog: async (action, targetType, targetName, userId) => {
    const user = get().team.find(t => t.id === (userId || get().currentUserId));
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'system',
      userName: user?.name || 'System Operator',
      userAvatar: user?.avatar || '',
      action,
      targetType,
      targetName,
    };
    try {
      const res = await fetch(API_URL + '/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (res.ok) {
        const savedLog = await res.json();
        set(state => ({ logs: [savedLog, ...state.logs].slice(0, 50) }));
      }
    } catch (err) {
      console.error('Failed to add log:', err);
    }
  },

  addProject: async (projData) => {
    const newProject: Project = {
      ...projData,
      id: `proj-${Date.now()}`,
      progress: 0,
    };
    try {
      const res = await fetch(API_URL + '/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const savedProj = await res.json();
        set(state => ({ projects: [...state.projects, savedProj] }));
        await get().addLog(`created new project "${savedProj.name}"`, 'project', savedProj.name);
      }
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  },

  updateProject: async (id, updates) => {
    const proj = get().projects.find(p => p.id === id);
    if (!proj) return;
    const updatedProj = { ...proj, ...updates };
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProj),
      });
      if (res.ok) {
        const savedProj = await res.json();
        set(state => ({
          projects: state.projects.map(p => p.id === id ? savedProj : p)
        }));
        await get().addLog(`updated project properties of "${savedProj.name}"`, 'project', savedProj.name);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  },

  deleteProject: async (id) => {
    const proj = get().projects.find(p => p.id === id);
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          tasks: state.tasks.filter(t => t.projectId !== id)
        }));
        if (proj) {
          await get().addLog(`deleted project "${proj.name}" and associated tasks`, 'project', proj.name);
        }
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  },

  addTask: async (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      comments: [],
      attachments: [],
      timeSpent: 0,
    };
    try {
      const res = await fetch(API_URL + '/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({ tasks: [...state.tasks, savedTask] }));
        
        await get().updateProjectProgress(savedTask.projectId);
        await get().addLog(`created task "${savedTask.title}"`, 'task', savedTask.title);
        await get().checkAndGenerateSystemAlerts();
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  },

  updateTask: async (id, updates) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    const updatedTask = { ...task, ...updates };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? savedTask : t)
        }));
        await get().updateProjectProgress(savedTask.projectId);
        await get().addLog(`updated properties of task "${savedTask.title}"`, 'task', savedTask.title);
        await get().checkAndGenerateSystemAlerts();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  },

  deleteTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id)
        }));
        await get().updateProjectProgress(task.projectId);
        await get().addLog(`deleted task "${task.title}"`, 'task', task.title);
        await get().checkAndGenerateSystemAlerts();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  },

  moveTaskStatus: async (id, status) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    const updatedTask = { ...task, status };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? savedTask : t)
        }));
        await get().updateProjectProgress(savedTask.projectId);
        await get().addLog(`moved task "${savedTask.title}" to ${status.replace('_', ' ')}`, 'task', savedTask.title);
      }
    } catch (err) {
      console.error('Failed to move task status:', err);
    }
  },

  bulkUpdateTasks: async (ids, updates) => {
    try {
      const affectedProjects = new Set<string>();
      const updatedTasks = await Promise.all(
        ids.map(async (id) => {
          const task = get().tasks.find(t => t.id === id);
          if (!task) return null;
          affectedProjects.add(task.projectId);
          const updatedTask = { ...task, ...updates };
          const res = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
          });
          if (res.ok) return res.json();
          return null;
        })
      );

      const validUpdated = updatedTasks.filter(Boolean);
      set(state => ({
        tasks: state.tasks.map(t => {
          const found = validUpdated.find(u => u.id === t.id);
          return found ? found : t;
        })
      }));

      for (const projectId of affectedProjects) {
        await get().updateProjectProgress(projectId);
      }
      
      await get().addLog(`performed bulk update on ${ids.length} tasks`, 'task', `${ids.length} tasks`);
      await get().checkAndGenerateSystemAlerts();
    } catch (err) {
      console.error('Failed bulk update tasks:', err);
    }
  },

  addComment: async (taskId, content, userId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    const user = get().team.find(t => t.id === userId);
    const newComment = {
      id: `comm-${Date.now()}`,
      authorId: userId,
      authorName: user?.name || 'Anonymous User',
      authorAvatar: user?.avatar || '',
      content,
      timestamp: new Date().toISOString(),
    };
    const updatedTask = {
      ...task,
      comments: [...task.comments, newComment],
    };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? savedTask : t)
        }));
        await get().addLog(`commented on task "${savedTask.title}"`, 'task', savedTask.title);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  },

  addChecklistItem: async (taskId, text) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    const newItem = {
      id: `check-${Date.now()}`,
      text,
      completed: false,
    };
    const updatedTask = {
      ...task,
      checklist: [...task.checklist, newItem],
    };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? savedTask : t)
        }));
        await get().updateProjectProgress(savedTask.projectId);
      }
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  },

  toggleChecklistItem: async (taskId, itemId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = {
      ...task,
      checklist: task.checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c)
    };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? savedTask : t)
        }));
        await get().updateProjectProgress(savedTask.projectId);
      }
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  },

  deleteChecklistItem: async (taskId, itemId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = {
      ...task,
      checklist: task.checklist.filter(c => c.id !== itemId)
    };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? savedTask : t)
        }));
        await get().updateProjectProgress(savedTask.projectId);
      }
    } catch (err) {
      console.error('Failed to delete checklist item:', err);
    }
  },

  logTime: async (taskId, hours) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = {
      ...task,
      timeSpent: task.timeSpent + hours,
    };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? savedTask : t)
        }));
        await get().addLog(`logged ${hours}h on task "${savedTask.title}"`, 'task', savedTask.title);
      }
    } catch (err) {
      console.error('Failed to log time:', err);
    }
  },

  addAttachment: async (taskId, name, size, type) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    const newAttachment = {
      id: `att-${Date.now()}`,
      name,
      size,
      type,
    };
    const updatedTask = {
      ...task,
      attachments: [...task.attachments, newAttachment],
    };
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        const savedTask = await res.json();
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? savedTask : t)
        }));
      }
    } catch (err) {
      console.error('Failed to add attachment:', err);
    }
  },

  addNotification: async (n) => {
    const newNotif: SystemNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    try {
      const res = await fetch(API_URL + '/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif),
      });
      if (res.ok) {
        const savedNotif = await res.json();
        set(state => ({ notifications: [savedNotif, ...state.notifications] }));
      }
    } catch (err) {
      console.error('Failed to add notification:', err);
    }
  },

  markNotificationRead: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        const saved = await res.json();
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? saved : n)
        }));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const res = await fetch(API_URL + '/api/notifications/read-all', { method: 'POST' });
      if (res.ok) {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  },

  clearNotifications: async () => {
    try {
      const res = await fetch(API_URL + '/api/notifications', { method: 'DELETE' });
      if (res.ok) {
        set({ notifications: [] });
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  },

  addSprint: async (sprintData) => {
    const newSprint: Sprint = {
      ...sprintData,
      id: `sprint-${Date.now()}`,
    };
    try {
      const res = await fetch(API_URL + '/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSprint),
      });
      if (res.ok) {
        const savedSprint = await res.json();
        set(state => ({ sprints: [...state.sprints, savedSprint] }));
        await get().addLog(`created new sprint "${savedSprint.name}"`, 'system', savedSprint.name);
      }
    } catch (err) {
      console.error('Failed to add sprint:', err);
    }
  },

  getAlerts: () => {
    return generateRiskAlerts(get().projects, get().tasks, get().team, get().sprints);
  },

  updateProjectProgress: async (projectId) => {
    const state = get();
    const proj = state.projects.find(p => p.id === projectId);
    if (!proj) return;
    const projTasks = state.tasks.filter(t => t.projectId === projectId);
    if (projTasks.length === 0) return;

    let totalWeight = 0;
    let completedWeight = 0;

    projTasks.forEach(task => {
      const weight = Math.max(1, task.timeEstimate);
      totalWeight += weight;

      if (task.status === 'done') {
        completedWeight += weight;
      } else if (task.checklist.length > 0) {
        const checkDone = task.checklist.filter(c => c.completed).length;
        const ratio = checkDone / task.checklist.length;
        const progressContribution = ratio * weight * 0.7;
        const statusContribution = (task.status === 'testing' ? 0.2 : task.status === 'in_progress' ? 0.1 : 0) * weight;
        completedWeight += (progressContribution + statusContribution);
      } else {
        const statusContribution = (task.status === 'testing' ? 0.25 : task.status === 'in_progress' ? 0.1 : 0) * weight;
        completedWeight += statusContribution;
      }
    });

    const progress = Math.min(99, Math.round((completedWeight / totalWeight) * 100));
    const calculatedProgress = projTasks.every(t => t.status === 'done') ? 100 : progress;

    if (proj.progress !== calculatedProgress) {
      await get().updateProject(projectId, { progress: calculatedProgress });
    }
  },

  checkAndGenerateSystemAlerts: async () => {
    const state = get();
    const alerts = state.getAlerts();
    
    for (const alert of alerts) {
      const exists = state.notifications.some(n => 
        n.title.includes(alert.type === 'deadline' ? 'Deadline' : alert.type === 'workload' ? 'Workload' : 'Dependency') &&
        n.message.includes(alert.taskTitle || alert.projectName || '')
      );
      
      if (!exists && alert.severity === 'high') {
        await state.addNotification({
          severity: alert.severity,
          title: `AI Risk Alert: ${alert.type.toUpperCase().replace('_', ' ')}`,
          message: `${alert.message} Recommendation: ${alert.recommendation}`,
          type: alert.type === 'deadline' ? 'deadline' : alert.type === 'workload' ? 'workload' : alert.type === 'dependency' ? 'dependency' : 'system',
        });
      }
    }
  }
}));
