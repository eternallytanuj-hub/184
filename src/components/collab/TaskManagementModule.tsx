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
  Flame,
  Radio,
  Send,
  Smartphone,
  ShieldCheck
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

  // SMS Alert Modal State
  const [smsModalTask, setSmsModalTask] = useState<TaskItem | null>(null);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsCustomMessage, setSmsCustomMessage] = useState('');
  const [smsPriority, setSmsPriority] = useState<'FLASH_P1' | 'URGENT_P2'>('FLASH_P1');
  const [isTransmittingSms, setIsTransmittingSms] = useState(false);
  const [dispatchedSmsTasks, setDispatchedSmsTasks] = useState<Record<string, { timestamp: string; phone: string }>>({});
  const [toastNotification, setToastNotification] = useState<{ id: number; title: string; subtitle: string } | null>(null);

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

  const handleOpenSmsModal = (task: TaskItem) => {
    const officerPhones: Record<string, string> = {
      'SI Manoj Meena': '+91 98290 41209',
      'Priya Nambiar': '+91 99801 77312',
      'Insp. P. Verma': '+91 94140 88921',
      'Supt. R. Sharma': '+91 98110 55432',
      'Dr. A. K. Saxena': '+91 98100 23411',
    };
    const defaultPhone = officerPhones[task.assignedOfficerName] || '+91 98290 41209';
    
    setSmsModalTask(task);
    setSmsPhone(defaultPhone);
    setSmsPriority(task.priority === 'Critical' ? 'FLASH_P1' : 'URGENT_P2');
    setSmsCustomMessage(
      `[CYBERCAST FLASH DIRECTIVE] URGENT INTERVENTION: Deploy immediately to ${task.location} for Case ${task.caseId}. Mandate: ${task.requiredAction}. Target SLA: ${task.deadline}. Authorized by: ${currentOfficer.name} (${currentOfficer.roleName}). Confirm arrival on site.`
    );
  };

  const handleTransmitSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsModalTask) return;

    setIsTransmittingSms(true);

    setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST';
      const taskId = smsModalTask.id;
      const targetOfficer = smsModalTask.assignedOfficerName;
      const targetPhone = smsPhone;

      setDispatchedSmsTasks((prev) => ({
        ...prev,
        [taskId]: { timestamp: nowTime, phone: targetPhone },
      }));

      setIsTransmittingSms(false);
      setSmsModalTask(null);

      if (onAuditLog) {
        onAuditLog(`DISPATCHED_IMMEDIATE_SMS_ALERT_TO_${targetOfficer.toUpperCase().replace(/[^A-Z]/g, '_')}`, taskId, 'TASK');
      }

      setToastNotification({
        id: Date.now(),
        title: `POLICE ALERT SMS TRANSMITTED: ${targetOfficer} (${targetPhone})`,
        subtitle: `Encrypted directive sent via DLT Trunk (1407/POLICE-FLASH). Gateway delivery confirmed with reference #DLT-${Math.floor(100000 + Math.random() * 900000)}.`,
      });

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setToastNotification((curr) => (curr ? null : curr));
      }, 6000);
    }, 700);
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
      {/* Tactical Flash SMS Toast Banner */}
      {toastNotification && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-start justify-between gap-3 rounded-none shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>[ DLT PROTOCOL 1407 ]</span>
                <span className="text-amber-300">{toastNotification.title}</span>
              </div>
              <div className="text-[11px] text-zinc-300 mt-1">{toastNotification.subtitle}</div>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-white/40 hover:text-white p-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

                      {dispatchedSmsTasks[t.id] && (
                        <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 border border-amber-500/40 rounded-none flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                          <Smartphone className="w-3 h-3 text-amber-400" />
                          SMS DISPATCHED ({dispatchedSmsTasks[t.id].timestamp})
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

                    {/* CTA Button: Send Immediate Alert SMS to Officer */}
                    {t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleOpenSmsModal(t)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase rounded-none transition-colors border ${
                          dispatchedSmsTasks[t.id]
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        }`}
                        title="Dispatch immediate tactical encrypted SMS to assigned field officer"
                      >
                        <Radio className={`w-3.5 h-3.5 ${dispatchedSmsTasks[t.id] ? 'text-amber-400' : 'text-amber-400 animate-pulse'}`} />
                        <span>{dispatchedSmsTasks[t.id] ? 'Resend Alert SMS' : 'Send Immediate Alert SMS'}</span>
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

      {/* Direct Police SMS Dispatch Modal */}
      {smsModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121212] border border-amber-500/40 w-full max-w-xl rounded-none shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col font-mono text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0c0c0c]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/20 border border-amber-500/50">
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-amber-400 tracking-widest block uppercase">
                    MHA // I4C POLICE DISPATCH GATEWAY • DLT PROTOCOL 1407
                  </span>
                  <span className="text-sm font-bold text-white uppercase">
                    Transmit Immediate Officer Alert SMS
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isTransmittingSms && setSmsModalTask(null)}
                disabled={isTransmittingSms}
                className="text-white/60 hover:text-white p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleTransmitSms} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Recipient Details Card */}
              <div className="p-3.5 bg-[#0c0c0c] border border-white/10 space-y-2">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/5 pb-1">
                  Target Field Investigator Profile
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">RECIPIENT OFFICER:</span>
                    <span className="font-bold text-white">{smsModalTask.assignedOfficerName}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">OPERATIONAL ROLE:</span>
                    <span className="text-zinc-300">{smsModalTask.assignedOfficerRole}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">LINKED CASE:</span>
                    <span className="text-[#ceff00] font-bold">{smsModalTask.caseId}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">TARGET LOCATION:</span>
                    <span className="text-rose-400 font-bold">{smsModalTask.location}</span>
                  </div>
                </div>
              </div>

              {/* Priority & Mobile Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 uppercase mb-1">
                    Registered Mobile Number *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      disabled={isTransmittingSms}
                      className="w-full bg-[#0c0c0c] border border-white/10 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 rounded-none disabled:opacity-50"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">CCTNS Verified Mobile SIM</span>
                </div>

                <div>
                  <label className="block text-xs text-white/70 uppercase mb-1">
                    Dispatch Priority *
                  </label>
                  <select
                    value={smsPriority}
                    onChange={(e) => setSmsPriority(e.target.value as any)}
                    disabled={isTransmittingSms}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 rounded-none disabled:opacity-50"
                  >
                    <option value="FLASH_P1">P1 // FLASH PRIORITY (IMMEDIATE)</option>
                    <option value="URGENT_P2">P2 // HIGH PRIORITY DISPATCH</option>
                  </select>
                  <span className="text-[9px] text-amber-400/80 mt-0.5 block">Carrier Class-0 Intercept Channel</span>
                </div>
              </div>

              {/* SMS Directive Payload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/70 uppercase">
                    Tactical Directive Message Payload *
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    {smsCustomMessage.length} / 320 Chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={smsCustomMessage}
                  onChange={(e) => setSmsCustomMessage(e.target.value)}
                  disabled={isTransmittingSms}
                  className="w-full bg-[#0c0c0c] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 rounded-none leading-relaxed disabled:opacity-50"
                />
              </div>

              {/* Telecom Gateway Notice */}
              <div className="p-3 bg-black/60 border border-white/5 text-[10px] text-zinc-400 space-y-1">
                <div className="flex items-center justify-between text-white/80">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    TRAI DLT REGISTRATION: VERIFIED
                  </span>
                  <span className="text-[#ceff00]">DLT ID: 1407982001</span>
                </div>
                <p className="text-zinc-500">
                  Message will be transmitted via encrypted police cellular trunk directly to the field officer&apos;s terminal. [Demo Mode: simulated end-to-end for SIH 2026].
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSmsModalTask(null)}
                  disabled={isTransmittingSms}
                  className="px-4 py-2 border border-white/20 text-xs text-white hover:bg-white/5 rounded-none uppercase disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransmittingSms}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase rounded-none flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
                >
                  {isTransmittingSms ? (
                    <>
                      <Radio className="w-3.5 h-3.5 animate-spin" />
                      TRANSMITTING TO GATEWAY...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      TRANSMIT POLICE SMS DIRECTIVE
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
