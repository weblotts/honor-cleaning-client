'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const limit = 50;

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  async function loadLogs() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actionFilter) params.append('action', actionFilter);
      const { data } = await api.get(`/admin/audit-logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load audit logs');
    }
  }

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-brand-600" /> Audit Logs
        </h1>
        <input
          type="text"
          className="input-field w-auto"
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        COMPLIANCE: MA 201 CMR 17.00 — All data mutations are logged. Audit logs cannot be deleted.
      </p>

      <div className="card overflow-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Target</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {typeof log.actorId === 'object' ? log.actorId.email : log.actorId}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.targetCollection}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            {total} total entries — Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary py-1.5 px-3 text-sm">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-secondary py-1.5 px-3 text-sm">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
