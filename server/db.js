import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../techflow.db');

// Connect to SQLite DB
const db = new sqlite3.Database(dbPath);

// Promised DB query helpers
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize schema and seed data
export const initDb = async () => {
  // Create Team Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS team (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      email TEXT NOT NULL,
      skills TEXT NOT NULL,
      maxHoursPerWeek INTEGER NOT NULL
    )
  `);

  // Create Projects Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      startDate TEXT NOT NULL,
      deadline TEXT NOT NULL,
      priority TEXT NOT NULL,
      progress INTEGER NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // Create Sprints Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sprints (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      goal TEXT NOT NULL
    )
  `);

  // Create Tasks Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assigneeId TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      dependencies TEXT NOT NULL,
      checklist TEXT NOT NULL,
      comments TEXT NOT NULL,
      attachments TEXT NOT NULL,
      timeSpent REAL NOT NULL,
      timeEstimate REAL NOT NULL,
      sprintId TEXT
    )
  `);

  // Create Logs Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      userAvatar TEXT,
      action TEXT NOT NULL,
      targetType TEXT NOT NULL,
      targetName TEXT NOT NULL
    )
  `);

  // Create Notifications Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL,
      type TEXT NOT NULL
    )
  `);

  // Check if database is already seeded
  const teamCount = await dbGet('SELECT count(*) as count FROM team');
  if (teamCount.count === 0) {
    console.log('Database empty. Seeding initial TechFlow records...');

    // Seed Team
    const initialTeam = [
      { id: 'team-1', name: 'Victus', role: 'Product Manager', avatar: '', email: 'victus@enterprise.com', skills: ['Roadmapping', 'Agile', 'Product Strategy', 'UI/UX'], maxHoursPerWeek: 40 },
      { id: 'team-2', name: 'Marcus Vance', role: 'Lead Architect', avatar: '', email: 'marcus.v@enterprise.com', skills: ['AWS', 'System Architecture', 'Node.js', 'PostgreSQL', 'Security'], maxHoursPerWeek: 40 },
      { id: 'team-3', name: 'Elena Rostova', role: 'Frontend Lead', avatar: '', email: 'elena.r@enterprise.com', skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'WebGL'], maxHoursPerWeek: 40 },
      { id: 'team-4', name: 'Alex Chen', role: 'Frontend Developer', avatar: '', email: 'alex.c@enterprise.com', skills: ['React', 'TypeScript', 'CSS', 'Framer Motion'], maxHoursPerWeek: 40 },
      { id: 'team-5', name: 'David Kim', role: 'Backend Developer', avatar: '', email: 'david.k@enterprise.com', skills: ['Node.js', 'Express', 'Docker', 'GraphQL', 'Redis'], maxHoursPerWeek: 40 },
      { id: 'team-6', name: 'Sophie Dubois', role: 'QA Automation Engineer', avatar: '', email: 'sophie.d@enterprise.com', skills: ['Cypress', 'Playwright', 'Jest', 'CI/CD', 'Selenium'], maxHoursPerWeek: 40 }
    ];

    for (const member of initialTeam) {
      await dbRun(
        'INSERT INTO team (id, name, role, avatar, email, skills, maxHoursPerWeek) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [member.id, member.name, member.role, member.avatar, member.email, JSON.stringify(member.skills), member.maxHoursPerWeek]
      );
    }

    // Seed Projects
    const initialProjects = [
      { id: 'proj-1', name: 'Apollo Enterprise Portal', description: 'Next-generation client portal featuring multi-tenant dashboards, secure reporting, and custom integration pipelines.', status: 'active', ownerId: 'team-1', startDate: '2026-06-01', deadline: '2026-09-15', priority: 'high', progress: 68, category: 'Web App' },
      { id: 'proj-2', name: 'Titan Database Migration', description: 'Migrating legacy on-premise transactional databases to managed high-availability Aurora PostgreSQL clusters with minimal downtime.', status: 'active', ownerId: 'team-2', startDate: '2026-05-10', deadline: '2026-08-01', priority: 'critical', progress: 85, category: 'Cloud Infra' },
      { id: 'proj-3', name: 'Nova Mobile Companion', description: 'Native iOS and Android application enabling on-the-go workspace notifications, approvals, and metrics reporting.', status: 'planning', ownerId: 'team-3', startDate: '2026-08-01', deadline: '2026-11-30', priority: 'medium', progress: 12, category: 'Mobile App' },
      { id: 'proj-4', name: 'Hydra Security Audit', description: 'Comprehensive penetration testing, vulnerability remediation, and SOC 2 Type II compliance readiness audit.', status: 'testing', ownerId: 'team-6', startDate: '2026-04-15', deadline: '2026-07-25', priority: 'high', progress: 92, category: 'Security' }
    ];

    for (const p of initialProjects) {
      await dbRun(
        'INSERT INTO projects (id, name, description, status, ownerId, startDate, deadline, priority, progress, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.description, p.status, p.ownerId, p.startDate, p.deadline, p.priority, p.progress, p.category]
      );
    }

    // Seed Sprints
    const initialSprints = [
      { id: 'sprint-1', name: 'Sprint 12 (Core Features)', status: 'past', startDate: '2026-06-15', endDate: '2026-06-29', goal: 'Complete customer portal auth and dashboard layouts.' },
      { id: 'sprint-2', name: 'Sprint 13 (Integrations & Risks)', status: 'active', startDate: '2026-07-06', endDate: '2026-07-20', goal: 'Finalize Postgres data synchronization pipelines and build alerts engine.' },
      { id: 'sprint-3', name: 'Sprint 14 (QA & Launch Prep)', status: 'future', startDate: '2026-07-20', endDate: '2026-08-03', goal: 'End-to-end automation testing and load balancer setup.' }
    ];

    for (const s of initialSprints) {
      await dbRun(
        'INSERT INTO sprints (id, name, status, startDate, endDate, goal) VALUES (?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.status, s.startDate, s.endDate, s.goal]
      );
    }

    // Seed Tasks
    const initialTasks = [
      { id: 'task-101', projectId: 'proj-1', title: 'Design Client Portal Dashboard layouts', description: 'Create high-fidelity mockups for tenant dashboards. Include widgets for quick actions, health scores, and metrics timeline.', status: 'done', priority: 'high', assigneeId: 'team-3', dueDate: '2026-06-18', dependencies: [], checklist: [{ id: 'c1', text: 'Wireframe basic layouts', completed: true }, { id: 'c2', text: 'Define color token guidelines', completed: true }, { id: 'c3', text: 'Present designs to Sarah', completed: true }], comments: [{ id: 'comm-1', authorId: 'team-1', authorName: 'Victus', authorAvatar: '', content: 'These look very clean. Make sure the charts are responsive.', timestamp: '2026-06-17T10:14:00Z' }], attachments: [{ id: 'att-1', name: 'dashboard-final.png', size: '1.2 MB', type: 'image/png' }], timeSpent: 12, timeEstimate: 12, sprintId: 'sprint-1' },
      { id: 'task-102', projectId: 'proj-1', title: 'Implement Multi-Tenant OAuth Router', description: 'Set up JWT-based authentication flow with support for Okta, Azure AD, and Google Workspace SSO routing.', status: 'done', priority: 'critical', assigneeId: 'team-5', dueDate: '2026-06-25', dependencies: [], checklist: [{ id: 'c4', text: 'Configure Okta integration client', completed: true }, { id: 'c5', text: 'Write route guard middleware', completed: true }, { id: 'c6', text: 'Encrypt session tokens on client storage', completed: true }], comments: [], attachments: [], timeSpent: 22, timeEstimate: 20, sprintId: 'sprint-1' },
      { id: 'task-103', projectId: 'proj-1', title: 'Develop Customizable Widget Grid', description: 'Create a drag-and-drop dashboard grid allowing users to pin, resize, and delete analytical reporting widgets.', status: 'in_progress', priority: 'high', assigneeId: 'team-3', dueDate: '2026-07-18', dependencies: [], checklist: [{ id: 'c7', text: 'Setup grid coordinate state', completed: true }, { id: 'c8', text: 'Implement drag handlers', completed: false }, { id: 'c9', text: 'Add resizing widgets functionality', completed: false }], comments: [{ id: 'comm-2', authorId: 'team-3', authorName: 'Elena Rostova', authorAvatar: '', content: 'Handling overlapping coordinates is a bit tricky, but getting there.', timestamp: '2026-07-14T15:30:00Z' }], attachments: [], timeSpent: 15, timeEstimate: 24, sprintId: 'sprint-2' },
      { id: 'task-104', projectId: 'proj-1', title: 'Connect WebSockets for Real-time Notifications', description: 'Establish secure WebSocket connection from front-end to notify users instantly when critical data refreshes or system alerts trigger.', status: 'todo', priority: 'medium', assigneeId: 'team-4', dueDate: '2026-07-28', dependencies: ['task-103'], checklist: [{ id: 'c10', text: 'Establish socket client reconnection policy', completed: false }, { id: 'c11', text: 'Design notification toast styles', completed: false }], comments: [], attachments: [], timeSpent: 0, timeEstimate: 16, sprintId: 'sprint-3' },
      { id: 'task-105', projectId: 'proj-1', title: 'Write Unit Tests for Portal Settings Panel', description: 'Achieve >85% code coverage on setting toggles, user profile update actions, and API billing webhooks.', status: 'backlog', priority: 'low', assigneeId: 'team-6', dueDate: '2026-08-15', dependencies: [], checklist: [], comments: [], attachments: [], timeSpent: 0, timeEstimate: 12, sprintId: null },
      { id: 'task-201', projectId: 'proj-2', title: 'Conduct Schema Audit and Map Incompatibilities', description: 'Analyze legacy DB syntax, stored procedures, and triggers. Create mapping table for PostgreSQL schema equivalence.', status: 'done', priority: 'critical', assigneeId: 'team-2', dueDate: '2026-05-25', dependencies: [], checklist: [{ id: 'c12', text: 'Dump schema metadata', completed: true }, { id: 'c13', text: 'Audit custom functions and triggers', completed: true }, { id: 'c14', text: 'Create schema translation script', completed: true }], comments: [], attachments: [{ id: 'att-2', name: 'schema-differences-matrix.xlsx', size: '240 KB', type: 'application/xlsx' }], timeSpent: 30, timeEstimate: 30, sprintId: 'sprint-1' },
      { id: 'task-202', projectId: 'proj-2', title: 'Configure High-Availability AWS Aurora Cluster', description: 'Spin up primary and read replicas across 3 availability zones. Set up encryption-at-rest and custom IAM authentication.', status: 'done', priority: 'high', assigneeId: 'team-2', dueDate: '2026-06-20', dependencies: ['task-201'], checklist: [{ id: 'c15', text: 'Write Terraform configs', completed: true }, { id: 'c16', text: 'Configure KMS encryption keys', completed: true }, { id: 'c17', text: 'Establish security group boundaries', completed: true }], comments: [], attachments: [], timeSpent: 20, timeEstimate: 20, sprintId: 'sprint-1' },
      { id: 'task-203', projectId: 'proj-2', title: 'Build Live Replication Pipeline (DMS)', description: 'Establish AWS Database Migration Service task to stream CDC (Change Data Capture) from legacy source to target Aurora.', status: 'in_progress', priority: 'critical', assigneeId: 'team-2', dueDate: '2026-07-16', dependencies: ['task-202'], checklist: [{ id: 'c18', text: 'Configure replication instance in VPC', completed: true }, { id: 'c19', text: 'Map source schemas and tables', completed: true }, { id: 'c20', text: 'Run initial full load synchronization', completed: false }, { id: 'c21', text: 'Validate row-count checksums', completed: false }], comments: [{ id: 'comm-3', authorId: 'team-2', authorName: 'Marcus Vance', authorAvatar: '', content: 'Encountering LOB replication lag. Optimizing replication task memory allocation.', timestamp: '2026-07-15T18:45:00Z' }], attachments: [], timeSpent: 28, timeEstimate: 25, sprintId: 'sprint-2' },
      { id: 'task-204', projectId: 'proj-2', title: 'Dry Run Cutover Execution', description: 'Simulate production switch-over. Measure write downtime, rollback process, client reconnect velocity, and DNS propagation delay.', status: 'todo', priority: 'high', assigneeId: 'team-5', dueDate: '2026-07-26', dependencies: ['task-203'], checklist: [{ id: 'c22', text: 'Define 20-step checklist sequence', completed: false }, { id: 'c23', text: 'Schedule test window with stakeholders', completed: false }, { id: 'c24', text: 'Draft rollback shell scripts', completed: false }], comments: [], attachments: [], timeSpent: 0, timeEstimate: 16, sprintId: 'sprint-3' },
      { id: 'task-301', projectId: 'proj-3', title: 'Draft Mobile UI Specs and Flow Maps', description: 'Document navigation tree, notifications hub dashboard, quick filters, settings configuration, and offline support actions.', status: 'in_progress', priority: 'medium', assigneeId: 'team-3', dueDate: '2026-08-10', dependencies: [], checklist: [{ id: 'c25', text: 'Map navigation stack structure', completed: true }, { id: 'c26', text: 'Sketch home dashboard screen layout', completed: false }, { id: 'c27', text: 'Review UX flow with product management', completed: false }], comments: [], attachments: [], timeSpent: 6, timeEstimate: 16, sprintId: null },
      { id: 'task-302', projectId: 'proj-3', title: 'Bootstrap React Native Expo Project', description: 'Set up template with TypeScript, tailwind-react-native, lucide-react-native, and react-navigation wrappers.', status: 'todo', priority: 'medium', assigneeId: 'team-4', dueDate: '2026-08-20', dependencies: ['task-301'], checklist: [], comments: [], attachments: [], timeSpent: 0, timeEstimate: 8, sprintId: null },
      { id: 'task-401', projectId: 'proj-4', title: 'Static Application Security Testing (SAST)', description: 'Configure automated scanners in GitHub CI pipeline. Triage and fix high severity vulnerability reports.', status: 'done', priority: 'high', assigneeId: 'team-6', dueDate: '2026-05-15', dependencies: [], checklist: [{ id: 'c28', text: 'Integrate Semgrep scanner', completed: true }, { id: 'c29', text: 'Integrate Snyk node package scanner', completed: true }, { id: 'c30', text: 'Triage 42 positive scanner reports', completed: true }], comments: [], attachments: [], timeSpent: 24, timeEstimate: 20, sprintId: 'sprint-1' },
      { id: 'task-402', projectId: 'proj-4', title: 'External Penetration Testing', description: 'Contract credentialed network pen-testers to probe external endpoints, OAuth auth endpoints, and multi-tenant isolation.', status: 'testing', priority: 'critical', assigneeId: 'team-6', dueDate: '2026-07-19', dependencies: [], checklist: [{ id: 'c31', text: 'Provision sandbox staging environment', completed: true }, { id: 'c32', text: 'Deliver API schemas and credentials', completed: true }, { id: 'c33', text: 'Receive draft vulnerability report', completed: true }, { id: 'c34', text: 'Remediate 3 found API bypass issues', completed: false }], comments: [{ id: 'comm-4', authorId: 'team-6', authorName: 'Sophie Dubois', authorAvatar: '', content: 'Pen-testers found missing rate-limits on login. Working with David to set up Redis rate-limiting.', timestamp: '2026-07-14T09:00:00Z' }], attachments: [], timeSpent: 32, timeEstimate: 40, sprintId: 'sprint-2' },
      { id: 'task-403', projectId: 'proj-4', title: 'Assemble SOC 2 Evidence Binder', description: 'Collect configuration files, access approval logs, deployment audits, and security training completion receipts for auditor review.', status: 'todo', priority: 'medium', assigneeId: 'team-1', dueDate: '2026-07-25', dependencies: ['task-402'], checklist: [{ id: 'c35', text: 'Export all IAM membership lists', completed: false }, { id: 'c36', text: 'Collect AWS backup configuration snapshots', completed: false }, { id: 'c37', text: 'File SOC2 policy read receipts', completed: false }], comments: [], attachments: [], timeSpent: 0, timeEstimate: 24, sprintId: 'sprint-3' }
    ];

    for (const t of initialTasks) {
      await dbRun(
        'INSERT INTO tasks (id, projectId, title, description, status, priority, assigneeId, dueDate, dependencies, checklist, comments, attachments, timeSpent, timeEstimate, sprintId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.projectId, t.title, t.description, t.status, t.priority, t.assigneeId, t.dueDate, JSON.stringify(t.dependencies), JSON.stringify(t.checklist), JSON.stringify(t.comments), JSON.stringify(t.attachments), t.timeSpent, t.timeEstimate, t.sprintId]
      );
    }

    // Seed Logs
    const initialLogs = [
      { id: 'log-1', timestamp: '2026-07-16T15:20:00Z', userId: 'team-3', userName: 'Elena Rostova', userAvatar: '', action: 'updated status of task "Develop Customizable Widget Grid" to In Progress', targetType: 'task', targetName: 'Develop Customizable Widget Grid' },
      { id: 'log-2', timestamp: '2026-07-16T11:05:00Z', userId: 'team-2', userName: 'Marcus Vance', userAvatar: '', action: 'logged 4.5 hours on task "Build Live Replication Pipeline (DMS)"', targetType: 'task', targetName: 'Build Live Replication Pipeline (DMS)' },
      { id: 'log-3', timestamp: '2026-07-15T16:40:00Z', userId: 'team-1', userName: 'Victus', userAvatar: '', action: 'created new project "Nova Mobile Companion"', targetType: 'project', targetName: 'Nova Mobile Companion' },
      { id: 'log-4', timestamp: '2026-07-15T09:12:00Z', userId: 'team-6', userName: 'Sophie Dubois', userAvatar: '', action: 'added comment to task "External Penetration Testing"', targetType: 'task', targetName: 'External Penetration Testing' }
    ];

    for (const l of initialLogs) {
      await dbRun(
        'INSERT INTO logs (id, timestamp, userId, userName, userAvatar, action, targetType, targetName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [l.id, l.timestamp, l.userId, l.userName, l.userAvatar, l.action, l.targetType, l.targetName]
      );
    }

    // Seed Notifications
    const initialNotifications = [
      { id: 'notif-1', timestamp: '2026-07-16T10:00:00Z', severity: 'high', title: 'Overdue Deadline Prediction', message: 'AWS Aurora database migration tasks are trailing schedule. AI predicts 4-day project launch delay.', read: 0, type: 'deadline' },
      { id: 'notif-2', timestamp: '2026-07-15T14:30:00Z', severity: 'medium', title: 'Resource Over-allocation Alert', message: 'Marcus Vance has exceeded maximum recommended workload limits (53 hrs assigned).', read: 0, type: 'workload' }
    ];

    for (const n of initialNotifications) {
      await dbRun(
        'INSERT INTO notifications (id, timestamp, severity, title, message, read, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [n.id, n.timestamp, n.severity, n.title, n.message, n.read, n.type]
      );
    }

    console.log('Database seeded successfully.');
  } else {
    console.log('Database already has records, skipping seed.');
  }
};
