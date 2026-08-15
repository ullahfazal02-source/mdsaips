import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, FileText, ExternalLink, Clock } from 'lucide-react';
import useVendor from '../hooks/useVendor';

export const AdminDashboard = () => {
  const { pendingVendors, getPendingVendorsList, verifyVendorAccount, loading } = useVendor();

  const [verifyModal, setVerifyModal] = useState({ open: false, vendor: null, approved: true });
  const [reason, setReason] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    getPendingVendorsList().catch(() => {});
  }, [getPendingVendorsList]);

  const handleOpenVerify = (vendor, approved) => {
    setVerifyModal({ open: true, vendor, approved });
    setReason('');
  };

  const handleConfirmVerify = async () => {
    if (!verifyModal.vendor) return;

    setStatusMsg({ type: '', text: '' });
    try {
      await verifyVendorAccount(verifyModal.vendor._id, verifyModal.approved, reason);
      setStatusMsg({
        type: 'success',
        text: `Vendor "${verifyModal.vendor.businessName}" verification ${
          verifyModal.approved ? 'approved' : 'rejected'
        } successfully.`,
      });
      setVerifyModal({ open: false, vendor: null, approved: true });
      getPendingVendorsList();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Verification update failed.' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Admin Console</h1>
          <p className="text-xs text-slate-400">Global system oversight, vendor verification, and system status</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Pending Vendor Verifications</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{pendingVendors.length}</p>
          <p className="text-[11px] text-slate-500">Profiles awaiting admin document review</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>System Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">100% Operational</p>
          <p className="text-[11px] text-slate-500">MongoDB Atlas & Nodemailer Email Service Connected</p>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Pending Verifications Table */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Pending Vendor Verifications Queue</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : pendingVendors.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No Pending Verification Requests</p>
            <p className="text-xs text-slate-400">All registered vendor profiles have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingVendors.map((vendor) => (
              <div
                key={vendor._id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-base font-bold text-white">{vendor.businessName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-brand-300 border border-slate-700">
                      {vendor.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    City: <span className="text-slate-200">{vendor.location?.city}</span> • User Email:{' '}
                    <span className="text-slate-200">{vendor.userId?.email || 'N/A'}</span>
                  </p>

                  {/* Documents list */}
                  {vendor.documents && vendor.documents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">Documents:</span>
                      {vendor.documents.map((docUrl, idx) => (
                        <a
                          key={idx}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-mono text-brand-400 hover:underline bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20"
                        >
                          <span>Doc #{idx + 1}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleOpenVerify(vendor, false)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleOpenVerify(vendor, true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all text-xs font-bold flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Vendor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Action Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {verifyModal.approved ? 'Approve' : 'Reject'} Vendor: {verifyModal.vendor?.businessName}
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Reason / Note for Email Notification</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Documents verified successfully"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setVerifyModal({ open: false, vendor: null, approved: true })}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerify}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  verifyModal.approved
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                Confirm {verifyModal.approved ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
