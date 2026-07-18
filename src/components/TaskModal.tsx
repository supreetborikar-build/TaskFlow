import React, { useState, useEffect } from 'react';
import { 
  X, CheckSquare, Clock, MessageSquare, Paperclip, 
  Link2, Play, Pause, Plus, Trash2, User, Calendar, 
  File
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { UserAvatar } from './UserAvatar';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { 
    tasks, projects, team, currentUserId,
    updateTask, addComment, addChecklistItem, 
    toggleChecklistItem, deleteChecklistItem, logTime, addAttachment,
    deleteTask
  } = useProjectStore();

  const task = tasks.find(t => t.id === taskId);
  const project = projects.find(p => p.id === task?.projectId);
  const assignee = team.find(t => t.id === task?.assigneeId);
  const otherTasks = tasks.filter(t => t.id !== taskId && t.projectId === task?.projectId);

  // Comments state
  const [commentText, setCommentText] = useState('');
  
  // Checklist state
  const [newChecklistText, setNewChecklistText] = useState('');

  // Time logging state
  const [logHours, setLogHours] = useState<number>(1);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Attachments state
  const [mockFileName, setMockFileName] = useState('');
  const mockFileSize = '1.5 MB';

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds > 0) {
      // Prompt user or automatically convert to hours?
      // Since timer is in seconds, let's keep it simple: 1 hour = 3600 seconds, but for demo, let's say 1 second = 1 minute, so 60 seconds = 1 hour.
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  if (!task) return null;

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      // Stopped: calculate hours (let's say 1 minute of timer = 1 hour of work for ease of testing)
      const hoursLogged = Math.max(0.1, Math.round((timerSeconds / 10) * 10) / 10);
      logTime(task.id, hoursLogged);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    } else {
      setIsTimerRunning(true);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(task.id, commentText, currentUserId);
    setCommentText('');
  };

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(task.id, newChecklistText);
    setNewChecklistText('');
  };

  const handleAddDependency = (depId: string) => {
    if (task.dependencies.includes(depId)) return;
    updateTask(task.id, { dependencies: [...task.dependencies, depId] });
  };

  const handleRemoveDependency = (depId: string) => {
    updateTask(task.id, { dependencies: task.dependencies.filter(id => id !== depId) });
  };

  const handleMockAttachmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFileName.trim()) return;
    addAttachment(task.id, mockFileName, mockFileSize, 'application/octet-stream');
    setMockFileName('');
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const checklistCompletedCount = task.checklist.filter(c => c.completed).length;
  const checklistProgress = task.checklist.length > 0 
    ? Math.round((checklistCompletedCount / task.checklist.length) * 100) 
    : 0;

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={onClose}>
      <div 
        className="bg-white dark:bg-dark-card w-full max-w-4xl max-h-[90vh] rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal flex flex-col overflow-hidden text-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary">
                {project?.name || 'Task Details'}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                task.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                task.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
              }`}>
                {task.priority} Priority
              </span>
            </div>
            <h2 className="text-base font-semibold mt-1 text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
              {task.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Description, Checklist, Attachments, Comments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
                Description
              </h3>
              <p className="text-enterprise-textPrimary dark:text-dark-textPrimary bg-slate-50 dark:bg-slate-900/20 p-4 rounded-lg border border-enterprise-border dark:border-dark-border leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare size={14} />
                  Checklist ({task.checklist.length})
                </h3>
                {task.checklist.length > 0 && (
                  <span className="text-xs font-semibold text-accent">
                    {checklistProgress}% complete
                  </span>
                )}
              </div>

              {task.checklist.length > 0 && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-accent h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  ></div>
                </div>
              )}

              <div className="space-y-2">
                {task.checklist.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-enterprise-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input 
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(task.id, item.id)}
                        className="rounded border-enterprise-border text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs truncate ${item.completed ? 'line-through text-enterprise-textMuted dark:text-dark-textMuted' : 'text-enterprise-textPrimary dark:text-dark-textPrimary font-medium'}`}>
                        {item.text}
                      </span>
                    </label>
                    <button 
                      onClick={() => deleteChecklistItem(task.id, item.id)}
                      className="p-1 hover:text-danger text-enterprise-textSecondary dark:text-dark-textSecondary transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddCheckItem} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Add item..."
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-dark-card"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-enterprise-textPrimary dark:text-dark-textPrimary text-xs font-semibold rounded border border-enterprise-border dark:border-dark-border flex items-center gap-1 shrink-0"
                >
                  <Plus size={12} />
                  Add
                </button>
              </form>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={14} />
                Attachments ({task.attachments.length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.attachments.map(att => (
                  <div 
                    key={att.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/20"
                  >
                    <File size={16} className="text-enterprise-textSecondary dark:text-dark-textSecondary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary">
                        {att.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleMockAttachmentSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Filename (e.g. schema.png)..."
                  value={mockFileName}
                  onChange={e => setMockFileName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 focus:bg-white"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-enterprise-textPrimary dark:text-dark-textPrimary text-xs font-semibold rounded border border-enterprise-border dark:border-dark-border flex items-center gap-1 shrink-0"
                >
                  Upload Mock
                </button>
              </form>
            </div>

            {/* Comments */}
            <div className="space-y-4 pt-2 border-t border-enterprise-border dark:border-dark-border">
              <h3 className="font-semibold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} />
                Activity Comments ({task.comments.length})
              </h3>

              <div className="space-y-3">
                {task.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <UserAvatar name={c.authorName} className="w-8 h-8" />
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900/30 border border-enterprise-border dark:border-dark-border p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary">
                          {c.authorName}
                        </span>
                        <span className="text-[10px] text-enterprise-textMuted dark:text-dark-textMuted">
                          {new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handlePostComment} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                  U
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 text-xs border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:bg-white"
                  />
                  <button 
                    type="submit"
                    className="self-end px-4 py-1.5 bg-accent hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors shadow-xs"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right 1 Column: Metadata side panel */}
          <div className="space-y-6 lg:border-l lg:border-enterprise-border lg:dark:border-dark-border lg:pl-6">
            
            {/* Owner & Date */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-enterprise-textSecondary dark:text-dark-textSecondary font-medium flex items-center gap-1.5">
                  <User size={14} /> Assignee
                </span>
                {assignee ? (
                  <div className="flex items-center gap-1.5 font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
                     <UserAvatar name={assignee.name} className="w-5 h-5 text-[7px]" />
                    {assignee.name}
                  </div>
                ) : (
                  <span className="text-enterprise-textMuted dark:text-dark-textMuted">Unassigned</span>
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-enterprise-textSecondary dark:text-dark-textSecondary font-medium flex items-center gap-1.5">
                  <Calendar size={14} /> Due Date
                </span>
                <span className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
                  {task.dueDate}
                </span>
              </div>
            </div>

            {/* Time Tracker */}
            <div className="bg-slate-50 dark:bg-slate-900/20 border border-enterprise-border dark:border-dark-border rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} />
                Time Tracking
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-semibold">
                    Spent
                  </p>
                  <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
                    {task.timeSpent}h
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-semibold">
                    Estimated
                  </p>
                  <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
                    {task.timeEstimate}h
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-enterprise-border dark:border-dark-border">
                {/* Active live timer widget */}
                <div className="flex items-center justify-between bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isTimerRunning ? 'bg-danger animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className="font-mono text-xs font-semibold">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                  <button
                    onClick={handleTimerToggle}
                    className={`p-1.5 rounded ${isTimerRunning ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-blue-50 hover:bg-blue-100 text-accent'} transition-colors`}
                  >
                    {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>
                {isTimerRunning && (
                  <p className="text-[9px] text-enterprise-textMuted dark:text-dark-textMuted text-center">
                    Timer logs 0.1h for every 10 seconds of active play when paused.
                  </p>
                )}

                {/* Log time manual form */}
                <div className="flex gap-2 mt-1">
                  <input 
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={logHours}
                    onChange={e => setLogHours(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs border border-enterprise-border dark:border-dark-border rounded bg-white text-center font-semibold"
                  />
                  <button
                    onClick={() => { logTime(task.id, logHours); }}
                    className="flex-1 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary border border-enterprise-border dark:border-dark-border rounded transition-colors"
                  >
                    Log Hours
                  </button>
                </div>
              </div>
            </div>

            {/* Task Dependencies */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                <Link2 size={14} />
                Dependencies ({task.dependencies.length})
              </h3>

              {task.dependencies.length > 0 && (
                <div className="space-y-1.5">
                  {task.dependencies.map(depId => {
                    const depTask = tasks.find(t => t.id === depId);
                    return (
                      <div 
                        key={depId}
                        className="flex items-center justify-between p-2 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/30 text-xs"
                      >
                        <span className="font-medium text-enterprise-textPrimary dark:text-dark-textPrimary truncate max-w-[150px]">
                          {depTask?.title || 'Unknown Task'}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] px-1 rounded uppercase font-semibold ${
                            depTask?.status === 'done' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {depTask?.status.replace('_', ' ')}
                          </span>
                          <button 
                            onClick={() => handleRemoveDependency(depId)}
                            className="text-enterprise-textMuted hover:text-danger"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {otherTasks.length > 0 && (
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) {
                      handleAddDependency(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full text-xs p-1.5 border border-enterprise-border dark:border-dark-border rounded bg-white dark:bg-dark-card"
                >
                  <option value="">+ Add Task Blocker...</option>
                  {otherTasks
                    .filter(t => !task.dependencies.includes(t.id))
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* Delete Task Button */}
            <div className="pt-4 border-t border-enterprise-border dark:border-dark-border mt-4">
              <button
                onClick={handleDeleteTask}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-danger border border-red-200 hover:border-red-300 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:border-red-900/30 dark:text-red-400 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                Delete Task
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default TaskModal;
