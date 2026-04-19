'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Job, Booking } from '@/types';
import {
  MapPin,
  Clock,
  CheckSquare,
  Camera,
  LogIn,
  LogOut as LogOutIcon,
  CheckCircle,
  Navigation,
  Upload,
  ImagePlus,
  MessageSquare,
} from 'lucide-react';

export default function StaffDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [staffNotes, setStaffNotes] = useState<Record<string, string>>({});
  const beforeInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const afterInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const { data } = await api.get('/jobs/mine');
      setJobs(data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(jobId: string) {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post(`/jobs/${jobId}/checkin`, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          toast.success('Checked in!');
          loadJobs();
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Check-in failed');
        }
      },
      () => toast.error('Location access denied'),
    );
  }

  async function handleCheckOut(jobId: string) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post(`/jobs/${jobId}/checkout`, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          toast.success('Checked out!');
          loadJobs();
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Check-out failed');
        }
      },
      () => toast.error('Location access denied'),
    );
  }

  async function toggleChecklist(jobId: string, index: number, completed: boolean) {
    try {
      await api.patch(`/jobs/${jobId}/checklist`, { index, completed: !completed });
      loadJobs();
    } catch {
      toast.error('Failed to update checklist');
    }
  }

  async function completeJob(jobId: string) {
    try {
      await api.patch(`/jobs/${jobId}/complete`, { customerSignOff: true });
      toast.success('Job marked complete!');
      setActiveJob(null);
      loadJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete');
    }
  }

  async function handlePhotoUpload(jobId: string, folder: 'before' | 'after', file: File) {
    const uploadKey = `${jobId}-${folder}`;
    setUploadingPhotos((prev) => ({ ...prev, [uploadKey]: true }));
    try {
      const { data } = await api.post(`/jobs/${jobId}/photos`, {
        folder,
        contentType: file.type,
      });
      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      toast.success(`${folder === 'before' ? 'Before' : 'After'} photo uploaded!`);
      loadJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Photo upload failed');
    } finally {
      setUploadingPhotos((prev) => ({ ...prev, [uploadKey]: false }));
    }
  }

  function onFileSelected(jobId: string, folder: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(jobId, folder, file);
    }
    e.target.value = '';
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Today&apos;s Jobs</h1>

      {jobs.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          No jobs scheduled for today. Enjoy your day off!
        </div>
      ) : (
        jobs.map((job) => {
          const booking = job.bookingId as Booking;
          const customer = (booking as any)?.customerId;
          const isExpanded = activeJob === job._id;

          return (
            <div key={job._id} className="card">
              <button
                onClick={() => setActiveJob(isExpanded ? null : job._id)}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {booking?.serviceType} Cleaning
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {booking?.scheduledTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {booking?.address?.city}, MA
                      </span>
                    </div>
                  </div>
                  <div>
                    {job.completedAt ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Complete
                      </span>
                    ) : job.checkInTime ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        In Progress
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                  {/* Address + Maps link */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">
                      {booking?.address?.street}, {booking?.address?.city}, MA{' '}
                      {booking?.address?.zip}
                    </p>
                    {customer && (
                      <p className="text-sm text-gray-500 mt-1">
                        Customer: {customer.name || customer.email}
                      </p>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${booking?.address?.street}, ${booking?.address?.city}, MA ${booking?.address?.zip}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-brand-600 mt-2 hover:underline"
                    >
                      <Navigation className="h-4 w-4" /> Open in Google Maps
                    </a>
                  </div>

                  {/* Checklist */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <CheckSquare className="h-4 w-4" /> Checklist
                    </h3>
                    <ul className="space-y-2">
                      {job.checklist.map((item: any, i: number) => (
                        <li key={i}>
                          <button
                            onClick={() => toggleChecklist(job._id, i, item.completed)}
                            className="flex items-center gap-2 text-sm w-full text-left hover:bg-gray-50 rounded p-1"
                          >
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
                            )}
                            <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                              {item.item}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Photos */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Camera className="h-4 w-4" /> Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Before Photos */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Before</p>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          ref={(el) => { beforeInputRefs.current[job._id] = el; }}
                          onChange={(e) => onFileSelected(job._id, 'before', e)}
                        />
                        <button
                          onClick={() => beforeInputRefs.current[job._id]?.click()}
                          disabled={uploadingPhotos[`${job._id}-before`]}
                          className="w-full flex items-center justify-center gap-1 text-xs border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:shadow-sm transition disabled:opacity-50"
                        >
                          {uploadingPhotos[`${job._id}-before`] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImagePlus className="h-4 w-4" /> Add Photo
                            </>
                          )}
                        </button>
                        {job.photosBefore && job.photosBefore.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {job.photosBefore.map((key: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1"
                              >
                                <Camera className="h-3 w-3 shrink-0" />
                                <span className="truncate">{key.split('/').pop()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* After Photos */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">After</p>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          ref={(el) => { afterInputRefs.current[job._id] = el; }}
                          onChange={(e) => onFileSelected(job._id, 'after', e)}
                        />
                        <button
                          onClick={() => afterInputRefs.current[job._id]?.click()}
                          disabled={uploadingPhotos[`${job._id}-after`]}
                          className="w-full flex items-center justify-center gap-1 text-xs border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:shadow-sm transition disabled:opacity-50"
                        >
                          {uploadingPhotos[`${job._id}-after`] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImagePlus className="h-4 w-4" /> Add Photo
                            </>
                          )}
                        </button>
                        {job.photosAfter && job.photosAfter.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {job.photosAfter.map((key: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1"
                              >
                                <Camera className="h-3 w-3 shrink-0" />
                                <span className="truncate">{key.split('/').pop()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Staff Notes */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> Staff Notes
                    </h3>
                    <textarea
                      placeholder="Add optional notes about this job..."
                      value={staffNotes[job._id] || ''}
                      onChange={(e) =>
                        setStaffNotes((prev) => ({ ...prev, [job._id]: e.target.value }))
                      }
                      rows={3}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    {!job.checkInTime && (
                      <button
                        onClick={() => handleCheckIn(job._id)}
                        className="btn-primary text-sm"
                      >
                        <LogIn className="h-4 w-4 mr-2" /> Check In
                      </button>
                    )}
                    {job.checkInTime && !job.checkOutTime && (
                      <button
                        onClick={() => handleCheckOut(job._id)}
                        className="btn-secondary text-sm"
                      >
                        <LogOutIcon className="h-4 w-4 mr-2" /> Check Out
                      </button>
                    )}
                    {job.checkInTime && !job.completedAt && (
                      <button
                        onClick={() => completeJob(job._id)}
                        className="btn-primary text-sm bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
