import type { Project, Task, TeamMember, Sprint } from './initialData';

export interface AIRiskAlert {
  id: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  severity: 'high' | 'medium' | 'low';
  type: 'deadline' | 'workload' | 'dependency' | 'scope_creep';
  message: string;
  recommendation: string;
}

export interface ResourceRecommendation {
  id: string;
  taskTitle: string;
  taskId: string;
  projectId: string;
  projectName: string;
  overloadedMemberName: string;
  overloadedMemberId: string;
  suggestedMemberName: string;
  suggestedMemberId: string;
  reason: string;
}

export interface AIProjectMetrics {
  healthScore: number;
  aiRiskLevel: 'low' | 'medium' | 'high';
  aiRiskReason: string;
  estimatedCompletion: string;
  predictedDelayDays: number;
}

export interface SprintAnalytics {
  healthStatus: 'healthy' | 'at_risk' | 'critical';
  burnDownData: { day: string; ideal: number; actual: number }[];
  completionPrediction: string;
}

/**
 * Calculates Project Health and AI Predictions dynamically
 */
export function calculateProjectMetrics(
  project: Project,
  tasks: Task[],
  _team: TeamMember[]
): AIProjectMetrics {
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  if (projectTasks.length === 0) {
    return {
      healthScore: 100,
      aiRiskLevel: 'low',
      aiRiskReason: 'No active tasks to assess.',
      estimatedCompletion: project.deadline,
      predictedDelayDays: 0,
    };
  }

  const doneTasks = projectTasks.filter(t => t.status === 'done');
  const activeTasks = projectTasks.filter(t => t.status !== 'done');
  const overdueTasks = activeTasks.filter(t => new Date(t.dueDate) < new Date('2026-07-16') && t.status !== 'done');
  const criticalTasks = activeTasks.filter(t => t.priority === 'critical');
  const highTasks = activeTasks.filter(t => t.priority === 'high');

  // Calculate base health
  // Overdue task deducts 15 points
  // Critical task in backlog/todo deducts 10 points
  // High task in backlog/todo deducts 5 points
  let score = 100;
  score -= overdueTasks.length * 15;
  score -= criticalTasks.filter(t => t.status === 'todo' || t.status === 'backlog').length * 10;
  score -= highTasks.filter(t => t.status === 'todo' || t.status === 'backlog').length * 5;

  // Bound score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let riskReason = 'Project is progressing on track.';

  if (score < 50) {
    riskLevel = 'high';
    riskReason = `${overdueTasks.length} overdue tasks and ${criticalTasks.length} critical issues blocking progress.`;
  } else if (score < 80) {
    riskLevel = 'medium';
    riskReason = `${overdueTasks.length ? overdueTasks.length + ' overdue tasks. ' : ''}Monitor workload allocations.`;
  }

  // Predict Delay Days and Estimated Completion
  // Simple heuristic: calculate progress speed.
  const timeElapsed = new Date('2026-07-16').getTime() - new Date(project.startDate).getTime();
  const totalDuration = new Date(project.deadline).getTime() - new Date(project.startDate).getTime();

  let predictedDelayDays = 0;
  let estimatedCompletion = project.deadline;

  if (doneTasks.length < projectTasks.length) {
    const progressRate = project.progress / 100; // e.g. 0.68
    const timeSpentDays = timeElapsed / (1000 * 60 * 60 * 24);
    
    if (progressRate > 0 && timeSpentDays > 0) {
      const estimatedTotalDays = timeSpentDays / progressRate;
      const originalDurationDays = totalDuration / (1000 * 60 * 60 * 24);
      
      if (estimatedTotalDays > originalDurationDays) {
        predictedDelayDays = Math.round(estimatedTotalDays - originalDurationDays);
        
        // Calculate new completion date
        const compDate = new Date(project.startDate);
        compDate.setDate(compDate.getDate() + Math.round(estimatedTotalDays));
        estimatedCompletion = compDate.toISOString().split('T')[0];
      }
    }
  }

  // If there are overdue tasks but no delay computed, simulate 3-5 days buffer delay
  if (overdueTasks.length > 0 && predictedDelayDays === 0) {
    predictedDelayDays = overdueTasks.length * 2;
    const compDate = new Date(project.deadline);
    compDate.setDate(compDate.getDate() + predictedDelayDays);
    estimatedCompletion = compDate.toISOString().split('T')[0];
  }

  return {
    healthScore: score,
    aiRiskLevel: riskLevel,
    aiRiskReason: riskReason,
    estimatedCompletion,
    predictedDelayDays,
  };
}

/**
 * Scan all projects, tasks and team members to find risks and bottleneck alerts
 */
export function generateRiskAlerts(
  projects: Project[],
  tasks: Task[],
  team: TeamMember[],
  sprints: Sprint[]
): AIRiskAlert[] {
  const alerts: AIRiskAlert[] = [];
  const currentDate = new Date('2026-07-16');

  // 1. Task Overdue Risks
  const activeTasks = tasks.filter(t => t.status !== 'done');
  activeTasks.forEach(task => {
    const dueDate = new Date(task.dueDate);
    if (dueDate < currentDate) {
      const proj = projects.find(p => p.id === task.projectId);
      alerts.push({
        id: `alert-overdue-${task.id}`,
        projectId: task.projectId,
        projectName: proj?.name || 'Unknown',
        taskId: task.id,
        taskTitle: task.title,
        severity: task.priority === 'critical' || task.priority === 'high' ? 'high' : 'medium',
        type: 'deadline',
        message: `Task "${task.title}" is overdue (due date: ${task.dueDate}).`,
        recommendation: `Reassign to a backend resource or extend task timeline if scope permits.`,
      });
    }
  });

  // 2. Resource Over-allocation Risks
  const activeSprint = sprints.find(s => s.status === 'active');
  if (activeSprint) {
    team.forEach(member => {
      // Find active sprint tasks assigned to this user
      const sprintTasks = tasks.filter(
        t => t.assigneeId === member.id && 
             t.status !== 'done' && 
             t.sprintId === activeSprint.id
      );
      
      const totalLoad = sprintTasks.reduce((acc, t) => acc + t.timeEstimate, 0);
      if (totalLoad > member.maxHoursPerWeek) {
        alerts.push({
          id: `alert-overload-${member.id}`,
          severity: 'high',
          type: 'workload',
          message: `Team member ${member.name} is over-allocated in the current sprint (${totalLoad} hrs / ${member.maxHoursPerWeek} hrs max).`,
          recommendation: `Reallocate secondary tasks like "${sprintTasks[sprintTasks.length - 1]?.title || 'testing'}" to an underloaded developer.`,
        });
      }
    });
  }

  // 3. Overdue Dependency Risks
  activeTasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask && depTask.status !== 'done') {
          const isDepOverdue = new Date(depTask.dueDate) < currentDate;
          if (isDepOverdue) {
            alerts.push({
              id: `alert-dep-${task.id}-${depId}`,
              projectId: task.projectId,
              projectName: projects.find(p => p.id === task.projectId)?.name || 'Unknown',
              taskId: task.id,
              taskTitle: task.title,
              severity: task.priority === 'critical' ? 'high' : 'medium',
              type: 'dependency',
              message: `Task "${task.title}" is blocked by overdue dependency "${depTask.title}" (due ${depTask.dueDate}).`,
              recommendation: `Expedite the blocking task "${depTask.title}" or update dependency constraints.`,
            });
          }
        }
      });
    }
  });

  // 4. Scope Creep Risk (Projects with lots of tasks and low velocity)
  projects.forEach(proj => {
    const projTasks = tasks.filter(t => t.projectId === proj.id);
    const completedCount = projTasks.filter(t => t.status === 'done').length;
    
    if (projTasks.length > 8 && completedCount / projTasks.length < 0.25 && proj.status === 'active') {
      alerts.push({
        id: `alert-scope-${proj.id}`,
        projectId: proj.id,
        projectName: proj.name,
        severity: 'medium',
        type: 'scope_creep',
        message: `Project "${proj.name}" is showing signs of scope creep (large backlog ratio).`,
        recommendation: `Conduct a prioritization sync to prune lower-value backlog tickets.`,
      });
    }
  });

  return alerts;
}

/**
 * Generate Smart Task Prioritization list for a user or dashboard
 */
export function getSmartPrioritization(tasks: Task[], projects: Project[]): Task[] {
  const currentDate = new Date('2026-07-16').getTime();

  return [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Priority weights
      const priorityWeights = { critical: 100, high: 60, medium: 30, low: 10 };
      scoreA += priorityWeights[a.priority] || 0;
      scoreB += priorityWeights[b.priority] || 0;

      // Project priority weights
      const projA = projects.find(p => p.id === a.projectId);
      const projB = projects.find(p => p.id === b.projectId);
      if (projA?.priority === 'critical') scoreA += 50;
      if (projB?.priority === 'critical') scoreB += 50;

      // Due date urgency (overdue adds 80, due within 3 days adds 40)
      const dueTimeA = new Date(a.dueDate).getTime();
      const dueTimeB = new Date(b.dueDate).getTime();

      const diffDaysA = (dueTimeA - currentDate) / (1000 * 60 * 60 * 24);
      const diffDaysB = (dueTimeB - currentDate) / (1000 * 60 * 60 * 24);

      if (diffDaysA < 0) scoreA += 80;
      else if (diffDaysA <= 3) scoreA += 40;

      if (diffDaysB < 0) scoreB += 80;
      else if (diffDaysB <= 3) scoreB += 40;

      // Status weight (In Progress gets preference over Todo/Backlog)
      if (a.status === 'in_progress') scoreA += 15;
      if (b.status === 'in_progress') scoreB += 15;

      return scoreB - scoreA; // descending order
    });
}

/**
 * Find matching resource optimizations (suggesting swaps)
 */
export function getResourceRecommendations(
  tasks: Task[],
  team: TeamMember[],
  projects: Project[],
  sprints: Sprint[]
): ResourceRecommendation[] {
  const recommendations: ResourceRecommendation[] = [];
  const activeSprint = sprints.find(s => s.status === 'active');
  if (!activeSprint) return [];

  // 1. Identify overloaded team members
  const memberLoads = team.map(member => {
    const activeSprintTasks = tasks.filter(
      t => t.assigneeId === member.id && 
           t.status !== 'done' && 
           t.sprintId === activeSprint.id
    );
    const totalHours = activeSprintTasks.reduce((acc, t) => acc + t.timeEstimate, 0);
    return { member, totalHours, tasks: activeSprintTasks };
  });

  const overloaded = memberLoads.filter(ml => ml.totalHours > ml.member.maxHoursPerWeek);
  const underloaded = memberLoads.filter(ml => ml.totalHours < ml.member.maxHoursPerWeek - 10);

  if (overloaded.length === 0 || underloaded.length === 0) return [];

  // 2. Pair task reassignments
  overloaded.forEach(ov => {
    // Look for a task to reassign (typically todo or late-stage backlog)
    const candidates = ov.tasks.filter(t => t.status === 'todo' || t.status === 'backlog');
    
    candidates.forEach(task => {
      // Find an underloaded team member with matching skills for this task
      // We can check if any of their skills match the task description keywords, or project category
      const proj = projects.find(p => p.id === task.projectId);
      const category = proj?.category || '';

      const suitableMatch = underloaded.find(un => {
        // If QA, check if task is testing and assignee has QA skills
        const hasSkill = un.member.skills.some(skill => 
          task.description.toLowerCase().includes(skill.toLowerCase()) ||
          task.title.toLowerCase().includes(skill.toLowerCase()) ||
          category.toLowerCase().includes(skill.toLowerCase())
        );
        return hasSkill;
      });

      if (suitableMatch) {
        recommendations.push({
          id: `rec-${task.id}`,
          taskTitle: task.title,
          taskId: task.id,
          projectId: task.projectId,
          projectName: proj?.name || 'Unknown',
          overloadedMemberName: ov.member.name,
          overloadedMemberId: ov.member.id,
          suggestedMemberName: suitableMatch.member.name,
          suggestedMemberId: suitableMatch.member.id,
          reason: `${ov.member.name} has ${ov.totalHours} hours assigned this sprint. Reassigning "${task.title}" (estimate: ${task.timeEstimate} hrs) to ${suitableMatch.member.name} aligns with their skills (${suitableMatch.member.skills.slice(0, 2).join(', ')}) and balances sprint workload.`,
        });
      }
    });
  });

  return recommendations;
}

/**
 * Calculate Sprint Burn-down predictions
 */
export function calculateSprintAnalytics(
  activeSprint: Sprint,
  tasks: Task[]
): SprintAnalytics {
  const sprintTasks = tasks.filter(t => t.sprintId === activeSprint.id);
  const totalEstimate = sprintTasks.reduce((acc, t) => acc + t.timeEstimate, 0);

  // Generate 14 days of burn-down starting from Sprint start
  const start = new Date(activeSprint.startDate);
  const end = new Date(activeSprint.endDate);
  const daysTotal = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const burnDownData = [];
  let remainingActual = totalEstimate;

  const idealStep = totalEstimate / daysTotal;
  
  // Calculate completed tasks in active sprint
  // Mocking timeline updates for past days
  const currentDate = new Date('2026-07-16');
  const elapsedDays = Math.round((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i <= daysTotal; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + i);
    const dayString = dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    // Ideal line drops linearly
    const currentIdeal = Math.max(0, Math.round(totalEstimate - (idealStep * i)));

    // Actual line drops based on tasks done
    // For days after today, we estimate based on velocity, or keep flat
    let currentActual = remainingActual;
    if (i <= elapsedDays) {
      // simulate completed tasks up to this day
      const completedUpToDay = sprintTasks.filter(t => {
        if (t.status !== 'done') return false;
        // Mock a completion date if none exists. Say completed 3 days ago.
        const compDay = t.dueDate; // use dueDate as proxy
        const compDate = new Date(compDay);
        return compDate <= dayDate;
      });
      const hoursDone = completedUpToDay.reduce((acc, t) => acc + t.timeEstimate, 0);
      currentActual = Math.max(0, totalEstimate - hoursDone);
    } else {
      // Future prediction: if we are lagging, actual line will burn slower than ideal
      // If we are doing well, actual line matches ideal
      const doneSoFar = sprintTasks.filter(t => t.status === 'done').length;
      const totalSprintTasksCount = sprintTasks.length;
      const progressRatio = doneSoFar / (totalSprintTasksCount || 1);
      
      const expectedBurnRate = progressRatio / (elapsedDays / daysTotal);
      
      if (expectedBurnRate < 0.8) {
        // Lagging: burn slower
        const predictedIdealStep = (remainingActual) / (daysTotal - elapsedDays);
        currentActual = Math.max(0, Math.round(remainingActual - (predictedIdealStep * (i - elapsedDays) * 0.75)));
      } else {
        // On track
        const predictedIdealStep = (remainingActual) / (daysTotal - elapsedDays);
        currentActual = Math.max(0, Math.round(remainingActual - (predictedIdealStep * (i - elapsedDays))));
      }
    }

    burnDownData.push({
      day: dayString,
      ideal: currentIdeal,
      actual: currentActual,
    });
  }

  // Determine sprint health status
  const doneCount = sprintTasks.filter(t => t.status === 'done').length;
  const inProgressCount = sprintTasks.filter(t => t.status === 'in_progress').length;
  const totalCount = sprintTasks.length;
  
  let healthStatus: 'healthy' | 'at_risk' | 'critical' = 'healthy';
  let completionPrediction = 'Sprint is on track for 100% completion.';

  const completionRatio = doneCount / (totalCount || 1);
  const sprintElapsedRatio = elapsedDays / daysTotal;

  if (completionRatio < sprintElapsedRatio - 0.25) {
    healthStatus = 'critical';
    completionPrediction = `Critical backlog: predicted to miss sprint goal by ${totalCount - doneCount - inProgressCount} tasks.`;
  } else if (completionRatio < sprintElapsedRatio - 0.1) {
    healthStatus = 'at_risk';
    completionPrediction = 'Running slightly behind schedule. Risk of rollover for 2 tasks.';
  }

  return {
    healthStatus,
    burnDownData,
    completionPrediction,
  };
}
