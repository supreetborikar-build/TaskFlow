import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FolderKanban, Plus, AlertTriangle, 
  Trash2, Edit, ChevronRight, X, Sparkles, AlertCircle, BarChart3
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { calculateProjectMetrics } from '../utils/aiEngine';
import type { Project } from '../utils/initialData';
import { UserAvatar } from '../components/UserAvatar';

export const Projects: React.FC = () => {
  const { 
    projects, tasks, team, addProject, updateProject, deleteProject, searchQuery 
  } = useProjectStore();

  const location = useLocation();

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Selected project for edit/detail/delete
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form fields state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Web App');
  const [formStatus, setFormStatus] = useState<Project['status']>('planning');
  const [formOwner, setFormOwner] = useState('team-1');
  const [formPriority, setFormPriority] = useState<Project['priority']>('medium');
  const [formStartDate, setFormStartDate] = useState('2026-07-16');
  const [formDeadline, setFormDeadline] = useState('2026-10-31');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check query params to open Quick Add modal automatically
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setAddModalOpen(true);
    }
  }, [location]);

  // Search filter
  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formName.trim()) newErrors.name = 'Project name is required';
    if (!formDescription.trim()) newErrors.description = 'Description is required';
    if (new Date(formStartDate) > new Date(formDeadline)) {
      newErrors.deadline = 'Deadline must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('Web App');
    setFormStatus('planning');
    setFormOwner('team-1');
    setFormPriority('medium');
    setFormStartDate('2026-07-16');
    setFormDeadline('2026-10-31');
    setErrors({});
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Project) => {
    setSelectedProject(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormCategory(p.category);
    setFormStatus(p.status);
    setFormOwner(p.ownerId);
    setFormPriority(p.priority);
    setFormStartDate(p.startDate);
    setFormDeadline(p.deadline);
    setErrors({});
    setEditModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    addProject({
      name: formName,
      description: formDescription,
      category: formCategory,
      status: formStatus,
      ownerId: formOwner,
      priority: formPriority,
      startDate: formStartDate,
      deadline: formDeadline,
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !validateForm()) return;
    updateProject(selectedProject.id, {
      name: formName,
      description: formDescription,
      category: formCategory,
      status: formStatus,
      ownerId: formOwner,
      priority: formPriority,
      startDate: formStartDate,
      deadline: formDeadline,
    });
    setEditModalOpen(false);
  };

  const handleDeleteTrigger = (p: Project) => {
    setSelectedProject(p);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      setDeleteConfirmOpen(false);
      setSelectedProject(null);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/20 text-danger border-red-100 dark:border-red-900/30';
      case 'high':
        return 'bg-amber-50 dark:bg-amber-950/20 text-warning border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-blue-50 dark:bg-blue-950/20 text-accent border-blue-100 dark:border-blue-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'active': return 'bg-blue-500 text-white';
      case 'testing': return 'bg-amber-500 text-white';
      case 'delayed': return 'bg-red-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Software Projects
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Manage repository targets, release timelines, and predictive risks.
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
        >
          <Plus size={14} />
          Create Project
        </button>
      </div>

      {/* Grid List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-12 text-center shadow-enterprise">
          <FolderKanban className="mx-auto text-enterprise-textMuted dark:text-dark-textMuted mb-4" size={40} />
          <h3 className="font-semibold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">No projects found</h3>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">Create a new project or adjust your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const owner = team.find(t => t.id === project.ownerId);
            const projTasks = tasks.filter(t => t.projectId === project.id);
            const doneTasksCount = projTasks.filter(t => t.status === 'done').length;
            
            // Calculate dynamic AI insights
            const aiMetrics = calculateProjectMetrics(project, tasks, team);

            return (
              <div 
                key={project.id}
                className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise hover:shadow-enterpriseHover hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* Category, Status & Priority */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {project.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${getPriorityStyle(project.priority)}`}>
                        {project.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Name and Description */}
                  <h3 className="text-base font-bold text-enterprise-textPrimary dark:text-dark-textPrimary mt-3">
                    {project.name}
                  </h3>
                  <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1.5 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 my-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-enterprise-textSecondary dark:text-dark-textSecondary font-semibold">
                      Sprint Progress
                    </span>
                    <span className="font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
                      {project.progress}% ({doneTasksCount}/{projTasks.length} tasks)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        project.progress === 100 ? 'bg-success' : 'bg-accent'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* AI prediction element */}
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-enterprise-border dark:border-dark-border p-3.5 rounded-lg mb-4 space-y-1 flex items-start gap-2.5">
                  <Sparkles size={14} className="text-purple-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary flex items-center gap-1.5">
                      AI Schedule Forecast
                      {aiMetrics.predictedDelayDays > 0 ? (
                        <span className="text-[9px] px-1 bg-red-100 text-danger dark:bg-red-950/20 font-bold rounded">
                          {aiMetrics.predictedDelayDays}d Delay Risk
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 bg-green-100 text-success dark:bg-green-950/20 font-bold rounded">
                          On Track
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary leading-normal mt-0.5">
                      Est. Completion: <span className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">{aiMetrics.estimatedCompletion}</span>
                    </p>
                    <p className="text-[9px] text-enterprise-textMuted dark:text-dark-textMuted italic mt-0.5 leading-normal">
                      {aiMetrics.aiRiskReason}
                    </p>
                  </div>
                </div>

                {/* Card Footer actions */}
                <div className="flex items-center justify-between border-t border-enterprise-border dark:border-dark-border pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={owner?.name} className="w-7 h-7 text-[8px]" />
                    <div className="text-left hidden sm:block">
                      <p className="text-[9px] text-enterprise-textSecondary dark:text-dark-textSecondary font-semibold">Owner</p>
                      <p className="text-[10px] text-enterprise-textPrimary dark:text-dark-textPrimary font-bold leading-none">{owner?.name.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 no-print">
                    <button
                      onClick={() => { setSelectedProject(project); setDetailModalOpen(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-enterprise-textPrimary dark:text-dark-textPrimary text-xs font-semibold rounded border border-enterprise-border dark:border-dark-border transition-colors"
                    >
                      Details
                      <ChevronRight size={12} />
                    </button>
                    
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary rounded transition-colors"
                      title="Edit project"
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTrigger(project)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-danger rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setAddModalOpen(false)}>
          <div 
            className="bg-white dark:bg-dark-card w-full max-w-lg rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal overflow-hidden text-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
              <h2 className="font-bold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">Create New Project</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Project Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Apollo Dashboard"
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
                {errors.name && <p className="text-[10px] text-danger font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Description</label>
                <textarea 
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Summarize project scope and targets..."
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
                {errors.description && <p className="text-[10px] text-danger font-semibold">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Category</label>
                  <select 
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="Web App">Web App</option>
                    <option value="Cloud Infra">Cloud Infra</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Security">Security</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Project Owner</label>
                  <select 
                    value={formOwner}
                    onChange={e => setFormOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    {team.map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.role.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Priority</label>
                  <select 
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as Project['priority'])}
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
                    onChange={e => setFormStatus(e.target.value as Project['status'])}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Start Date</label>
                  <input 
                    type="date" 
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Deadline</label>
                  <input 
                    type="date" 
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  />
                  {errors.deadline && <p className="text-[10px] text-danger font-semibold">{errors.deadline}</p>}
                </div>
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setEditModalOpen(false)}>
          <div 
            className="bg-white dark:bg-dark-card w-full max-w-lg rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal overflow-hidden text-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
              <h2 className="font-bold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">Edit Project Details</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Project Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                />
                {errors.name && <p className="text-[10px] text-danger font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Description</label>
                <textarea 
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                />
                {errors.description && <p className="text-[10px] text-danger font-semibold">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Category</label>
                  <select 
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="Web App">Web App</option>
                    <option value="Cloud Infra">Cloud Infra</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Security">Security</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Project Owner</label>
                  <select 
                    value={formOwner}
                    onChange={e => setFormOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    {team.map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.role.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Priority</label>
                  <select 
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as Project['priority'])}
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
                    onChange={e => setFormStatus(e.target.value as Project['status'])}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Start Date</label>
                  <input 
                    type="date" 
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Deadline</label>
                  <input 
                    type="date" 
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                  />
                  {errors.deadline && <p className="text-[10px] text-danger font-semibold">{errors.deadline}</p>}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-enterprise-border dark:border-dark-border mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-accent hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setDeleteConfirmOpen(false)}>
          <div 
            className="bg-white dark:bg-dark-card w-full max-w-sm rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal p-6 text-sm space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle size={24} />
              <h2 className="font-bold text-sm">Delete Project?</h2>
            </div>
            
            <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary leading-relaxed">
              Are you sure you want to delete project <span className="font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">"{selectedProject.name}"</span>? 
              This action cannot be undone and will delete all associated tasks, comments, and milestones.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 bg-danger hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors animate-pulse"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal Drawer */}
      {detailModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setDetailModalOpen(false)}>
          <div 
            className="bg-white dark:bg-dark-card w-full max-w-2xl max-h-[85vh] rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal flex flex-col overflow-hidden text-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {selectedProject.category} Detail View
                </span>
                <h2 className="font-bold text-base text-enterprise-textPrimary dark:text-dark-textPrimary mt-1">
                  {selectedProject.name}
                </h2>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary"><X size={18} /></button>
            </div>

            {/* Drawer Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">Project Summary</h4>
                <p className="text-xs text-enterprise-textPrimary dark:text-dark-textPrimary leading-relaxed bg-slate-50 dark:bg-slate-900/20 p-4 rounded-lg border border-enterprise-border dark:border-dark-border">
                  {selectedProject.description}
                </p>
              </div>

              {/* AI metrics cards */}
              {(() => {
                const aiMetrics = calculateProjectMetrics(selectedProject, tasks, team);
                const projTasks = tasks.filter(t => t.projectId === selectedProject.id);
                const statusCounts = {
                  done: projTasks.filter(t => t.status === 'done').length,
                  in_progress: projTasks.filter(t => t.status === 'in_progress').length,
                  todo: projTasks.filter(t => t.status === 'todo').length,
                  testing: projTasks.filter(t => t.status === 'testing').length,
                  backlog: projTasks.filter(t => t.status === 'backlog').length,
                };

                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Health Score */}
                      <div className="border border-enterprise-border dark:border-dark-border p-4 rounded-xl text-center bg-slate-50/50 dark:bg-slate-900/30">
                        <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Health Rating</p>
                        <p className={`text-2xl font-extrabold mt-1 ${
                          aiMetrics.healthScore > 80 ? 'text-success' : 
                          aiMetrics.healthScore > 60 ? 'text-warning' : 'text-danger'
                        }`}>
                          {aiMetrics.healthScore}%
                        </p>
                      </div>

                      {/* AI delay prediction */}
                      <div className="border border-enterprise-border dark:border-dark-border p-4 rounded-xl text-center bg-slate-50/50 dark:bg-slate-900/30">
                        <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Divergence Days</p>
                        <p className={`text-2xl font-extrabold mt-1 ${aiMetrics.predictedDelayDays > 0 ? 'text-danger' : 'text-success'}`}>
                          {aiMetrics.predictedDelayDays > 0 ? `+${aiMetrics.predictedDelayDays}d` : '0d'}
                        </p>
                      </div>

                      {/* Total scope */}
                      <div className="border border-enterprise-border dark:border-dark-border p-4 rounded-xl text-center bg-slate-50/50 dark:bg-slate-900/30">
                        <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Total Tickets</p>
                        <p className="text-2xl font-extrabold mt-1 text-enterprise-textPrimary dark:text-dark-textPrimary">
                          {projTasks.length}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1">
                        <BarChart3 size={13} />
                        Workflow Ticket Allocations
                      </h4>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/20">
                          <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Backlog</p>
                          <p className="font-bold mt-0.5">{statusCounts.backlog}</p>
                        </div>
                        <div className="p-2 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/20">
                          <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Todo</p>
                          <p className="font-bold mt-0.5">{statusCounts.todo}</p>
                        </div>
                        <div className="p-2 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/20">
                          <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Active</p>
                          <p className="font-bold mt-0.5">{statusCounts.in_progress}</p>
                        </div>
                        <div className="p-2 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/20">
                          <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">QA</p>
                          <p className="font-bold mt-0.5">{statusCounts.testing}</p>
                        </div>
                        <div className="p-2 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/20">
                          <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Done</p>
                          <p className="font-bold mt-0.5 text-success">{statusCounts.done}</p>
                        </div>
                      </div>
                    </div>

                    {/* Active Blocker List specific to this project */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5 text-danger">
                        <AlertCircle size={13} />
                        Active Scheduling Bottlenecks
                      </h4>
                      {projTasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date('2026-07-16')).length === 0 ? (
                        <p className="text-xs text-enterprise-textMuted dark:text-dark-textMuted italic bg-slate-50 dark:bg-slate-900/10 p-3 rounded border border-enterprise-border dark:border-dark-border">
                          No active overdue tasks blocking this release.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {projTasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date('2026-07-16')).map(task => (
                            <div key={task.id} className="p-2.5 border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 rounded flex items-center justify-between text-xs text-danger font-medium">
                              <span>"{task.title}"</span>
                              <span className="text-[10px] font-bold">Overdue since {task.dueDate}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

            </div>
            
            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex justify-end">
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Projects;
