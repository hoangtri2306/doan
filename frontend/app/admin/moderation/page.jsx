"use client";

import { useState, useEffect } from 'react';
import { getModerationQueue, approveModerationItem, hideModerationItem } from '../../../services/moderation.service';

function RiskBadge({ score, label }) {
  const pct = Math.round(score * 100);
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#34d399';
  const bg = pct > 70 ? 'rgba(239,68,68,0.15)' : pct > 40 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: bg, color }}>{pct}%</span>
    </div>
  );
}

export default function ModerationQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getModerationQueue();
      setQueue(res.data || []);
    } catch {
      showToast('Failed to load queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleAction = async (action, id) => {
    setActionLoading(id + action);
    try {
      if (action === 'APPROVE') await approveModerationItem(id);
      if (action === 'HIDE') await hideModerationItem(id);
      showToast(action === 'APPROVE' ? 'Content approved' : 'Content hidden');
      fetchQueue();
    } catch {
      showToast(`Failed to ${action.toLowerCase()}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl" style={{ background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`, color: toast.type === 'error' ? '#f87171' : '#34d399' }}>
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">Moderation Queue</h2>
        <p className="text-slate-500 text-sm mt-0.5">AI-flagged content awaiting human review</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading queue...</div>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white font-semibold">Queue is empty!</p>
          <p className="text-slate-500 text-sm">No items need moderation right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map(item => (
            <div key={item._id} className="rounded-2xl p-5 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{item.target_model}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>{item.reason}</span>
                <div className="flex items-center gap-3 ml-auto">
                   <RiskBadge score={item.spam_score ?? 0} label="Spam" />
                   <RiskBadge score={item.toxicity_score ?? 0} label="Toxicity" />
                </div>
              </div>
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-slate-300 text-sm">{item.target_id?.content || 'Content unavailable'}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => handleAction('APPROVE', item._id)} disabled={!!actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>Approve</button>
                <button onClick={() => handleAction('HIDE', item._id)} disabled={!!actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
