export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  skills: string[];
  maxHoursPerWeek: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'testing' | 'completed' | 'delayed';
  ownerId: string;
  startDate: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // percentage
  category: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'testing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId: string;
  dueDate: string;
  dependencies: string[]; // array of task IDs this task depends on
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  timeSpent: number; // in hours
  timeEstimate: number; // in hours
  sprintId?: string; // option for sprints
}

export interface Sprint {
  id: string;
  name: string;
  status: 'past' | 'active' | 'future';
  startDate: string;
  endDate: string;
  goal: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  targetType: 'project' | 'task' | 'team' | 'system';
  targetName: string;
}

// Initial Team Members
export const initialTeam: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Victus',
    role: 'Product Manager',
    avatar: '',
    email: 'victus@enterprise.com',
    skills: ['Roadmapping', 'Agile', 'Product Strategy', 'UI/UX'],
    maxHoursPerWeek: 40,
  },
  {
    id: 'team-2',
    name: 'Marcus Vance',
    role: 'Lead Architect',
    avatar: '',
    email: 'marcus.v@enterprise.com',
    skills: ['AWS', 'System Architecture', 'Node.js', 'PostgreSQL', 'Security'],
    maxHoursPerWeek: 40,
  },
  {
    id: 'team-3',
    name: 'Elena Rostova',
    role: 'Frontend Lead',
    avatar: '',
    email: 'elena.r@enterprise.com',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'WebGL'],
    maxHoursPerWeek: 40,
  },
  {
    id: 'team-4',
    name: 'Alex Chen',
    role: 'Frontend Developer',
    avatar: '',
    email: 'alex.c@enterprise.com',
    skills: ['React', 'TypeScript', 'CSS', 'Framer Motion'],
    maxHoursPerWeek: 40,
  },
  {
    id: 'team-5',
    name: 'David Kim',
    role: 'Backend Developer',
    avatar: '',
    email: 'david.k@enterprise.com',
    skills: ['Node.js', 'Express', 'Docker', 'GraphQL', 'Redis'],
    maxHoursPerWeek: 40,
  },
  {
    id: 'team-6',
    name: 'Sophie Dubois',
    role: 'QA Automation Engineer',
    avatar: '',
    email: 'sophie.d@enterprise.com',
    skills: ['Cypress', 'Playwright', 'Jest', 'CI/CD', 'Selenium'],
    maxHoursPerWeek: 40,
  },
];

// Initial Projects
export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Apollo Enterprise Portal',
    description: 'Next-generation client portal featuring multi-tenant dashboards, secure reporting, and custom integration pipelines.',
    status: 'active',
    ownerId: 'team-1',
    startDate: '2026-06-01',
    deadline: '2026-09-15',
    priority: 'high',
    progress: 68,
    category: 'Web App',
  },
  {
    id: 'proj-2',
    name: 'Titan Database Migration',
    description: 'Migrating legacy on-premise transactional databases to managed high-availability Aurora PostgreSQL clusters with minimal downtime.',
    status: 'active',
    ownerId: 'team-2',
    startDate: '2026-05-10',
    deadline: '2026-08-01', // Looming deadline!
    priority: 'critical',
    progress: 85,
    category: 'Cloud Infra',
  },
  {
    id: 'proj-3',
    name: 'Nova Mobile Companion',
    description: 'Native iOS and Android application enabling on-the-go workspace notifications, approvals, and metrics reporting.',
    status: 'planning',
    ownerId: 'team-3',
    startDate: '2026-08-01',
    deadline: '2026-11-30',
    priority: 'medium',
    progress: 12,
    category: 'Mobile App',
  },
  {
    id: 'proj-4',
    name: 'Hydra Security Audit',
    description: 'Comprehensive penetration testing, vulnerability remediation, and SOC 2 Type II compliance readiness audit.',
    status: 'testing',
    ownerId: 'team-6',
    startDate: '2026-04-15',
    deadline: '2026-07-25', // Very soon!
    priority: 'high',
    progress: 92,
    category: 'Security',
  },
];

// Initial Sprints
export const initialSprints: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 12 (Core Features)',
    status: 'past',
    startDate: '2026-06-15',
    endDate: '2026-06-29',
    goal: 'Complete customer portal auth and dashboard layouts.',
  },
  {
    id: 'sprint-2',
    name: 'Sprint 13 (Integrations & Risks)',
    status: 'active',
    startDate: '2026-07-06',
    endDate: '2026-07-20', // active sprint
    goal: 'Finalize Postgres data synchronization pipelines and build alerts engine.',
  },
  {
    id: 'sprint-3',
    name: 'Sprint 14 (QA & Launch Prep)',
    status: 'future',
    startDate: '2026-07-20',
    endDate: '2026-08-03',
    goal: 'End-to-end automation testing and load balancer setup.',
  },
];

// Initial Tasks
export const initialTasks: Task[] = [
  // Project 1: Apollo Portal
  {
    id: 'task-101',
    projectId: 'proj-1',
    title: 'Design Client Portal Dashboard layouts',
    description: 'Create high-fidelity mockups for tenant dashboards. Include widgets for quick actions, health scores, and metrics timeline.',
    status: 'done',
    priority: 'high',
    assigneeId: 'team-3',
    dueDate: '2026-06-18',
    dependencies: [],
    checklist: [
      { id: 'c1', text: 'Wireframe basic layouts', completed: true },
      { id: 'c2', text: 'Define color token guidelines', completed: true },
      { id: 'c3', text: 'Present designs to Sarah', completed: true },
    ],
    comments: [
      {
        id: 'comm-1',
        authorId: 'team-1',
        authorName: 'Victus',
        authorAvatar: '',
        content: 'These look very clean. Make sure the charts are responsive.',
        timestamp: '2026-06-17T10:14:00Z',
      },
    ],
    attachments: [
      { id: 'att-1', name: 'dashboard-final.png', size: '1.2 MB', type: 'image/png' },
    ],
    timeSpent: 12,
    timeEstimate: 12,
    sprintId: 'sprint-1',
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    title: 'Implement Multi-Tenant OAuth Router',
    description: 'Set up JWT-based authentication flow with support for Okta, Azure AD, and Google Workspace SSO routing.',
    status: 'done',
    priority: 'critical',
    assigneeId: 'team-5',
    dueDate: '2026-06-25',
    dependencies: [],
    checklist: [
      { id: 'c4', text: 'Configure Okta integration client', completed: true },
      { id: 'c5', text: 'Write route guard middleware', completed: true },
      { id: 'c6', text: 'Encrypt session tokens on client storage', completed: true },
    ],
    comments: [],
    attachments: [],
    timeSpent: 22,
    timeEstimate: 20,
    sprintId: 'sprint-1',
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    title: 'Develop Customizable Widget Grid',
    description: 'Create a drag-and-drop dashboard grid allowing users to pin, resize, and delete analytical reporting widgets.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'team-3',
    dueDate: '2026-07-18', // Close to sprint end!
    dependencies: [],
    checklist: [
      { id: 'c7', text: 'Setup grid coordinate state', completed: true },
      { id: 'c8', text: 'Implement drag handlers', completed: false },
      { id: 'c9', text: 'Add resizing widgets functionality', completed: false },
    ],
    comments: [
      {
        id: 'comm-2',
        authorId: 'team-3',
        authorName: 'Elena Rostova',
        authorAvatar: '',
        content: 'Handling overlapping coordinates is a bit tricky, but getting there.',
        timestamp: '2026-07-14T15:30:00Z',
      },
    ],
    attachments: [],
    timeSpent: 15,
    timeEstimate: 24,
    sprintId: 'sprint-2',
  },
  {
    id: 'task-104',
    projectId: 'proj-1',
    title: 'Connect WebSockets for Real-time Notifications',
    description: 'Establish secure WebSocket connection from front-end to notify users instantly when critical data refreshes or system alerts trigger.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'team-4',
    dueDate: '2026-07-28',
    dependencies: ['task-103'], // Depends on widget grid
    checklist: [
      { id: 'c10', text: 'Establish socket client reconnection policy', completed: false },
      { id: 'c11', text: 'Design notification toast styles', completed: false },
    ],
    comments: [],
    attachments: [],
    timeSpent: 0,
    timeEstimate: 16,
    sprintId: 'sprint-3',
  },
  {
    id: 'task-105',
    projectId: 'proj-1',
    title: 'Write Unit Tests for Portal Settings Panel',
    description: 'Achieve >85% code coverage on setting toggles, user profile update actions, and API billing webhooks.',
    status: 'backlog',
    priority: 'low',
    assigneeId: 'team-6',
    dueDate: '2026-08-15',
    dependencies: [],
    checklist: [],
    comments: [],
    attachments: [],
    timeSpent: 0,
    timeEstimate: 12,
  },

  // Project 2: Database Migration
  {
    id: 'task-201',
    projectId: 'proj-2',
    title: 'Conduct Schema Audit and Map Incompatibilities',
    description: 'Analyze legacy DB syntax, stored procedures, and triggers. Create mapping table for PostgreSQL schema equivalence.',
    status: 'done',
    priority: 'critical',
    assigneeId: 'team-2',
    dueDate: '2026-05-25',
    dependencies: [],
    checklist: [
      { id: 'c12', text: 'Dump schema metadata', completed: true },
      { id: 'c13', text: 'Audit custom functions and triggers', completed: true },
      { id: 'c14', text: 'Create schema translation script', completed: true },
    ],
    comments: [],
    attachments: [
      { id: 'att-2', name: 'schema-differences-matrix.xlsx', size: '240 KB', type: 'application/xlsx' },
    ],
    timeSpent: 30,
    timeEstimate: 30,
    sprintId: 'sprint-1',
  },
  {
    id: 'task-202',
    projectId: 'proj-2',
    title: 'Configure High-Availability AWS Aurora Cluster',
    description: 'Spin up primary and read replicas across 3 availability zones. Set up encryption-at-rest and custom IAM authentication.',
    status: 'done',
    priority: 'high',
    assigneeId: 'team-2',
    dueDate: '2026-06-20',
    dependencies: ['task-201'],
    checklist: [
      { id: 'c15', text: 'Write Terraform configs', completed: true },
      { id: 'c16', text: 'Configure KMS encryption keys', completed: true },
      { id: 'c17', text: 'Establish security group boundaries', completed: true },
    ],
    comments: [],
    attachments: [],
    timeSpent: 20,
    timeEstimate: 20,
    sprintId: 'sprint-1',
  },
  {
    id: 'task-203',
    projectId: 'proj-2',
    title: 'Build Live Replication Pipeline (DMS)',
    description: 'Establish AWS Database Migration Service task to stream CDC (Change Data Capture) from legacy source to target Aurora.',
    status: 'in_progress',
    priority: 'critical',
    assigneeId: 'team-2', // Marcus is doing this, but he's already at 38 hours this sprint! AI should flag this.
    dueDate: '2026-07-16', // TODAY!
    dependencies: ['task-202'],
    checklist: [
      { id: 'c18', text: 'Configure replication instance in VPC', completed: true },
      { id: 'c19', text: 'Map source schemas and tables', completed: true },
      { id: 'c20', text: 'Run initial full load synchronization', completed: false },
      { id: 'c21', text: 'Validate row-count checksums', completed: false },
    ],
    comments: [
      {
        id: 'comm-3',
        authorId: 'team-2',
        authorName: 'Marcus Vance',
        authorAvatar: '',
        content: 'Encountering LOB replication lag. Optimizing replication task memory allocation.',
        timestamp: '2026-07-15T18:45:00Z',
      },
    ],
    attachments: [],
    timeSpent: 28,
    timeEstimate: 25,
    sprintId: 'sprint-2',
  },
  {
    id: 'task-204',
    projectId: 'proj-2',
    title: 'Dry Run Cutover Execution',
    description: 'Simulate production switch-over. Measure write downtime, rollback process, client reconnect velocity, and DNS propagation delay.',
    status: 'todo',
    priority: 'high',
    assigneeId: 'team-5',
    dueDate: '2026-07-26',
    dependencies: ['task-203'], // Blocked by DMS! DMS is in progress/delayed. AI should report this dependency block.
    checklist: [
      { id: 'c22', text: 'Define 20-step checklist sequence', completed: false },
      { id: 'c23', text: 'Schedule test window with stakeholders', completed: false },
      { id: 'c24', text: 'Draft rollback shell scripts', completed: false },
    ],
    comments: [],
    attachments: [],
    timeSpent: 0,
    timeEstimate: 16,
    sprintId: 'sprint-3',
  },

  // Project 3: Nova Mobile
  {
    id: 'task-301',
    projectId: 'proj-3',
    title: 'Draft Mobile UI Specs and Flow Maps',
    description: 'Document navigation tree, notifications hub dashboard, quick filters, settings configuration, and offline support actions.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'team-3',
    dueDate: '2026-08-10',
    dependencies: [],
    checklist: [
      { id: 'c25', text: 'Map navigation stack structure', completed: true },
      { id: 'c26', text: 'Sketch home dashboard screen layout', completed: false },
      { id: 'c27', text: 'Review UX flow with product management', completed: false },
    ],
    comments: [],
    attachments: [],
    timeSpent: 6,
    timeEstimate: 16,
  },
  {
    id: 'task-302',
    projectId: 'proj-3',
    title: 'Bootstrap React Native Expo Project',
    description: 'Set up template with TypeScript, tailwind-react-native, lucide-react-native, and react-navigation wrappers.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'team-4',
    dueDate: '2026-08-20',
    dependencies: ['task-301'],
    checklist: [],
    comments: [],
    attachments: [],
    timeSpent: 0,
    timeEstimate: 8,
  },

  // Project 4: Hydra Security Audit
  {
    id: 'task-401',
    projectId: 'proj-4',
    title: 'Static Application Security Testing (SAST)',
    description: 'Configure automated scanners in GitHub CI pipeline. Triage and fix high severity vulnerability reports.',
    status: 'done',
    priority: 'high',
    assigneeId: 'team-6',
    dueDate: '2026-05-15',
    dependencies: [],
    checklist: [
      { id: 'c28', text: 'Integrate Semgrep scanner', completed: true },
      { id: 'c29', text: 'Integrate Snyk node package scanner', completed: true },
      { id: 'c30', text: 'Triage 42 positive scanner reports', completed: true },
    ],
    comments: [],
    attachments: [],
    timeSpent: 24,
    timeEstimate: 20,
    sprintId: 'sprint-1',
  },
  {
    id: 'task-402',
    projectId: 'proj-4',
    title: 'External Penetration Testing',
    description: 'Contract credentialed network pen-testers to probe external endpoints, OAuth auth endpoints, and multi-tenant isolation.',
    status: 'testing',
    priority: 'critical',
    assigneeId: 'team-6',
    dueDate: '2026-07-19', // Looming!
    dependencies: [],
    checklist: [
      { id: 'c31', text: 'Provision sandbox staging environment', completed: true },
      { id: 'c32', text: 'Deliver API schemas and credentials', completed: true },
      { id: 'c33', text: 'Receive draft vulnerability report', completed: true },
      { id: 'c34', text: 'Remediate 3 found API bypass issues', completed: false },
    ],
    comments: [
      {
        id: 'comm-4',
        authorId: 'team-6',
        authorName: 'Sophie Dubois',
        authorAvatar: '',
        content: 'Pen-testers found missing rate-limits on login. Working with David to set up Redis rate-limiting.',
        timestamp: '2026-07-14T09:00:00Z',
      },
    ],
    attachments: [],
    timeSpent: 32,
    timeEstimate: 40,
    sprintId: 'sprint-2',
  },
  {
    id: 'task-403',
    projectId: 'proj-4',
    title: 'Assemble SOC 2 Evidence Binder',
    description: 'Collect configuration files, access approval logs, deployment audits, and security training completion receipts for auditor review.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'team-1',
    dueDate: '2026-07-25',
    dependencies: ['task-402'],
    checklist: [
      { id: 'c35', text: 'Export all IAM membership lists', completed: false },
      { id: 'c36', text: 'Collect AWS backup configuration snapshots', completed: false },
      { id: 'c37', text: 'File SOC2 policy read receipts', completed: false },
    ],
    comments: [],
    attachments: [],
    timeSpent: 0,
    timeEstimate: 24,
    sprintId: 'sprint-3',
  },
];

// Initial Activity Logs
export const initialLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-16T15:20:00Z',
    userId: 'team-3',
    userName: 'Elena Rostova',
    userAvatar: '',
    action: 'updated status of task "Develop Customizable Widget Grid" to In Progress',
    targetType: 'task',
    targetName: 'Develop Customizable Widget Grid',
  },
  {
    id: 'log-2',
    timestamp: '2026-07-16T11:05:00Z',
    userId: 'team-2',
    userName: 'Marcus Vance',
    userAvatar: '',
    action: 'logged 4.5 hours on task "Build Live Replication Pipeline (DMS)"',
    targetType: 'task',
    targetName: 'Build Live Replication Pipeline (DMS)',
  },
  {
    id: 'log-3',
    timestamp: '2026-07-15T16:40:00Z',
    userId: 'team-1',
    userName: 'Victus',
    userAvatar: '',
    action: 'created new project "Nova Mobile Companion"',
    targetType: 'project',
    targetName: 'Nova Mobile Companion',
  },
  {
    id: 'log-4',
    timestamp: '2026-07-15T09:12:00Z',
    userId: 'team-6',
    userName: 'Sophie Dubois',
    userAvatar: '',
    action: 'added comment to task "External Penetration Testing"',
    targetType: 'task',
    targetName: 'External Penetration Testing',
  },
];
