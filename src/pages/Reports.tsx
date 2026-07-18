import React, { useState } from 'react';
import { Printer, Download, FolderKanban, Layers } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { calculateProjectMetrics } from '../utils/aiEngine';

export const Reports: React.FC = () => {
  const { projects, tasks, team, sprints } = useProjectStore();
  const [reportProjectId, setReportProjectId] = useState<string>('all');
  const [reportSprintId, setReportSprintId] = useState<string>('all');

  const filteredTasks = tasks.filter(t => {
    const projMatch = reportProjectId === 'all' || t.projectId === reportProjectId;
    const sprintMatch = reportSprintId === 'all' || t.sprintId === reportSprintId;
    return projMatch && sprintMatch;
  });

  const activeProjects = projects.filter(p => reportProjectId === 'all' ? true : p.id === reportProjectId);

  // Functional CSV export
  const handleExportCSV = () => {
    const headers = ['Task Title', 'Project', 'Status', 'Priority', 'Assignee', 'Due Date', 'Est Hours', 'Hours Spent'];
    const rows = filteredTasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId)?.name || 'Unknown';
      const assign = team.find(member => member.id === t.assigneeId)?.name || 'Unassigned';
      return [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${proj}"`,
        t.status,
        t.priority,
        `"${assign}"`,
        t.dueDate,
        t.timeEstimate,
        t.timeSpent
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `antigravity_pm_report_${reportProjectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Compliance & Status Reports
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Configure reporting filters, export raw CSV telemetry, or print custom summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-enterprise-textPrimary dark:text-dark-textPrimary rounded-lg text-xs font-semibold border border-enterprise-border dark:border-dark-border transition-colors duration-150"
          >
            <Download size={13} />
            Export CSV
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
          >
            <Printer size={13} />
            Printable Report
          </button>
        </div>
      </div>

      {/* Filter Parameters Banner */}
      <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise flex flex-wrap gap-4 items-center no-print">
        <div className="flex items-center gap-2 text-xs font-bold text-enterprise-textSecondary dark:text-dark-textSecondary">
          Report Parameters:
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Project selector */}
          <div className="flex items-center gap-2">
            <FolderKanban size={13} className="text-enterprise-textSecondary dark:text-dark-textSecondary" />
            <select
              value={reportProjectId}
              onChange={e => setReportProjectId(e.target.value)}
              className="px-2.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 text-xs font-medium"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Sprint selector */}
          <div className="flex items-center gap-2">
            <Layers size={13} className="text-enterprise-textSecondary dark:text-dark-textSecondary" />
            <select
              value={reportSprintId}
              onChange={e => setReportSprintId(e.target.value)}
              className="px-2.5 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-slate-50 dark:bg-slate-900/50 text-xs font-medium"
            >
              <option value="all">All Sprints</option>
              {sprints.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PRINT-OPTIMIZED REPORT LAYOUT */}
      <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-8 shadow-enterprise space-y-6 card">
        
        {/* Report Header (always visible in print) */}
        <div className="border-b border-enterprise-border dark:border-dark-border pb-6 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
              Workspace Performance Audit
            </h2>
            <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary">
              Generated: July 16, 2026 | TechFlow Automated Telemetry
            </p>
          </div>
          
          <div className="text-right text-xs text-enterprise-textSecondary dark:text-dark-textSecondary">
            <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">Enterprise Default Co.</p>
            <p>Scope: {reportProjectId === 'all' ? 'Full Workspace' : projects.find(p => p.id === reportProjectId)?.name}</p>
          </div>
        </div>

        {/* Dynamic Project Health Summary Matrix */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
            1. Project Health Matrix
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeProjects.map(project => {
              const aiMetrics = calculateProjectMetrics(project, tasks, team);
              return (
                <div key={project.id} className="border border-enterprise-border dark:border-dark-border p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/10 space-y-2 card">
                  <span className="text-[10px] font-bold text-enterprise-textSecondary dark:text-dark-textSecondary block truncate">
                    {project.name}
                  </span>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold">Health Score:</span>
                    <span className={`text-sm font-bold ${
                      aiMetrics.healthScore > 80 ? 'text-success' : 
                      aiMetrics.healthScore > 60 ? 'text-warning' : 'text-danger'
                    }`}>
                      {aiMetrics.healthScore}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary">
                    <span>Forecast:</span>
                    <span className="font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
                      {aiMetrics.estimatedCompletion}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic task allocation statistics */}
        <div className="space-y-3 pt-4 border-t border-enterprise-border dark:border-dark-border">
          <h3 className="font-bold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
            2. Scope Task Metrics
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 border border-enterprise-border dark:border-dark-border rounded bg-slate-50/20">
              <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Total Target Tickets</p>
              <p className="text-lg font-bold mt-1 text-enterprise-textPrimary dark:text-dark-textPrimary">{filteredTasks.length}</p>
            </div>
            <div className="p-3 border border-enterprise-border dark:border-dark-border rounded bg-slate-50/20">
              <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Completed</p>
              <p className="text-lg font-bold mt-1 text-success">{filteredTasks.filter(t => t.status === 'done').length}</p>
            </div>
            <div className="p-3 border border-enterprise-border dark:border-dark-border rounded bg-slate-50/20">
              <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Active Development</p>
              <p className="text-lg font-bold mt-1 text-amber-500">{filteredTasks.filter(t => t.status === 'in_progress').length}</p>
            </div>
            <div className="p-3 border border-enterprise-border dark:border-dark-border rounded bg-slate-50/20">
              <p className="text-[9px] text-enterprise-textMuted uppercase font-bold">Under QA Testing</p>
              <p className="text-lg font-bold mt-1 text-purple-600">{filteredTasks.filter(t => t.status === 'testing').length}</p>
            </div>
          </div>
        </div>

        {/* Detailed Task list audit table */}
        <div className="space-y-3 pt-4 border-t border-enterprise-border dark:border-dark-border">
          <h3 className="font-bold text-xs text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
            3. Detailed Ticket Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-enterprise-border dark:border-dark-border">
                  <th className="text-left font-semibold p-2.5">Task Title</th>
                  <th className="text-left font-semibold p-2.5">Project</th>
                  <th className="text-left font-semibold p-2.5">Assignee</th>
                  <th className="text-left font-semibold p-2.5">Due Date</th>
                  <th className="text-left font-semibold p-2.5">Priority</th>
                  <th className="text-left font-semibold p-2.5">Status</th>
                  <th className="text-right font-semibold p-2.5">Est/Log (H)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-enterprise-border dark:divide-dark-border">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-enterprise-textMuted dark:text-dark-textMuted italic">
                      No tasks found matching report parameters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(t => {
                    const proj = projects.find(p => p.id === t.projectId)?.name || 'Unknown';
                    const assignee = team.find(member => member.id === t.assigneeId)?.name || 'Unassigned';
                    return (
                      <tr key={t.id}>
                        <td className="p-2.5 font-medium text-enterprise-textPrimary dark:text-dark-textPrimary">{t.title}</td>
                        <td className="p-2.5 text-enterprise-textSecondary dark:text-dark-textSecondary">{proj}</td>
                        <td className="p-2.5 text-enterprise-textSecondary dark:text-dark-textSecondary">{assignee}</td>
                        <td className="p-2.5 text-enterprise-textSecondary dark:text-dark-textSecondary">{t.dueDate}</td>
                        <td className="p-2.5 capitalize">{t.priority}</td>
                        <td className="p-2.5 uppercase font-bold text-[9px]">{t.status.replace('_', ' ')}</td>
                        <td className="p-2.5 text-right font-semibold">{t.timeEstimate}h / {t.timeSpent}h</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Reports;
