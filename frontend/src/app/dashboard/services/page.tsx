'use client';

import { useState, useEffect, useContext } from 'react';
import { Plus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { DashboardContext } from '../layout';
import { api } from '@/lib/api';

export default function DashboardServices() {
  const context = useContext(DashboardContext);
  const { businessDetail, refreshData } = context || {};

  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newServiceName, setNewServiceName] = useState('');
  const [updatingServices, setUpdatingServices] = useState(false);
  const [serviceError, setServiceError] = useState('');

  const fetchServices = async () => {
    try {
      const list = await api.get<string[]>('/dashboard/services');
      setServices(list);
    } catch (err: any) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newServiceName.trim();
    if (!name) return;

    if (services.includes(name)) {
      setServiceError('Service already exists.');
      return;
    }

    setServiceError('');
    setUpdatingServices(true);
    try {
      await api.post('/dashboard/services', { name });
      setNewServiceName('');
      await fetchServices();
      if (refreshData) await refreshData();
    } catch (err: any) {
      setServiceError(err?.message || 'Failed to add service.');
    } finally {
      setUpdatingServices(false);
    }
  };

  const handleDeleteService = async (name: string) => {
    setServiceError('');
    setUpdatingServices(true);
    try {
      // Encode service name for URL parameter safety
      const encodedName = encodeURIComponent(name);
      await api.delete(`/dashboard/services/${encodedName}`);
      await fetchServices();
      if (refreshData) await refreshData();
    } catch (err: any) {
      setServiceError(err?.message || 'Failed to remove service.');
    } finally {
      setUpdatingServices(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-xs border-t-4 border-t-[#d4af37] p-6 rounded space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#0d1527]">Manage Offered Services</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure the list of services your business offers. Customers will choose from this list when submitting feedback.
            </p>
          </div>
        </div>

        {serviceError && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-4 rounded font-medium">
            {serviceError}
          </div>
        )}

        <form onSubmit={handleAddService} className="flex gap-3 max-w-lg">
          <input
            type="text"
            required
            disabled={updatingServices || loading}
            placeholder="E.g. Kitchen Remodeling, Consultation"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="flex-grow rounded border border-slate-200 bg-white py-2 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
          />
          <button
            type="submit"
            disabled={updatingServices || loading || !newServiceName.trim()}
            className="inline-flex items-center gap-1.5 bg-[#0d1527] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
          >
            {updatingServices ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 text-[#d4af37]" /> Add Service
              </>
            )}
          </button>
        </form>

        <div className="pt-4 space-y-4">
          <h4 className="font-display font-bold text-[#0d1527] text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#d4af37]" /> Active Services List
          </h4>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#d4af37]" /> Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 bg-[#faf8f5] rounded border border-dashed border-slate-200">
              No services configured yet. Add a service above — customers will see a default "General Service" option until then.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {services.map((srv: string) => (
                <div
                  key={srv}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 font-display">{srv}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv)}
                    disabled={updatingServices}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-all cursor-pointer"
                    title="Delete service"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
