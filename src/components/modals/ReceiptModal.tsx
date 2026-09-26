import React from 'react';
import { X, Printer, Download, CheckCircle2, School, ShieldCheck, Calendar, CreditCard, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReceiptData {
  receiptNo: string;
  studentName: string;
  studentId: string;
  className: string;
  amount: number;
  feeHead: string;
  paymentMode: string;
  date: string;
  collectedBy: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const { institutionConfig } = useApp();

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const schoolName = institutionConfig.schoolName || 'School';
  const affiliation = institutionConfig.affiliationNo
    ? `${institutionConfig.board || 'Board'} • Affiliation No. ${institutionConfig.affiliationNo}`
    : institutionConfig.board || '';
  const address = institutionConfig.address || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Controls */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Fee Payment Voucher</h2>
              <p className="text-[11px] text-slate-400 font-mono">{receipt.receiptNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Printable Receipt Layout */}
        <div className="p-6 space-y-5 text-slate-800" id="printable-receipt">
          {/* School Header */}
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-1">
              <School className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{schoolName}</h3>
            {affiliation ? <p className="text-[11px] text-slate-500">{affiliation}</p> : null}
            {address ? <p className="text-[10px] text-slate-400 font-medium">{address}</p> : null}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{receipt.studentName}</span>
              <span className="text-[11px] text-slate-500 font-medium">{receipt.studentId} • {receipt.className}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Details</span>
              <span className="font-mono font-bold text-blue-600 text-xs mt-0.5 block">{receipt.receiptNo}</span>
              <span className="text-[11px] text-slate-500">{receipt.date}</span>
            </div>
          </div>

          {/* Amount and Fee Breakdown */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100/70 px-4 py-2 text-slate-500 font-bold uppercase tracking-wider text-[10px] flex justify-between">
              <span>Description / Fee Head</span>
              <span>Amount</span>
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span>{receipt.feeHead || 'Tuition & Development Fee'}</span>
                <span className="font-bold text-slate-900 font-mono">₹{receipt.amount.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Mode of Remittance</span>
                <span className="font-semibold text-slate-700">{receipt.paymentMode}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-extrabold text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                <span>TOTAL AMOUNT RECEIVED</span>
                <span className="text-sm font-mono font-black">₹{receipt.amount.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>System Authenticated</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold">Cashier / Authorized Signatory</p>
              <p className="font-bold text-slate-700 mt-1">{receipt.collectedBy || 'Accounts Officer'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
