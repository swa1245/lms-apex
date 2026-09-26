import React, { useState, useEffect } from 'react';
import { Search, X, User, DollarSign, CalendarCheck, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NAV_SECTIONS } from '../layout/Sidebar';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    students,
    setSelectedStudentId,
    setCurrentRoute
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut cmd+k / ctrl+k
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(query.toLowerCase()) ||
    s.className.toLowerCase().includes(query.toLowerCase()) ||
    s.parentName.toLowerCase().includes(query.toLowerCase())
  );

  const matchedRoutes: { label: string; route: string; category: string }[] = [];
  NAV_SECTIONS.forEach(sec => {
    if (sec.route && sec.label.toLowerCase().includes(query.toLowerCase())) {
      matchedRoutes.push({ label: sec.label, route: sec.route, category: 'Main' });
    }
    if (sec.children) {
      sec.children.forEach(c => {
        if (c.label.toLowerCase().includes(query.toLowerCase()) || sec.label.toLowerCase().includes(query.toLowerCase())) {
          matchedRoutes.push({ label: `${sec.label} > ${c.label}`, route: c.route, category: sec.label });
        }
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchModalOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            placeholder="Search students, pages, modules, or fees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-base text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
            id="modal-search-input"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Quick Module Navigation */}
          {matchedRoutes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Navigation Modules
              </p>
              <div className="space-y-1">
                {matchedRoutes.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentRoute(item.route);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors text-xs font-semibold text-slate-700 group"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Results */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Students ({filteredStudents.length})
            </p>
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No students matching "{query}"</p>
            ) : (
              <div className="space-y-1">
                {filteredStudents.slice(0, 5).map(student => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setCurrentRoute('students/student-profile');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{student.name}</p>
                        <p className="text-[11px] text-slate-400">{student.admissionNo} • {student.className}-{student.section} • Roll {student.rollNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        student.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        student.feeStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {student.feeStatus}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
