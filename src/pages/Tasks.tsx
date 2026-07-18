import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, List, Grid, Filter, 
  ArrowUpDown, Trash2, X, Eye
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import type { Task } from '../utils/initialData';
import { TaskModal } from '../components/TaskModal';
import { UserAvatar } from '../components/UserAvatar';

type ColumnStatus = Task['status'];
const columns: { title: string; status: ColumnStatus; color: string }[] = [
  { title: 'Backlog', status: 'backlog', color: 'border-t-slate-400 bg-slate-500/5' },
  { title: 'To Do', status: 'todo', color: 'border-t-blue-400 bg-blue-500/5' },
  { title: 'In Progress', status: 'in_progress', color: 'border-t-amber-400 bg-amber-500/5' },
  { title: 'Testing / QA', status: 'testing', color: 'border-t-purple-400 bg-purple-500/5' },
  { title: 'Completed', status: 'done', color: 'border-t-green-400 bg-green-500/5' },
];

export const Tasks: React.FC = () => {
  const { 
    tasks, projects, team, addTask, deleteTask, 
    moveTaskStatus, bulkUpdateTasks, searchQuery,
    selectedProjectId, setSelectedProjectId,
    selectedPriority, setSelectedPriority,
    selectedAssignee, setSelectedAssignee
  } = useProjectStore();

  const location = useLocation();

  // Layout View mode: kanban or list
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Detail Modal & Add Modal
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Bulk selection for list view
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'title' | 'dueDate' | 'priority' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formPriority, setFormPriority] = useState<Task['priority']>('medium');
  const [formStatus, setFormStatus] = useState<Task['status']>('todo');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formDueDate, setFormDueDate] = useState('2026-07-20');
  const [formEstimate, setFormEstimate] = useState<number>(4);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check URL query parameters to auto-trigger Add modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      if (projects.length > 0) {
        setFormProjectId(projects[0].id);
      }
      if (team.length > 0) {
        setFormAssigneeId(team[0].id);
      }
      setAddModalOpen(true);
    }
  }, [location, projects, team]);

  // Keep select form fields synchronized with loaded data if they are empty
  useEffect(() => {
    if (!formProjectId && projects.length > 0) {
      setFormProjectId(projects[0].id);
    }
    if (!formAssigneeId && team.length > 0) {
      setFormAssigneeId(team[0].id);
    }
  }, [projects, team, formProjectId, formAssigneeId]);

  // Filters logic
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(query) || 
                          task.description.toLowerCase().includes(query);
    
    // Project filter
    const matchesProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
    
    // Priority filter
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    // Assignee filter
    const matchesAssignee = selectedAssignee === 'all' || task.assigneeId === selectedAssignee;

    return matchesSearch && matchesProject && matchesPriority && matchesAssignee;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === 'priority') {
      const pWeights = { critical: 4, high: 3, medium: 2, low: 1 };
      const weightA = pWeights[a.priority] || 0;
      const weightB = pWeights[b.priority] || 0;
      return sortOrder === 'asc' ? weightA - weightB : weightB - weightA;
    }

    const valA = a[sortField];
    const valB = b[sortField];

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedTasks = sortedTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formTitle.trim()) newErrors.title = 'Title is required';
    if (!formProjectId) newErrors.project = 'Project association is required';
    if (!formAssigneeId) newErrors.assignee = 'Assignee is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormProjectId(projects[0]?.id || '');
    setFormPriority('medium');
    setFormStatus('todo');
    setFormAssigneeId(team[0]?.id || '');
    setFormDueDate('2026-07-20');
    setFormEstimate(4);
    setErrors({});
    setAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    addTask({
      projectId: formProjectId,
      title: formTitle,
      description: formDescription,
      status: formStatus,
      priority: formPriority,
      assigneeId: formAssigneeId,
      dueDate: formDueDate,
      dependencies: [],
      checklist: [],
      timeEstimate: formEstimate,
    });
    setAddModalOpen(false);
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ColumnStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      moveTaskStatus(id, targetStatus);
    }
  };

  // Bulk actions handlers
  const handleSelectTask = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllTasks = () => {
    if (selectedTaskIds.length === paginatedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(paginatedTasks.map(t => t.id));
    }
  };

  const handleBulkStatusChange = (status: ColumnStatus) => {
    if (selectedTaskIds.length === 0) return;
    bulkUpdateTasks(selectedTaskIds, { status });
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    if (window.confirm(`Delete ${selectedTaskIds.length} tasks?`)) {
      selectedTaskIds.forEach(id => deleteTask(id));
      setSelectedTaskIds([]);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-danger dark:bg-red-950/20';
      case 'high': return 'bg-amber-50 text-warning dark:bg-amber-950/20';
      default: return 'bg-blue-50 text-accent dark:bg-blue-950/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Sprint Tasks
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Move cards across swimlanes or query tasks in dynamic table structures.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View switcher */}
          <div className="flex border border-enterprise-border dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-card p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-all ${viewMode === 'kanban' ? 'bg-slate-100 dark:bg-slate-800 text-enterprise-textPrimary dark:text-dark-textPrimary font-semibold' : 'text-enterprise-textSecondary dark:text-dark-textSecondary'}`}
              title="Kanban Board View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-enterprise-textPrimary dark:text-dark-textPrimary font-semibold' : 'text-enterprise-textSecondary dark:text-dark-textSecondary'}`}
              title="Table List View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
          >
            <Plus size={14} />
            Create Task
          </button>
        </div>
      </div>

      {/* Filter Banners */}
      <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-4 shadow-enterprise flex flex-wrap gap-4 items-center justify-between no-print">
        <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-enterprise-textSecondary dark:text-dark-textSecondary mr-1">
            <Filter size={14} />
            Filters:
          </div>

          {/* Project filter selector */}
          <select 
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 text-xs font-medium"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Assignee filter selector */}
          <select 
            value={selectedAssignee}
            onChange={e => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 text-xs font-medium"
          >
            <option value="all">All Assignees</option>
            {team.map(m => (
              <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
            ))}
          </select>

          {/* Priority filter selector */}
          <select 
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 text-xs font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Clear Filters indicator */}
        {(selectedProjectId !== 'all' || selectedAssignee !== 'all' || selectedPriority !== 'all') && (
          <button
            onClick={() => {
              setSelectedProjectId('all');
              setSelectedAssignee('all');
              setSelectedPriority('all');
            }}
            className="text-xs text-accent hover:underline font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content Layout Container */}
      {viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);

            return (
              <div 
                key={col.status}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, col.status)}
                className={`rounded-xl border border-enterprise-border dark:border-dark-border border-t-4 ${col.color} p-4 flex flex-col min-h-[500px] max-h-[80vh] overflow-y-auto`}
              >
                <div className="flex items-center justify-between mb-4 border-b border-enterprise-border/50 dark:border-dark-border/50 pb-2">
                  <h3 className="font-bold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-enterprise-textSecondary dark:text-dark-textSecondary">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.map((task) => {
                    const assignee = team.find(t => t.id === task.assigneeId);
                    const proj = projects.find(p => p.id === task.projectId);
                    
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-lg p-3.5 shadow-enterprise hover:shadow-enterpriseHover hover:border-slate-300 dark:hover:border-slate-700 cursor-grab active:cursor-grabbing transition-all space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-bold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={proj?.name}>
                            {proj?.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1 rounded uppercase shrink-0 ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-enterprise-textPrimary dark:text-dark-textPrimary leading-snug line-clamp-2">
                          {task.title}
                        </h4>

                        <div className="flex justify-between items-center pt-2.5 border-t border-enterprise-border dark:border-dark-border text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary">
                          <span className="font-medium">
                            Due {task.dueDate}
                          </span>
                          <UserAvatar name={assignee?.name} className="w-5.5 h-5.5 text-[7px]" />
                        </div>
                      </div>
                    );
                  })}
                  
                  {colTasks.length === 0 && (
                    <div className="h-full border border-dashed border-enterprise-border dark:border-dark-border rounded-lg flex items-center justify-center py-10 text-xs text-enterprise-textMuted dark:text-dark-textMuted italic bg-slate-50/10">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Table with Sorting, Pagination, Search) */
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl shadow-enterprise overflow-hidden no-print">
          
          {/* Bulk actions banner */}
          {selectedTaskIds.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-enterprise-border dark:border-dark-border px-6 py-3 flex items-center justify-between text-xs">
              <div className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
                {selectedTaskIds.length} tasks selected
              </div>
              <div className="flex items-center gap-2">
                <select 
                  onChange={e => handleBulkStatusChange(e.target.value as ColumnStatus)}
                  defaultValue=""
                  className="px-2.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-white text-xs font-medium"
                >
                  <option value="" disabled>Move Status to...</option>
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="testing">Testing / QA</option>
                  <option value="done">Completed</option>
                </select>

                <button
                  onClick={handleBulkDelete}
                  className="p-1.5 hover:bg-slate-100 hover:text-danger rounded border border-enterprise-border dark:border-dark-border bg-white text-enterprise-textSecondary transition-colors"
                  title="Delete selected tasks"
                >
                  <Trash2 size={14} />
                </button>

                <button 
                  onClick={() => setSelectedTaskIds([])}
                  className="text-enterprise-textMuted hover:text-enterprise-textPrimary"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="table-header w-12 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedTaskIds.length === paginatedTasks.length && paginatedTasks.length > 0}
                      onChange={handleSelectAllTasks}
                      className="rounded text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="table-header cursor-pointer" onClick={() => handleSort('title')}>
                    <span className="flex items-center gap-1">Task Title <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="table-header">Project</th>
                  <th className="table-header cursor-pointer" onClick={() => handleSort('dueDate')}>
                    <span className="flex items-center gap-1">Due Date <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="table-header cursor-pointer" onClick={() => handleSort('priority')}>
                    <span className="flex items-center gap-1">Priority <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="table-header cursor-pointer" onClick={() => handleSort('status')}>
                    <span className="flex items-center gap-1">Status <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="table-header">Assignee</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-enterprise-border dark:divide-dark-border">
                {paginatedTasks.map((task) => {
                  const isChecked = selectedTaskIds.includes(task.id);
                  const project = projects.find(p => p.id === task.projectId);
                  const assignee = team.find(t => t.id === task.assigneeId);

                  return (
                    <tr key={task.id} className="table-row">
                      <td className="table-cell text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectTask(task.id)}
                          className="rounded text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="table-cell font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
                        <button 
                          onClick={() => setSelectedTaskId(task.id)}
                          className="hover:underline text-left max-w-sm truncate block"
                        >
                          {task.title}
                        </button>
                      </td>
                      <td className="table-cell text-xs">{project?.name || 'Unknown'}</td>
                      <td className="table-cell text-xs">{task.dueDate}</td>
                      <td className="table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          task.status === 'done' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          task.status === 'testing' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={assignee?.name} className="w-5 h-5 text-[6px]" />
                          <span className="text-xs">{assignee?.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary rounded"
                            title="Inspect Task"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this task?')) {
                                deleteTask(task.id);
                              }
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-danger rounded"
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-enterprise-border dark:border-dark-border flex items-center justify-between text-xs">
              <span className="text-enterprise-textSecondary dark:text-dark-textSecondary font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTasks.length)} of {sortedTasks.length} tasks
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Task Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setAddModalOpen(false)}>
          <div 
            className="bg-white dark:bg-dark-card w-full max-w-lg rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal overflow-hidden text-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
              <h2 className="font-bold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">Create New Sprint Task</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Task Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Write integration test suites"
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
                {errors.title && <p className="text-[10px] text-danger font-semibold">{errors.title}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Description</label>
                <textarea 
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Describe acceptance criteria or technical tasks..."
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Project</label>
                  <select 
                    value={formProjectId}
                    onChange={e => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Assignee</label>
                  <select 
                    value={formAssigneeId}
                    onChange={e => setFormAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    {team.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Priority</label>
                  <select 
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as Task['priority'])}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Status</label>
                  <select 
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as Task['status'])}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Est. (Hrs)</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={formEstimate}
                    onChange={e => setFormEstimate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs text-center"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Due Date</label>
                <input 
                  type="date" 
                  value={formDueDate}
                  onChange={e => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-enterprise-border dark:border-dark-border mt-4">
                <button 
                  type="button" 
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-accent hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task detail overlay */}
      {selectedTaskId && (
        <TaskModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
};
export default Tasks;
