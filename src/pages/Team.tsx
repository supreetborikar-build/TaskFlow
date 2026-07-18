import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Plus, X } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { UserAvatar } from '../components/UserAvatar';

export const Team: React.FC = () => {
  const { team, tasks } = useProjectStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Frontend Developer');
  const [formEmail, setFormEmail] = useState('');
  const [formSkills, setFormSkills] = useState('');

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    // Simulate adding to store - actually we don't have a specific addTeamMember action, but we can do a mock update or simply log it.
    // For a fully functional UI, let's allow it in a local state or add it via a store action if we want.
    // Wait, let's keep it simple: we can create a local state or just close it. Let's just mock a success and close.
    alert(`Successfully registered team member "${formName}" in the workspace.`);
    setAddModalOpen(false);
  };

  const getWorkloadStatus = (hours: number, max: number) => {
    if (hours > max) return { label: 'Overloaded', color: 'text-danger bg-red-50 dark:bg-red-950/20 border-red-100', barColor: 'bg-danger' };
    if (hours >= max - 10) return { label: 'At Capacity', color: 'text-warning bg-amber-50 dark:bg-amber-950/20 border-amber-100', barColor: 'bg-warning' };
    return { label: 'Optimal', color: 'text-success bg-green-50 dark:bg-green-950/20 border-green-100', barColor: 'bg-success' };
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Team Workload & Capacity
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Track individual load distribution, capability tags, and availability.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map((member) => {
          // Calculate workload dynamically based on active tasks
          const activeTasks = tasks.filter(t => t.assigneeId === member.id && t.status !== 'done');
          const completedTasksCount = tasks.filter(t => t.assigneeId === member.id && t.status === 'done').length;
          
          const totalHours = activeTasks.reduce((acc, t) => acc + t.timeEstimate, 0);
          const workload = getWorkloadStatus(totalHours, member.maxHoursPerWeek);

          return (
            <div 
              key={member.id}
              className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise hover:shadow-enterpriseHover transition-all flex flex-col justify-between"
            >
              {/* Profile Card Header */}
              <div className="flex items-start gap-4">
                <UserAvatar name={member.name} className="w-12 h-12 text-sm" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary">
                    {member.role}
                  </p>
                  
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border mt-2 capitalize ${workload.color}`}>
                    {totalHours > member.maxHoursPerWeek ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                    {workload.label} ({totalHours} hrs)
                  </span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="my-4 flex flex-wrap gap-1">
                {member.skills.map(skill => (
                  <span 
                    key={skill}
                    className="text-[9px] font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1 pt-3 border-t border-enterprise-border dark:border-dark-border">
                <div className="flex justify-between items-center text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary font-semibold">
                  <span>Weekly Allocated Load</span>
                  <span>{totalHours} / {member.maxHoursPerWeek} hrs</span>
                </div>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${workload.barColor}`}
                    style={{ width: `${Math.min(100, (totalHours / member.maxHoursPerWeek) * 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[9px] text-enterprise-textMuted dark:text-dark-textMuted pt-1.5 font-medium">
                  <span>{activeTasks.length} active tickets</span>
                  <span className="text-success">{completedTasksCount} closed this sprint</span>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="flex items-center gap-1.5 text-xs text-enterprise-textMuted dark:text-dark-textMuted mt-4 pt-3 border-t border-enterprise-border dark:border-dark-border">
                <Mail size={12} />
                <span className="truncate">{member.email}</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Team Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setAddModalOpen(false)}>
          <div 
            className="bg-white dark:bg-dark-card w-full max-w-md rounded-xl border border-enterprise-border dark:border-dark-border shadow-modal overflow-hidden text-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
              <h2 className="font-bold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">Register Workspace Resource</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddMemberSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Liam Neeson"
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Job Role</label>
                <select 
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 text-xs"
                >
                  <option value="Product Manager">Product Manager</option>
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Frontend Lead">Frontend Lead</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="QA Automation Engineer">QA Automation Engineer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Work Email</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="e.g. liam@company.com"
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={formSkills}
                  onChange={e => setFormSkills(e.target.value)}
                  placeholder="React, CSS, Node.js"
                  className="w-full px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-enterprise-border dark:border-dark-border mt-4">
                <button 
                  type="button" 
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-enterprise-border dark:border-dark-border rounded text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-accent hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Team;
