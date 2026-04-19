'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Shield } from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const { data } = await api.get('/staff');
      setStaff(data);
    } catch {
      toast.error('Failed to load staff');
    }
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/staff', form);
      toast.success('Staff member created');
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      loadStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create staff');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Roster</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Staff
        </button>
      </div>

      {showCreate && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Create Staff Account</h2>
          <form onSubmit={createStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Full Name"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              required
              placeholder="Email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              required
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary text-sm">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {staff.map((s) => (
          <div key={s._id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{s.name}</p>
              <p className="text-sm text-gray-500">{s.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {s.mfaEnabled ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Shield className="h-4 w-4" /> MFA Active
                </span>
              ) : (
                <span className="text-xs text-orange-500">MFA Not Set Up</span>
              )}
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="card text-center text-gray-500 py-8">No staff members yet.</div>
        )}
      </div>
    </div>
  );
}
