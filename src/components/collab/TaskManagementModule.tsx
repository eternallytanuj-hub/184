'use client';

import React, { useState } from 'react';
import { 
  TASKS_DATA, 
  TaskItem, 
  CASES_DATA, 
  OfficerProfile,
  PriorityLevel
} from '@/data/collabData';
import { 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  MapPin, 
  User, 
  ShieldAlert, 
  Plus, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  Calendar,
  X,
  ChevronRight,
  Flame
} from 'lucide-react';

interface TaskManagementModuleProps {
  currentOfficer: OfficerProfile;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
}

export default function TaskManagementModule({ currentOfficer, onAuditLog }: TaskManagementModuleProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(TASKS_DATA);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    caseId: CASES_DATA[0].id,
    assignedOfficerName: currentOfficer.name,
    assignedOfficerRole: currentOfficer.roleName,
    priority: 'Critical' as PriorityLevel,
    hoursToDeadline: '4',
    location: 'Jaipur North / Sindhi Camp',
    requiredAction: '',
  });

  const statuses: TaskItem['status'][] = [
    'PENDING',
    'IN_PROGRESS',
    'BLOCKED',
    'COMPLETED',
    'OVERDUE',
    'CANCELLED',
  ];

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.caseId.toLowerCase().includes(q) ||
      t.assignedOfficerName.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = (taskId: string, newStatus: TaskItem['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (onAuditLog) {
      onAuditLog(`TASK_STATUS_UPDATED_TO_${newStatus}`, taskId, 'TASK');
    }
  };

  const handleEscalateTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isEscalated: true, priority: 'Critical' } : t))
    );
    if (onAuditLog) {
      onAuditLog('ESCALATED_TASK_4H_SLA', taskId, 'TASK');
    }
    alert(`[I4C SLA DIRECTIVE] Task ${taskId} escalated to State Nodal and Central Command under Section 4H Immediate Rapid Intervention Protocol.`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.requiredAction) {
      alert('Please fill all required fields.');
      return;
    }

    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + parseInt(newTaskForm.hoursToDeadline, 10));

    const newTask: TaskItem = {
      id: `TSK-2026-0${Math.floor(80 + tasks.length + 1)}`,
      title: newTaskForm.title,
      caseId: newTaskForm.caseId,
      assignedOfficerName: newTaskForm.assignedOfficerName,
      assignedOfficerRole: newTaskForm.assignedOfficerRole,
      priority: newTaskForm.priority,
      deadline: deadlineDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + deadlineDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      location: newTaskForm.location,
      requiredAction: newTaskForm.requiredAction,
      status: 'PENDING',
      isEscalated: false,
    };

    setTasks([newTask, ...tasks]);
    setShowCreateModal(false);

    if (onAuditLog) {
      onAuditLog('CREATED_RAPID_FIELD_TASK', newTask.id, 'TASK');
    }
  };

  const stats = {
    total: tasks.length,
    critical: tasks.filter((t) => t.priority === 'Critical').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    overdue: tasks.filter((t) => t.status === 'OVERDUE' || t.isEscalated).length,
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121212] border border-white/10 rounded-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#ceff00] uppercase bg-[#ceff00]/10 px-2 py-0.5 border border-[#ceff00]/30 rounded-none">
              MODULE 06 // TACTICAL FIELD & INVESTIGATION TASKS
            </span>
            <span className="text-[10px] font-mono text-white/40">4-HOUR SLA DISPATCH ENGINE</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#ceff00]" />
            Law Enforcement Task Coordination
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            ATM patrol dispatch • CFCFRMS bank freeze mandates • Suspect interception directives
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors rounded-none shadow-[0_0_15px_rgba(206,255,0,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Issue Operational Directive
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-[#121212] border border-white/10 rounded-none">
          <div className="text-[10px] font-mono text-white/40 uppercase">ACTIVE DIRECTIVES</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[10px] font-mono text-white/40 mt-1">Total across sectors</div>
        </div>

        <div className="p-4 bg-[#121212] border border-white/10 rounded-none">
          <div className="text-[10px] font-mono text-rose-400 uppercase flex items-center gap-1">
            <Flame className="w-3 h-3" />
            CRITICAL PRIORITY
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.critical}</div>
          <div className="text-[10px] font-mono text-white/40 mt-1">Immediate intervention</div>
        </div>

        <div className="p-4 bg-[#121212] border border-white/10 rounded-none">
          <div className="text-[10px] font-mono text-sky-400 uppercase">IN EXECUTION</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{stats.inProgress}</div>
          <div className="text-[10px] font-mono text-white/40 mt-1">Field teams deployed</div>
        </div>

        <div className="p-4 bg-[#121212] border border-white/10 rounded-none">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">RESOLVED / FROZEN</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.completed}</div>
          <div className="text-[10px] font-mono text-white/40 mt-1">Mandate fulfilled</div>
        </div>

        <div className="p-4 bg-[#121212] border border-rose-500/30 bg-rose-500/5 rounded-none">
          <div className="text-[10px] font-mono text-rose-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            SLA ESCALATED
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.overdue}</div>
          <div className="text-[10px] font-mono text-rose-400/60 mt-1">&gt;4 Hours SLA breach</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#121212] border border-white/10 rounded-none">
        <div className="md:col-span-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks by directive title, officer, case or location..."
            className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#ceff00] rounded-none"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-[#121212] border border-white/10 rounded-none">
            <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-3" />
            <div className="text-sm font-mono text-white uppercase font-bold">No Operational Directives Found</div>
            <div className="text-xs font-mono text-white/50 mt-1">Change status filters or create a new field directive</div>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isOverdue = t.status === 'OVERDUE' || t.isEscalated;

            return (
              <div
                key={t.id}
                className={`p-5 bg-[#121212] border transition-all rounded-none ${
                  isOverdue
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-black bg-[#ceff00] px-2 py-0.5 rounded-none">
                        {t.id}
                      </span>
                      <span className="text-[10px] font-mono text-white/70 bg-white/5 px-2 py-0.5 border border-white/10 rounded-none">
                        CASE: {t.caseId}
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded-none uppercase ${
                          t.priority === 'Critical'
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                            : t.priority === 'High'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            : 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                        }`}
                      >
                        {t.priority}
                      </span>

                      {/* Status */}
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded-none uppercase ${
                          t.status === 'COMPLETED'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : t.status === 'IN_PROGRESS'
                            ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                            : t.status === 'OVERDUE'
                            ? 'text-rose-400 bg-rose-500/20 border-rose-500'
                            : 'text-white/60 bg-white/5 border-white/10'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>

                      {t.isEscalated && (
                        <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 border border-rose-500 rounded-none animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          SLA ESCALATED (I4C NOTIFIED)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                      {t.title}
                    </h3>

                    <p className="text-xs font-mono text-white/80 bg-[#0c0c0c] p-2.5 border border-white/5">
                      <span className="text-[#ceff00] font-bold">REQUIRED ACTION:</span> {t.requiredAction}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/50 pt-1">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <User className="w-3.5 h-3.5 text-[#ceff00]" />
                        {t.assignedOfficerName} ({t.assignedOfficerRole})
                      </span>
                      <span className="flex items-center gap-1.5 text-white/70">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {t.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/70">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Target SLA: {t.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Right Column Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-4 min-w-[200px]">
                    {t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase rounded-none transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                    )}

                    {t.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold uppercase rounded-none transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Accept & Deploy
                      </button>
                    )}

                    {!t.isEscalated && t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleEscalateTask(t.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold uppercase rounded-none transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Escalate (4h SLA)
                      </button>
                    )}

                    {t.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'BLOCKED')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 text-xs font-mono uppercase rounded-none transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Report Impediment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/20 w-full max-w-xl rounded-none max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#ceff00]" />
                <span className="font-mono text-sm font-bold text-white uppercase">
                  ISSUE RAPID LAW ENFORCEMENT DIRECTIVE
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Directive Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Station Patrol at ATM cluster #14"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Associate Case ID *
                  </label>
                  <select
                    value={newTaskForm.caseId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, caseId: e.target.value })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    {CASES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} ({c.victimState})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as PriorityLevel })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    <option value="Critical">Critical (&lt;2h Action)</option>
                    <option value="High">High (&lt;4h Action)</option>
                    <option value="Medium">Medium (&lt;12h Action)</option>
                    <option value="Low">Low (Routine Follow-up)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Assigned Officer
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.assignedOfficerName}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedOfficerName: e.target.value })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    SLA Deadline Window
                  </label>
                  <select
                    value={newTaskForm.hoursToDeadline}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, hoursToDeadline: e.target.value })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    <option value="2">2 Hours (Emergency Freeze/Patrol)</option>
                    <option value="4">4 Hours (Standard Fast Escalation)</option>
                    <option value="8">8 Hours (End of Shift)</option>
                    <option value="24">24 Hours (Statutory Filing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Target ATM / Field Location *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskForm.location}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                  className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Operational Protocol / Specific Instructions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTaskForm.requiredAction}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, requiredAction: e.target.value })}
                  placeholder="Detail step-by-step directives for the squad or banking liaison..."
                  className="w-full bg-[#0c0c0c] border border-white/10 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-white/20 text-xs font-mono text-white hover:bg-white/5 rounded-none uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ceff00] text-black text-xs font-mono font-bold hover:bg-[#b8e600] rounded-none uppercase tracking-wider shadow-[0_0_15px_rgba(206,255,0,0.2)]"
                >
                  Authorize Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
