import express from 'express';
import cors from 'cors';
import { initDb, dbAll, dbRun, dbGet } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Helpers to parse JSON columns
const parseTaskRow = (task) => {
  if (!task) return null;
  let dependencies = [];
  let checklist = [];
  let comments = [];
  let attachments = [];
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
};

const parseTeamRow = (member) => {
  if (!member) return null;
  let skills = [];
  try { skills = JSON.parse(member.skills); } catch(e){}
  return {
    ...member,
    skills: Array.isArray(skills) ? skills : [],
  };
};

// Bootstrap Endpoint
app.get('/api/bootstrap', async (req, res) => {
  try {
    const rawTeam = await dbAll('SELECT * FROM team');
    const team = rawTeam.map(parseTeamRow);

    const projects = await dbAll('SELECT * FROM projects');
    const sprints = await dbAll('SELECT * FROM sprints');

    const rawTasks = await dbAll('SELECT * FROM tasks');
    const tasks = rawTasks.map(parseTaskRow);

    const logs = await dbAll('SELECT * FROM logs ORDER BY timestamp DESC');
    
    const rawNotifications = await dbAll('SELECT * FROM notifications ORDER BY timestamp DESC');
    const notifications = rawNotifications.map(n => ({
      ...n,
      read: n.read === 1
    }));

    res.json({ team, projects, sprints, tasks, logs, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects Endpoints
app.post('/api/projects', async (req, res) => {
  try {
    const { id, name, description, status, ownerId, startDate, deadline, priority, progress, category } = req.body;
    await dbRun(
      'INSERT INTO projects (id, name, description, status, ownerId, startDate, deadline, priority, progress, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id || null,
        name || null,
        description || '',
        status || 'planning',
        ownerId || null,
        startDate || '',
        deadline || '',
        priority || 'medium',
        progress || 0,
        category || ''
      ]
    );
    const newProj = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json(newProj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, ownerId, startDate, deadline, priority, progress, category } = req.body;
    await dbRun(
      'UPDATE projects SET name = ?, description = ?, status = ?, ownerId = ?, startDate = ?, deadline = ?, priority = ?, progress = ?, category = ? WHERE id = ?',
      [
        name || null,
        description || '',
        status || 'planning',
        ownerId || null,
        startDate || '',
        deadline || '',
        priority || 'medium',
        progress || 0,
        category || '',
        id
      ]
    );
    const updated = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM projects WHERE id = ?', [id]);
    await dbRun('DELETE FROM tasks WHERE projectId = ?', [id]); // Cascade delete tasks
    res.json({ success: true, message: `Project ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks Endpoints
app.post('/api/tasks', async (req, res) => {
  try {
    const { id, projectId, title, description, status, priority, assigneeId, dueDate, dependencies, checklist, comments, attachments, timeSpent, timeEstimate, sprintId } = req.body;
    await dbRun(
      'INSERT INTO tasks (id, projectId, title, description, status, priority, assigneeId, dueDate, dependencies, checklist, comments, attachments, timeSpent, timeEstimate, sprintId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id || null,
        projectId || null,
        title || null,
        description || '',
        status || 'todo',
        priority || 'medium',
        assigneeId || null,
        dueDate || '',
        JSON.stringify(dependencies || []),
        JSON.stringify(checklist || []),
        JSON.stringify(comments || []),
        JSON.stringify(attachments || []),
        timeSpent || 0,
        timeEstimate || 0,
        sprintId || null
      ]
    );
    const rawTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(parseTaskRow(rawTask));
  } catch (err) {
    console.error('[API ERROR] POST /api/tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, title, description, status, priority, assigneeId, dueDate, dependencies, checklist, comments, attachments, timeSpent, timeEstimate, sprintId } = req.body;
    
    await dbRun(
      'UPDATE tasks SET projectId = ?, title = ?, description = ?, status = ?, priority = ?, assigneeId = ?, dueDate = ?, dependencies = ?, checklist = ?, comments = ?, attachments = ?, timeSpent = ?, timeEstimate = ?, sprintId = ? WHERE id = ?',
      [
        projectId || null,
        title || null,
        description || '',
        status || 'todo',
        priority || 'medium',
        assigneeId || null,
        dueDate || '',
        JSON.stringify(dependencies || []),
        JSON.stringify(checklist || []),
        JSON.stringify(comments || []),
        JSON.stringify(attachments || []),
        timeSpent || 0,
        timeEstimate || 0,
        sprintId || null,
        id
      ]
    );
    const rawTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(parseTaskRow(rawTask));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: `Task ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logs Endpoints
app.post('/api/logs', async (req, res) => {
  try {
    const { id, timestamp, userId, userName, userAvatar, action, targetType, targetName } = req.body;
    await dbRun(
      'INSERT INTO logs (id, timestamp, userId, userName, userAvatar, action, targetType, targetName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, timestamp, userId, userName, userAvatar || '', action, targetType, targetName]
    );
    const newLog = await dbGet('SELECT * FROM logs WHERE id = ?', [id]);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications Endpoints
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    const updated = await dbGet('SELECT * FROM notifications WHERE id = ?', [id]);
    res.json({ ...updated, read: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/read-all', async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET read = 1');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    await dbRun('DELETE FROM notifications');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { id, timestamp, severity, title, message, read, type } = req.body;
    await dbRun(
      'INSERT INTO notifications (id, timestamp, severity, title, message, read, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, timestamp, severity, title, message, read ? 1 : 0, type]
    );
    const newNotif = await dbGet('SELECT * FROM notifications WHERE id = ?', [id]);
    res.status(201).json({ ...newNotif, read: newNotif.read === 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sprints Endpoints
app.post('/api/sprints', async (req, res) => {
  try {
    const { id, name, status, startDate, endDate, goal } = req.body;
    await dbRun(
      'INSERT INTO sprints (id, name, status, startDate, endDate, goal) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, status, startDate, endDate, goal]
    );
    const newSprint = await dbGet('SELECT * FROM sprints WHERE id = ?', [id]);
    res.status(201).json(newSprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 TechFlow Backend API server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
};

startServer();
