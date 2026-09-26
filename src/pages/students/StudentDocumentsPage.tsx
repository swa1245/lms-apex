import React, { useState } from 'react';
import { FileText, Download, Eye, Upload, CheckCircle2, Clock, Trash2, X, Plus, Filter, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Select } from '../../components/ui';

export const StudentDocumentsPage: React.FC = () => {
  const { documents, students, addDocument, verifyDocument, deleteDocument, showToast } = useApp();
  const [docFilter, setDocFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [docType, setDocType] = useState('Identity');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filtered = docFilter === 'All' ? documents : documents.filter(d => d.docType === docFilter);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title Required', 'Please enter a valid document title.', 'warning');
      return;
    }
    if (!selectedFile) {
      showToast('File Required', 'Please select a document file.', 'warning');
      return;
    }

    const matchedStudent = students.find(s => s.id === studentId);
    const studentName = matchedStudent?.name || 'Enrolled Student';
    let url: string | undefined;
    if (selectedFile.size < 1.5 * 1024 * 1024) {
      url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the selected file.'));
        reader.readAsDataURL(selectedFile);
      });
    }

    await addDocument({
      title: title.trim(),
      studentId: studentId || (students[0]?.id ?? ''),
      studentName,
      docType,
      size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      status: 'Pending Review',
      uploadDate: new Date().toISOString().slice(0, 10),
      ...(url ? { url } : {}),
    });

    setTitle('');
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  const handleDownload = (docTitle: string) => {
    showToast('Download Initiated', `Preparing secure copy of ${docTitle}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Student Document Repository</h2>
          <p className="text-xs text-slate-500">Live archive for identification proofs, academic transcripts, and verification records</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          id="open-upload-doc-modal-btn"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Filter by Type:</span>
          <div className="flex flex-wrap gap-1.5 ml-2">
            {['All', 'Identity', 'Academic', 'Medical', 'Certificate'].map(cat => (
              <button
                key={cat}
                onClick={() => setDocFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  docFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Total Documents: <strong className="text-slate-800 dark:text-white">{filtered.length}</strong>
        </span>
      </div>

      {/* Documents Table or Empty State */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Documents Uploaded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              All dummy files have been cleared. As new students are registered, attach live ID proofs and certificates here.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Attach First Document</span>
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-3">Student Name</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">Upload Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white">{doc.title}</span>
                        <span className="text-[10px] text-slate-400 block">{doc.size}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {doc.studentName}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {doc.docType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{doc.uploadDate}</td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => verifyDocument(doc.id)}
                      title="Click to toggle verification"
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer flex items-center gap-1 ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{doc.status}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownload(doc.title)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showToast('Document Preview', `Displaying ${doc.title}`, 'info')}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 rounded-lg cursor-pointer"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-lg cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Attach Document</h3>
                  <p className="text-xs text-slate-400">Save live document to student repository</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aadhaar Card / Birth Certificate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Enrolled Student
                </label>
                {students.length > 0 ? (
                  <Select
                    value={studentId}
                    onChange={setStudentId}
                    className="w-full"
                    options={students.map(s => ({
                      value: s.id,
                      label: `${s.name} (${s.admissionNo || s.id}) - ${s.className}`,
                    }))}
                  />
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                    No students currently added. The document will be saved under general student records.
                  </div>
                )}
              </div>

              <Select
                label="Document Classification"
                value={docType}
                onChange={setDocType}
                className="w-full"
                options={[
                  { value: 'Identity', label: 'Identity (Aadhaar / Passport / Birth Certificate)' },
                  { value: 'Academic', label: 'Academic (Transfer Certificate / Marksheets)' },
                  { value: 'Medical', label: 'Medical (Fitness Certificate / Immunization)' },
                  { value: 'Certificate', label: 'Certificate (Sports / Extracurricular)' },
                ]}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Files under 1.5 MB are stored with content; larger files retain metadata only.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
