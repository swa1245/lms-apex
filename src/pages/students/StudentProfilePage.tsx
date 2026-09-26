import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  CreditCard,
  CalendarCheck,
  Award,
  FileText,
  Clock,
  Printer,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FeeCollectionModal } from '../../components/modals/FeeCollectionModal';

export const StudentProfilePage: React.FC = () => {
  const { selectedStudent, students, setSelectedStudentId, setCurrentRoute } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'academic' | 'documents'>('overview');
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  const student = selectedStudent || students[0];

  if (!student) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">No student selected.</p>
        <button
          onClick={() => setCurrentRoute('students/student-list')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Student List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-4 ring-blue-50"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-800">{student.name}</h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {student.status}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {student.admissionNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {student.className} • Section {student.section} • Roll Number: #{student.rollNo} • Blood Group: {student.bloodGroup}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.parentPhone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.parentEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={() => setFeeModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Fee</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4 overflow-x-auto text-xs font-bold text-slate-500">
          {[
            { id: 'overview', label: 'Overview & Profile', icon: User },
            { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck },
            { id: 'fees', label: 'Fee Statement', icon: CreditCard },
            { id: 'academic', label: 'Academic Performance', icon: Award },
            { id: 'documents', label: 'Certificates & Docs', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                Personal & Enrollment Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Date of Birth</span>
                  <span className="font-bold text-slate-800">{student.dob}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="font-bold text-slate-800">{student.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Admission Date</span>
                  <span className="font-bold text-slate-800">{student.admissionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Emergency Contact</span>
                  <span className="font-bold text-slate-800">{student.emergencyContact}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Residential Address</span>
                  <span className="font-bold text-slate-800">{student.address}</span>
                </div>
              </div>
            </div>

            {/* Parent Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                Guardian Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Parent / Guardian Name</span>
                  <span className="font-bold text-slate-800">{student.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Primary Mobile</span>
                  <span className="font-bold text-slate-800">{student.parentPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Guardian Email</span>
                  <span className="font-bold text-slate-800">{student.parentEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Academic Standing</h3>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Attendance Rate</span>
                  <span className="font-bold text-emerald-600">{student.attendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${student.attendanceRate}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <span className="text-slate-500 font-medium block">Tuition Fee Status</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-800 font-bold">₹{student.paidFee.toLocaleString('en-IN')} / ₹{student.totalFee.toLocaleString('en-IN')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    student.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {student.feeStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Fee Ledger & Transaction Records</h3>
            <span className="text-xs font-bold text-blue-600">Total Outstanding: ₹{(student.totalFee - student.paidFee).toLocaleString('en-IN')}</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
              <tr>
                <th className="p-3">Fee Head</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-bold text-slate-800">Term 1 Tuition & Computer Fee</td>
                <td className="p-3 text-slate-500">10 May 2024</td>
                <td className="p-3 font-semibold text-slate-800">₹25,000</td>
                <td className="p-3 font-semibold text-emerald-600">₹25,000</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">PAID</span></td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-800">Term 2 Tuition & Exam Fee</td>
                <td className="p-3 text-slate-500">15 Oct 2024</td>
                <td className="p-3 font-semibold text-slate-800">₹20,000</td>
                <td className="p-3 font-semibold text-slate-400">₹{student.paidFee > 25000 ? (student.paidFee - 25000).toLocaleString('en-IN') : 0}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    student.paidFee >= student.totalFee ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {student.paidFee >= student.totalFee ? 'PAID' : 'DUE'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Monthly Attendance Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
              <span className="block text-slate-500">Total Working Days</span>
              <span className="text-lg font-bold">180 Days</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
              <span className="block text-slate-500">Present</span>
              <span className="text-lg font-bold">171 Days</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800">
              <span className="block text-slate-500">Absent</span>
              <span className="text-lg font-bold">7 Days</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-800">
              <span className="block text-slate-500">Approved Leave</span>
              <span className="text-lg font-bold">2 Days</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Term 1 Assessment Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { sub: 'Mathematics', marks: '92/100', grade: 'A+' },
              { sub: 'Science', marks: '88/100', grade: 'A' },
              { sub: 'English Language', marks: '94/100', grade: 'A+' },
              { sub: 'Social Studies', marks: '85/100', grade: 'A' },
              { sub: 'Computer Science', marks: '98/100', grade: 'A+' },
              { sub: 'Second Language', marks: '90/100', grade: 'A+' }
            ].map(item => (
              <div key={item.sub} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-slate-700">{item.sub}</span>
                <span className="font-bold text-blue-600">{item.marks} ({item.grade})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Verified Credentials & Files</h3>
          <div className="space-y-2 text-xs">
            {['Birth Certificate (Original Verified)', 'Transfer Certificate (TC)', 'Immunization & Health Fitness Record', 'Previous Academic Transcript'].map(doc => (
              <div key={doc} className="p-3 rounded-xl border border-slate-200 flex justify-between items-center hover:bg-slate-50">
                <span className="font-medium text-slate-800">{doc}</span>
                <span className="text-emerald-600 font-bold text-[11px]">VERIFIED ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Modal */}
      <FeeCollectionModal
        isOpen={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        defaultStudentName={student.name}
        defaultAmount={student.totalFee - student.paidFee || 15000}
      />
    </div>
  );
};
