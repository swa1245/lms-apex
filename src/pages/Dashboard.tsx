import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  School,
  CreditCard,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserCheck,
  PlusCircle,
  Receipt,
  ClipboardCheck,
  Bell,
  Clock,
  ChevronRight,
  ArrowUpRight,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookOpen,
  Sparkles,
  Layers,
  Search,
  Printer,
  PhoneCall,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { backendClient } from '../api/backendClient';
import { LOCAL_ONLY } from '../config/localMode';
import type { DashboardSummary } from '../types/api';
import type { ClassPeriod } from '../types';
import {
  STUDENT_STRENGTH_DATA,
  ATTENDANCE_TODAY_DATA,
} from '../data/mockData';
import { FeeCollectionModal } from '../components/modals/FeeCollectionModal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { AddStudentModal } from '../components/modals/AddStudentModal';
import { Button, Card } from '../components/ui';

export const Dashboard: React.FC = () => {
  const {
    stats,
    pendingFees,
    notifications,
    activities,
    classes,
    students,
    batches,
    recentReceipts,
    academicYear,
    isAuthenticated,
    timetable,
    timetablePeriodConfigs,
    setCurrentRoute,
    setSelectedStudentId,
    showToast
  } = useApp();

  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!isAuthenticated || LOCAL_ONLY) return;
    let cancelled = false;
    void backendClient
      .getDashboardSummary()
      .then((summary) => {
        if (!cancelled) setDashboardSummary(summary);
      })
      .catch(() => {
        if (!cancelled) setDashboardSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const totalStudents = dashboardSummary?.students ?? stats.totalStudents;
  const totalBatches = dashboardSummary?.batches ?? batches.length;
  const totalTeachers = dashboardSummary?.teachers ?? 0;

  const defaultFeeStudent = useMemo(() => {
    const first = students[0];
    if (!first) return { name: '', amount: 0 };
    return {
      name: first.name,
      amount: Math.max(0, (first.totalFee || 0) - (first.paidFee || 0)),
    };
  }, [students]);

  const feeCollectionChartData = useMemo(() => {
    if (recentReceipts.length === 0) return [];
    const byDate = new Map<string, number>();
    for (const receipt of recentReceipts) {
      const key = receipt.date?.slice(0, 10) || 'Other';
      byDate.set(key, (byDate.get(key) || 0) + receipt.amount);
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [recentReceipts]);

  const recentFeeTransactions = useMemo(
    () =>
      recentReceipts.slice(0, 10).map((r) => ({
        id: r.id,
        receiptNo: r.receiptNo,
        studentName: r.studentName,
        className: r.className,
        amount: r.amount,
        paymentMode: r.mode,
      })),
    [recentReceipts],
  );

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<{ name: string; amount: number }>(
    defaultFeeStudent,
  );

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Tab filters
  const [activeFeeTab, setActiveFeeTab] = useState<'defaulters' | 'recentReceipts'>('defaulters');
  const [selectedWing, setSelectedWing] = useState<'All' | 'Primary' | 'Middle' | 'Senior'>('All');
  const [periodFilter, setPeriodFilter] = useState<'All' | 'Active' | 'Upcoming'>('All');

  const handleOpenFeeModal = (studentName?: string, dueAmount?: number) => {
    setSelectedStudentForFee({
      name: studentName || defaultFeeStudent.name,
      amount: dueAmount ?? defaultFeeStudent.amount,
    });
    setFeeModalOpen(true);
  };

  const handleOpenReceipt = (txn: any) => {
    setSelectedReceipt(txn);
    setReceiptModalOpen(true);
  };

  const handleSendReminder = (studentName: string, contact: string) => {
    showToast(
      'Not configured',
      'SMS/WhatsApp reminders are not enabled yet.',
      'warning'
    );
  };

  // Filter classes by Wing
  const filteredClasses = classes.filter(c => {
    if (selectedWing === 'All') return true;
    if (selectedWing === 'Primary') return ['Pre-Primary', 'Primary'].includes(c.grade);
    if (selectedWing === 'Middle') return c.grade === 'Middle';
    if (selectedWing === 'Senior') return ['Secondary', 'Senior Secondary'].includes(c.grade);
    return true;
  });

  const todaysPeriods = useMemo<ClassPeriod[]>(() => {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const toMinutes = (time?: string) => {
      if (!time) return null;
      const [hours, minutes] = time.split(':').map(Number);
      return hours !== undefined &&
        minutes !== undefined &&
        Number.isFinite(hours) &&
        Number.isFinite(minutes)
        ? hours * 60 + minutes
        : null;
    };

    return timetable
      .filter((entry) => entry.day.toLowerCase() === weekday.toLowerCase())
      .sort((a, b) => a.periodIndex - b.periodIndex || a.className.localeCompare(b.className))
      .map((entry) => {
        const classRecord = classes.find((item) => item.name === entry.className);
        const config = timetablePeriodConfigs.find(
          (item) => item.className === entry.className || item.classId === classRecord?.id,
        );
        const slot = config?.periods[entry.periodIndex];
        const start = toMinutes(slot?.startTime);
        const end = toMinutes(slot?.endTime);
        const status: ClassPeriod['status'] =
          start !== null && end !== null && nowMinutes >= start && nowMinutes < end ? 'Ongoing' : 'Upcoming';
        return {
          id: entry.id,
          periodNo: entry.periodIndex + 1,
          timeSlot: slot ? `${slot.startTime} - ${slot.endTime}` : 'Time not configured',
          subject: entry.subject,
          className: entry.className,
          section: classRecord?.sections[0] || '',
          roomNo: classRecord?.roomNo || 'Room not set',
          teacherName: classRecord?.classTeacher || 'Teacher not assigned',
          status,
          color: 'blue',
        };
      });
  }, [classes, timetable, timetablePeriodConfigs]);

  const filteredPeriods = todaysPeriods.filter(p => {
    if (periodFilter === 'All') return true;
    if (periodFilter === 'Active') return p.status === 'Ongoing';
    if (periodFilter === 'Upcoming') return p.status === 'Upcoming';
    return true;
  });

  // KPI Stat Cards
  const statCards = [
    {
      id: 'stat-students',
      label: 'Total Students',
      value: totalStudents.toLocaleString('en-IN'),
      icon: GraduationCap,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      growth: totalStudents > 0 ? `${totalStudents} Enrolled` : '0 Enrolled',
      isPositive: true,
      subText: totalStudents > 0 ? `${totalStudents} Active Students` : 'Ready for admissions',
      route: 'students/student-list'
    },
    {
      id: 'stat-classes',
      label: 'Classes & Batches',
      value: `${totalBatches || stats.totalClasses} Active`,
      icon: School,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      growth: `${classes.length} Classes · ${totalBatches} Batches`,
      isPositive: true,
      subText: `${classes.length} active classroom divisions`,
      route: 'classes/class-list'
    },
    {
      id: 'stat-attendance',
      label: "Today's Attendance",
      value: `${stats.todayAttendanceRate}%`,
      icon: CalendarCheck,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      growth: totalStudents > 0 ? `${stats.todayAttendanceRate}% Avg` : '0%',
      isPositive: true,
      subText: totalStudents > 0 ? `${stats.todayAttendanceRate}% attendance rate` : 'No logs recorded today',
      route: 'attendance/daily-attendance'
    },
    {
      id: 'stat-collection',
      label: 'Fee Realization',
      value: `₹${(stats.totalFeeCollection / 100000).toFixed(2)}L`,
      icon: CreditCard,
      color: 'teal',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      growth: `${stats.collectionPercentage}% Realized`,
      isPositive: true,
      subText: `₹${stats.totalFeeCollection.toLocaleString('en-IN')} total collected`,
      route: 'fees/fee-collection'
    },
    {
      id: 'stat-pending',
      label: 'Outstanding Dues',
      value: `₹${(stats.pendingFees / 100000).toFixed(2)}L`,
      icon: AlertCircle,
      color: 'rose',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      growth: `${pendingFees.length} Defaulters`,
      isPositive: pendingFees.length === 0,
      subText: pendingFees.length > 0 ? 'Requires follow-up' : 'All student dues clear',
      route: 'fees/pending-fees'
    },
    {
      id: 'stat-faculty',
      label: 'Faculty on Duty',
      value: totalTeachers > 0 ? `${totalTeachers} Staff` : '0 Staff',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      growth: totalTeachers > 0 ? `${totalTeachers} on roster` : 'Active Registry',
      isPositive: true,
      subText: 'Faculty & Teacher Assignment',
      route: 'classes/teacher-assignment'
    }
  ];

  // Quick action shortcuts
  const quickActions = [
    { label: 'Add Student', icon: UserPlus, action: () => setAddStudentOpen(true), color: 'from-blue-600 to-indigo-600' },
    { label: 'Collect Fee (POS)', icon: Receipt, action: () => handleOpenFeeModal(), color: 'from-emerald-600 to-teal-700' },
    { label: 'Mark Attendance', icon: ClipboardCheck, route: 'attendance/daily-attendance', color: 'from-indigo-600 to-blue-700' },
    { label: 'Class Timetable', icon: BookOpen, route: 'classes/timetable', color: 'from-purple-600 to-indigo-600' },
    { label: 'Class Hierarchy', icon: Layers, route: 'classes/class-list', color: 'from-slate-700 to-slate-900' },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Dashboard Hero */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-800 bg-[linear-gradient(135deg,#0b1220_0%,#0f172a_45%,#123a6b_100%)] p-6 sm:p-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,0.16),transparent_40%)] pointer-events-none" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sky-200 text-[11px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Campus • Academic Session {academicYear}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Campus Command Center
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Track {totalStudents} students, {stats.totalClasses} classes, fee collections, and attendance from one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setAddStudentOpen(true)}>
              New Admission
            </Button>
            <Button
              variant="success"
              leftIcon={<Receipt className="w-4 h-4" />}
              onClick={() => handleOpenFeeModal()}
            >
              Collect Fee
            </Button>
            <Button
              variant="secondary"
              className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/15"
              leftIcon={<ClipboardCheck className="w-4 h-4" />}
              onClick={() => setCurrentRoute('attendance/daily-attendance')}
            >
              Mark Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              hover
              padding="sm"
              onClick={() => setCurrentRoute(card.route)}
              id={card.id}
              className="!p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bgColor} dark:bg-opacity-20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  card.isPositive
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40'
                    : 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40'
                }`}>
                  {card.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{card.growth}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{card.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{card.label}</p>
                <p className="text-[10px] text-slate-400 font-medium">{card.subText}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Bento Toolbar */}
      <Card>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="cms-section-title">Quick Access</h2>
            <p className="cms-section-sub">Daily shortcuts for admissions, fees, attendance, and academics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                id={`quick-action-${action.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => {
                  if (action.action) {
                    action.action();
                  } else if (action.route) {
                    setCurrentRoute(action.route);
                  }
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/80 dark:bg-slate-950/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-all text-center group cursor-pointer min-h-[108px]"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Live Class Schedule */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="cms-section-title">Today&apos;s Class Schedule</h2>
              <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Live Periods
              </span>
            </div>
            <p className="cms-section-sub">Classroom sessions, faculty, and period timetable</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {(['All', 'Active', 'Upcoming'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPeriodFilter(tab)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    periodFilter === tab ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentRoute('classes/timetable')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer ml-1"
            >
              <span>Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Period Cards Grid */}
        {filteredPeriods.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-500">No active class periods scheduled at this time.</p>
            <button
              onClick={() => setCurrentRoute('classes/timetable')}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Configure Master Timetable →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
            {filteredPeriods.map(p => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  p.status === 'Ongoing'
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-md'
                    : p.status === 'Completed'
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 shadow-xs hover:border-blue-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Period {p.periodNo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      p.status === 'Ongoing'
                        ? 'bg-blue-600 text-white'
                        : p.status === 'Completed'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status === 'Ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {p.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{p.subject}</h3>
                    <p className="text-xs text-blue-600 font-bold">{p.className} - {p.section}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {p.teacherAvatar && (
                      <img src={p.teacherAvatar} alt={p.teacherName} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" />
                    )}
                    <span className="text-slate-700 font-semibold truncate text-[11px]">{p.teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{p.roomNo}</span>
                    <span>{p.timeSlot}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Area / Line Chart: Fee Collection Overview */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="cms-section-title">Fee Revenue Trend</h2>
                <span className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                  Live Inflow
                </span>
              </div>
              <p className="cms-section-sub">Gross collections and remitter cadence</p>
            </div>
            <button
              onClick={() => setCurrentRoute('fees/fee-collection')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Open Collection POS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Area Chart */}
          <div className="h-64 sm:h-72 w-full">
            {feeCollectionChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CreditCard className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-slate-500">No fee collections recorded yet</span>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeCollectionChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  stroke="#94A3B8"
                  fontSize={12}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  stroke="#94A3B8"
                  fontSize={12}
                  tickFormatter={(val) => `₹${val / 100000}L`}
                  dx={-5}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Gross Collection']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                  itemStyle={{ color: '#60A5FA', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#feeGradient)"
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#1D4ED8', stroke: '#DBEAFE', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Sub-Metrics Below Area Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Realized</span>
              <span className="text-sm font-bold text-slate-900">₹{stats.totalFeeCollection.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-600 block">Overdue Pending</span>
              <span className="text-sm font-bold text-rose-700">₹{stats.pendingFees.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 block">Recovery Rate</span>
              <span className="text-sm font-bold text-emerald-800">{stats.collectionPercentage}%</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[11px] font-semibold text-blue-700 block">Concessions Allowed</span>
              <span className="text-sm font-bold text-blue-800">₹{stats.totalConcession.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Student Strength Donut Chart */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="cms-section-title">Student Enrollment</h2>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                {totalStudents} Total
              </span>
            </div>
            <p className="cms-section-sub">Distribution across wings & grades</p>
          </div>

          <div className="h-56 relative my-2">
            {STUDENT_STRENGTH_DATA.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STUDENT_STRENGTH_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {STUDENT_STRENGTH_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} Students`, 'Enrolled']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <GraduationCap className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-slate-500">No student records registered yet</span>
              </div>
            )}
            {/* Center Label */}
            {STUDENT_STRENGTH_DATA.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">{totalStudents}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students</span>
              </div>
            )}
          </div>

          {/* Legend breakdown list */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {STUDENT_STRENGTH_DATA.length > 0 ? (
              STUDENT_STRENGTH_DATA.map(item => (
                <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 ml-1">{item.value}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-slate-400 text-xs py-1">
                Admit students to populate wing breakdown
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Classroom Divisions Matrix */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" />
              <h2 className="cms-section-title">Classroom Strength Matrix</h2>
            </div>
            <p className="cms-section-sub">Section capacities, room coordinators, and occupancy</p>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
            {(['All', 'Primary', 'Middle', 'Senior'] as const).map(wing => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedWing === wing ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {wing === 'All' ? `All Classes (${classes.length})` : `${wing} Wing`}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Card Grid */}
        {filteredClasses.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-500">No classes configured yet.</p>
            <button
              onClick={() => setCurrentRoute('classes/class-list')}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Add Classes in Hierarchy Setup →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
            {filteredClasses.slice(0, 10).map(c => {
              const occupancyPct = c.capacity > 0 ? Math.round((c.totalStudents / c.capacity) * 100) : 0;
              return (
                <div
                  key={c.id}
                  onClick={() => setCurrentRoute('classes/class-list')}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {c.sections.length} Sec
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium truncate mb-2">
                      {c.classTeacher}
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400">{c.totalStudents} / {c.capacity} Desks</span>
                        <span className={occupancyPct > 85 ? 'text-amber-600' : 'text-emerald-600'}>
                          {occupancyPct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{c.roomNo}</span>
                    <span className="text-blue-600 group-hover:underline">View Roster →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Fee + Attendance row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="cms-section-title">Fee Collections & Outstanding Dues</h2>
              <p className="cms-section-sub">Defaulters, reminders, and recent receipts</p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setActiveFeeTab('defaulters')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFeeTab === 'defaulters' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Overdue ({pendingFees.length})
              </button>
              <button
                onClick={() => setActiveFeeTab('recentReceipts')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFeeTab === 'recentReceipts' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold' : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Recent Receipts
              </button>
            </div>
          </div>

          {activeFeeTab === 'defaulters' ? (
            pendingFees.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No overdue fee defaulters</p>
                <p className="text-slate-400 mt-0.5">All student fee dues are currently clear.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Student Name</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3">Total Due</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 pr-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingFees.map(item => {
                      let badgeClass = 'bg-rose-100 text-rose-700 border-rose-200';
                      if (item.status === '5 Days Left') {
                        badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                      } else if (item.status === '10 Days Left') {
                        badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      }

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 pl-2 font-bold text-slate-900">
                            <div 
                              onClick={() => {
                                setSelectedStudentId(item.studentId);
                                setCurrentRoute('students/student-profile');
                              }}
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {item.studentName}
                            </div>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-600">{item.className}</td>
                          <td className="py-3.5 font-bold text-slate-900">
                            ₹{item.totalDue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 text-slate-500 font-medium">{item.dueDate}</td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${badgeClass}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenFeeModal(item.studentName, item.totalDue)}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                                title="Collect Fee POS"
                              >
                                Collect
                              </button>
                              <button
                                onClick={() => handleSendReminder(item.studentName, item.contact)}
                                className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                                title="Send Reminder SMS & WhatsApp"
                              >
                                Remind
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            recentFeeTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                <Receipt className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No payment vouchers recorded yet</p>
                <p className="text-slate-400 mt-0.5">Collect fee to generate printed tax receipts and vouchers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Receipt No</th>
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Mode</th>
                      <th className="pb-3 pr-2 text-right">Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentFeeTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2 font-mono font-bold text-blue-600">{txn.receiptNo}</td>
                        <td className="py-3.5 font-bold text-slate-900">{txn.studentName}</td>
                        <td className="py-3.5 text-slate-600">{txn.className}</td>
                        <td className="py-3.5 font-extrabold text-emerald-700">₹{txn.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 text-slate-500 font-medium">{txn.paymentMode}</td>
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => handleOpenReceipt(txn)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Voucher</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="cms-section-title">Today&apos;s Attendance</h2>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                {stats.todayAttendanceRate}% Overall
              </span>
            </div>
            <p className="cms-section-sub">Live attendance across batches</p>
          </div>

          <div className="h-52 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ATTENDANCE_TODAY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ATTENDANCE_TODAY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Students`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-emerald-600">{stats.todayAttendanceRate}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {ATTENDANCE_TODAY_DATA.map(item => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentRoute('attendance/daily-attendance')}
            className="w-full mt-3 py-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-xl transition-colors text-center cursor-pointer"
          >
            Open Attendance Register
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="cms-section-title">Recent Alerts</h2>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No active alerts right now.
              </div>
            ) : (
              notifications.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'fee' ? 'bg-amber-100 text-amber-700' :
                    item.type === 'admission' ? 'bg-emerald-100 text-emerald-700' :
                    item.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="cms-section-title">Admin Audit Feed</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Live Sync</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.length === 0 ? (
              <div className="text-xs text-slate-400 py-4">
                No recent audit activities recorded. System is ready for live operational logs.
              </div>
            ) : (
              activities.slice(0, 5).map(act => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{act.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      <FeeCollectionModal
        isOpen={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        defaultStudentName={selectedStudentForFee.name}
        defaultAmount={selectedStudentForFee.amount}
      />

      <AddStudentModal open={addStudentOpen} onClose={() => setAddStudentOpen(false)} />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
