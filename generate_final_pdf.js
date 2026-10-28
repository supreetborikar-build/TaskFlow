import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Create a new PDF document with custom margins
const doc = new PDFDocument({ margin: 50, bufferPages: true });
doc.pipe(fs.createWriteStream('TechFlow_System_Documentation_Final.pdf'));

// Color palette definitions
const COLORS = {
  primary: '#0F172A',     // Dark Navy Slate
  secondary: '#2563EB',   // Indigo Blue
  text: '#334155',        // Charcoal Text
  muted: '#64748B',       // Slate grey
  codeBg: '#F8FAFC',      // Code background
  border: '#E2E8F0',      // Light border
  accentRed: '#DC2626',   // Alert / Action Red
  accentGreen: '#16A34A'  // Success Green
};

// ==========================================
// Formatting Helper Functions
// ==========================================

function addTitlePage() {
  doc.rect(0, 0, 612, 792).fill('#F8FAFC');
  
  // Header top accent line
  doc.rect(0, 0, 612, 18).fill(COLORS.secondary);
  
  // Title text block
  doc.fillColor(COLORS.primary)
     .font('Helvetica-Bold')
     .fontSize(38)
     .text('TechFlow', 50, 180)
     .moveDown(0.2);

  doc.fillColor(COLORS.secondary)
     .font('Helvetica-Bold')
     .fontSize(13)
     .text('ENTERPRISE PROJECT MANAGEMENT PLATFORM', 50, 225)
     .moveDown(0.5);

  // Separation Line
  doc.strokeColor(COLORS.secondary)
     .lineWidth(3)
     .moveTo(50, 245)
     .lineTo(350, 245)
     .stroke()
     .moveDown(1.5);

  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(11)
     .text('Ultimate Technical Specification and Integration Manual\nSQLite3 Schema, REST API Routes, and UI Architecture', 50, 270, { lineGap: 5 });

  // Sidebar decorative block
  doc.rect(50, 340, 4, 150).fill(COLORS.border);
  doc.fillColor(COLORS.muted)
     .font('Helvetica-Oblique')
     .fontSize(10)
     .text('This document serves as the absolute technical reference for TechFlow.\nIt covers the visual layout guidelines, full-stack Decoupled State Replatforming, SQLite relational definitions, backend REST routes, and automated AI scheduling logic.', 70, 340, { width: 450, lineGap: 4 });

  // Metadata Footer
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(9.5)
     .text('AUTHOR: ', 50, 560, { continued: true })
     .font('Helvetica')
     .text('Lead Architect & Principal Software Engineer')
     .moveDown(0.4);

  doc.font('Helvetica-Bold')
     .text('ENTERPRISE USER: ', { continued: true })
     .font('Helvetica')
     .text('Victus (victus@enterprise.com)')
     .moveDown(0.4);

  doc.font('Helvetica-Bold')
     .text('VERSION: ', { continued: true })
     .font('Helvetica')
     .text('1.0.0 (Production Release Build)')
     .moveDown(0.4);

  doc.font('Helvetica-Bold')
     .text('DATE OF COMPILATION: ', { continued: true })
     .font('Helvetica')
     .text('July 16, 2026')
     .moveDown(0.4);

  doc.font('Helvetica-Bold')
     .text('SYSTEM ENVIRONMENT: ', { continued: true })
     .font('Helvetica')
     .text('Node.js v22.17.0, Express 5.2.1, SQLite3 v6.0.1, React 19, Vite 8, TypeScript 6.0');
}

function startNewSection(title, indexText) {
  doc.addPage();
  doc.fillColor(COLORS.secondary)
     .font('Helvetica-Bold')
     .fontSize(16)
     .text(title)
     .moveDown(0.4);

  const y = doc.y;
  doc.strokeColor(COLORS.border)
     .lineWidth(1.5)
     .moveTo(50, y)
     .lineTo(562, y)
     .stroke()
     .moveDown(0.8);
}

function writeSubHeader(title) {
  doc.fillColor(COLORS.primary)
     .font('Helvetica-Bold')
     .fontSize(11.5)
     .text(title)
     .moveDown(0.3);
}

function writeParagraph(text) {
  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(9.5)
     .text(text, { align: 'justify', lineGap: 3.5 })
     .moveDown(0.8);
}

function writeBullet(title, text) {
  doc.fillColor(COLORS.primary)
     .font('Helvetica-Bold')
     .fontSize(9.5)
     .text(`•  ${title}: `, { indent: 15, continued: true })
     .font('Helvetica')
     .fillColor(COLORS.text)
     .text(text, { lineGap: 2.5 })
     .moveDown(0.4);
}

function writeCodeBlock(code) {
  const currentY = doc.y;
  doc.font('Courier-Bold')
     .fontSize(8);

  const padding = 12;
  const height = doc.heightOfString(code, { width: 492 }) + (padding * 2);
  
  if (currentY + height > 730) {
    doc.addPage();
  }

  const drawY = doc.y;
  // Background Box
  doc.rect(50, drawY, 512, height)
     .fill(COLORS.codeBg);

  // Borders
  doc.strokeColor(COLORS.border)
     .lineWidth(0.5)
     .rect(50, drawY, 512, height)
     .stroke();

  // Content Text
  doc.fillColor(COLORS.primary)
     .text(code, 62, drawY + padding, { width: 488, lineGap: 2 })
     .moveDown(1.4);
}

// ==========================================
// Document Generation Flow
// ==========================================

// PAGE 1: COVER
addTitlePage();

// PAGE 2: OBJECTIVES & BRANDING
startNewSection('1. PROJECT SCOPE & BRANDING GUIDELINES');
writeParagraph('TechFlow is a high-fidelity Software Project Management System crafted under premium enterprise UX criteria. The application rebrands the visual presentation and transitions the runtime from temporary browser cache storage into an enterprise full-stack infrastructure with local SQL durability.');

writeSubHeader('A. Brand Identity Specification');
writeParagraph('The branding features deep slate secondary controls, minimal rounded components, and standard typography alignments inspired by Notion and Linear. General modifications include:');
writeBullet('Typography Hierarchy', 'Utilizes primary sans-serif metrics with precise tracking values for lists, board cards, and headers.');
writeBullet('Logo Typography', 'Configured globally as bold Helvetica tracking at 1.5px spacing with deep slate colors in the Layout page.');
writeBullet('Workspace Rebrand', 'Applied "TechFlow" title markings to index.html titles, sidebar layout, and navigation wrappers.');

writeSubHeader('B. Text-Initials Avatars (UserAvatar.tsx)');
writeParagraph('To eliminate unnecessary graphical overhead and ensure clean visual alignment, image-based profile avatars were removed. A unified, initials-based badge component is implemented. It reads team names, splits them by space, handles null/empty/undefined cases safely, extracts the first two letters, and converts them to uppercase SVG tokens:');
writeCodeBlock(`export const UserAvatar: React.FC<{ name?: string; className?: string }> = ({ 
  name = 'User', 
  className = 'w-8 h-8' 
}) => {
  const displayName = name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className={\`rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold \${className}\`}>
      {initials}
    </div>
  );
};`);


// PAGE 3: DATABASE ARCHITECTURE
startNewSection('2. FULL-STACK DATABASE SCHEMA (SQLITE3)');
writeParagraph('The persistence layer is managed by SQLite3 (techflow.db) running locally within the project directory. The database handles structured mapping, relational constraints, indices, and automated seeds:');

writeSubHeader('A. Relational Schemas Specification');
writeCodeBlock(`-- Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'future',
  startDate TEXT,
  endDate TEXT,
  goal TEXT
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  ownerId TEXT,
  startDate TEXT,
  deadline TEXT,
  priority TEXT DEFAULT 'medium',
  progress INTEGER DEFAULT 0,
  category TEXT
);

-- Tasks Table with CASCADE Delete constraint
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigneeId TEXT,
  dueDate TEXT,
  dependencies TEXT NOT NULL DEFAULT '[]', -- Stored as JSON String
  checklist TEXT NOT NULL DEFAULT '[]',    -- Stored as JSON String
  comments TEXT NOT NULL DEFAULT '[]',     -- Stored as JSON String
  attachments TEXT NOT NULL DEFAULT '[]',  -- Stored as JSON String
  timeSpent REAL DEFAULT 0,
  timeEstimate REAL DEFAULT 0,
  sprintId TEXT,
  FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

-- Logs Table
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  userId TEXT,
  userName TEXT,
  userAvatar TEXT,
  action TEXT NOT NULL,
  targetType TEXT,
  targetName TEXT
);`);


// PAGE 4: BACKEND API
startNewSection('3. BACKEND API ROUTES CATALOG (EXPRESS)');
writeParagraph('The backend service hosts REST APIs mapping SQLite query bindings to JSON payloads. Every write action triggers log tracking, notification alerts, and weighted time updates.');

writeSubHeader('A. Routes Reference Specifications');
writeCodeBlock(`-- GET /api/bootstrap
Retrieves full database payload: sprints, projects, tasks, team, logs, notifications.
Response: { team: [], projects: [], tasks: [], sprints: [], logs: [], notifications: [] }

-- POST /api/projects
Inserts a new project into the projects table.
Request Body: { id, name, description, ownerId, startDate, deadline, priority, category }

-- PUT /api/projects/:id
Updates properties of an existing project and runs recalculation methods.

-- DELETE /api/projects/:id
Deletes project. SQL foreign keys cascade and delete all associated tasks.

-- POST /api/tasks
Creates a new task.
Request Body: { id, projectId, title, description, status, priority, assigneeId, dueDate, timeEstimate }

-- PUT /api/tasks/:id
Updates task. Calculates weighted progress variables, updates parent project.

-- DELETE /api/tasks/:id
Deletes a single task from the database.

-- POST /api/logs
Appends a logging entry to audit logs.

-- PUT /api/notifications/:id/read
Marks specific notification as read.

-- POST /api/notifications/read-all
Sets all notification records read flag to 1 (true).

-- DELETE /api/notifications
Purges read notifications to clean history.`);


// PAGE 5: STATE MANAGEMENT
startNewSection('4. FRONTEND STATE REPLATFORMING (ZUSTAND)');
writeParagraph('The state engine was re-engineered by removing local browser persistence middleware. The client Zustand store now handles asynchronous server fetches, bootstrapping, and local memory updates:');

writeSubHeader('A. Zustand Actions Catalog (useProjectStore.ts)');
writeCodeBlock(`-- 1. Bootstrapping sequence
bootstrap: async () => {
  set({ isLoading: true });
  const res = await fetch('/api/bootstrap');
  const data = await res.json();
  set({ ...data, isLoading: false });
}

-- 2. Create Task Action
addTask: async (taskData) => {
  const newTask = { ...taskData, id: 'task-' + Date.now(), comments: [], attachments: [], timeSpent: 0 };
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  });
  if (res.ok) {
    const saved = await res.json();
    set(state => ({ tasks: [...state.tasks, saved] }));
    await get().updateProjectProgress(saved.projectId);
    await get().addLog('created task "' + saved.title + '"', 'task', saved.title);
  }
}

-- 3. Delete Task Action
deleteTask: async (id) => {
  const task = get().tasks.find(t => t.id === id);
  if (!task) return;
  const res = await fetch('/api/tasks/' + id, { method: 'DELETE' });
  if (res.ok) {
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    await get().updateProjectProgress(task.projectId);
    await get().addLog('deleted task "' + task.title + '"', 'task', task.title);
  }
}`);


// PAGE 6: HARDENING & UX SAFEGUARDS
startNewSection('5. STABILITY HARDENING & UX SPECIFICATION');
writeParagraph('Several defensive coding methodologies were implemented to ensure the system is immune to runtime crashes, type mismatches, and validation errors:');

writeSubHeader('A. Auto-Sync Dropdown Selectors');
writeParagraph('To solve the React `<select>` binding bug (where form fields display the first value in the options list, but their React state remains empty until clicked), a custom sync effect was introduced. On modal mount, the forms dynamically sync with loaded data:');
writeCodeBlock(`// Inside Tasks.tsx
useEffect(() => {
  if (!formProjectId && projects.length > 0) {
    setFormProjectId(selectedProjectId !== 'all' ? selectedProjectId : projects[0].id);
  }
  if (!formAssigneeId && team.length > 0) {
    setFormAssigneeId(team[0].id);
  }
}, [projects, team, formProjectId, formAssigneeId]);`);

writeSubHeader('B. SQLite Binding & Array Schema Parsers');
writeParagraph('1. Parameter Sanitization: Handled in REST route inputs. Converts undefined variables to null/empty values to avoid database binding crashes.');
writeParagraph('2. Parsing Safeguards: Implemented array check sanitizers. Enforces that arrays are always returned for checklist, comment, and attachment columns, shielding frontend filters:');
writeCodeBlock(`const parseTaskRow = (task) => {
  if (!task) return null;
  let dependencies = [], checklist = [], comments = [], attachments = [];
  try { dependencies = JSON.parse(task.dependencies); } catch(e){}
  try { checklist = JSON.parse(task.checklist); } catch(e){}
  try { comments = JSON.parse(task.comments); } catch(e){}
  try { attachments = JSON.parse(task.attachments); } catch(e){}
  return {
    ...task,
    dependencies: Array.isArray(dependencies) ? dependencies : [],
    checklist: Array.isArray(checklist) ? checklist : [],
    comments: Array.isArray(comments) ? comments : [],
    attachments: Array.isArray(attachments) ? attachments : [],
  };
};`);


// PAGE 7: AI TELEMETRY FORMULAS
startNewSection('6. AI ENGINE ALGORITHMS & TELEMETRY');
writeParagraph('TechFlow features a heuristic AI engine that computes project health scores, task priorities, and sprint burn-down forecasts dynamically:');

writeSubHeader('A. Project Health Rating');
writeParagraph('Project health represents divergence risk on a scale of 0 to 100. It deducts points for overdue tasks and backlog blockers:');
writeCodeBlock(`Score = 100
  - (Overdue Tasks Count * 15)
  - (Todo/Backlog Critical Priority Tasks Count * 10)
  - (Todo/Backlog High Priority Tasks Count * 5)
  
* Risk Level is calculated as:
  Score < 50: HIGH RISK
  Score < 80: MEDIUM RISK
  Score >= 80: LOW RISK`);

writeSubHeader('B. Smart Prioritization Score');
writeParagraph('Sorts uncompleted tasks on the Dashboard to surface critical items. Priorities and due dates are weighted as follows:');
writeCodeBlock(`Task Priority Score = PriorityWeight + ProjectWeight + UrgencyWeight + StatusWeight

- PriorityWeight: Critical = 100, High = 60, Medium = 30, Low = 10
- ProjectWeight:  Critical Priority Project = +50
- UrgencyWeight:  Overdue Task = +80, Due in 3 days = +40
- StatusWeight:   In Progress Task = +15 (assures momentum)`);

writeSubHeader('C. Sprint Analytics & Burn-down');
writeParagraph('Calculates completion speed and rollover risks. The ideal burndown line linearly reduces effort hours, while the actual line sums the timeEstimate values of uncompleted tasks.');


// PAGE 8: REFERENCE MANUAL
startNewSection('7. ARCHITECTURE DEPLOYMENT MANUAL');
writeParagraph('To manage, run, and scale TechFlow locally, use the following execution configurations:');

writeSubHeader('A. Directory Structure Map');
writeCodeBlock(`techflow/
├── server/
│   ├── index.js        # Express API Server (port 5000)
│   └── db.js           # SQLite3 Schema, Seed, and Query Pool
├── src/
│   ├── store/
│   │   └── useProjectStore.ts  # Zustand API Actions Store
│   ├── components/
│   │   ├── Layout.tsx          # Main Shell Layout
│   │   ├── UserAvatar.tsx      # Text Initials Badge Component
│   │   └── TaskModal.tsx       # Detail Inspector & Delete Action
│   └── pages/
│       ├── Dashboard.tsx       # Smart prioritization list
│       └── Tasks.tsx           # Kanban board & sync hooks
├── vite.config.ts      # Reverse Proxy Configuration mapping /api
├── package.json        # Concurrently execution scripts
└── techflow.db         # Persistent SQLite3 Database`);

writeSubHeader('B. Configuration Port Mapping');
writeCodeBlock(`// Inside vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
});`);

writeSubHeader('C. Compilation & Dev Launch commands');
writeCodeBlock(`# 1. Start Client & Server concurrently
npm run dev

# 2. Build production assets
npm run build`);


// ==========================================
// Header & Footer Layout setup
// ==========================================
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  
  if (i > 0) {
    // Header
    doc.fillColor(COLORS.muted)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text('TechFlow Technical Specification Manual', 50, 30)
       .font('Helvetica')
       .text(`Chapter ${i}`, 500, 30, { align: 'right' });
    
    doc.strokeColor(COLORS.border)
       .lineWidth(0.5)
       .moveTo(50, 41)
       .lineTo(562, 41)
       .stroke();

    // Footer
    doc.strokeColor(COLORS.border)
       .lineWidth(0.5)
       .moveTo(50, 748)
       .lineTo(562, 748)
       .stroke();

    doc.fillColor(COLORS.muted)
       .font('Helvetica-Bold')
       .text('CONFIDENTIAL - PROPRIETARY ARCHITECTURE', 50, 756)
       .font('Helvetica')
       .text(`Page ${i + 1} of ${pages.count}`, 500, 756, { align: 'right' });
  }
}

// Close and save PDF
doc.end();
console.log('Final detailed PDF TechFlow_System_Documentation_Final.pdf successfully generated.');
