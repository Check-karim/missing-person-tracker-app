'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MissingPerson, Comment } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MissingPersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [person, setPerson] = useState<MissingPerson | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [foundLocation, setFoundLocation] = useState('');

  useEffect(() => {
    fetchPerson();
    fetchComments();
  }, [params.id]);

  const fetchPerson = async () => {
    try {
      const response = await fetch(`/api/missing-persons/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPerson(data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?missing_person_id=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.data);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          missing_person_id: params.id,
          comment: newComment,
          is_anonymous: isAnonymous,
        }),
      });

      if (response.ok) {
        toast.success('Comment added');
        setNewComment('');
        setIsAnonymous(false);
        fetchComments();
      }
    } catch (error: any) {
      toast.error('Failed to add comment');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/missing-persons/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          update_note: updateNote,
          found_location: foundLocation,
        }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        setShowStatusModal(false);
        setNewStatus('');
        setUpdateNote('');
        setFoundLocation('');
        fetchPerson();
      }
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missing': return 'bg-red-100 text-red-800';
      case 'found': return 'bg-green-100 text-green-800';
      case 'investigation': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!person) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Person not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Go back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {person.full_name}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(person.status)}`}>
                    {person.status}
                  </span>
                  <span className="text-sm text-gray-600">Case #{person.case_number}</span>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
              >
                Update Status
              </button>
            </div>

            {person.days_missing !== undefined && person.status === 'missing' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">
                  Missing for {person.days_missing} days
                </p>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {person.age && (
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium">{person.age} years old</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium capitalize">{person.gender}</p>
              </div>
              {person.height && (
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="font-medium">{person.height}</p>
                </div>
              )}
              {person.weight && (
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium">{person.weight}</p>
                </div>
              )}
              {person.hair_color && (
                <div>
                  <p className="text-sm text-gray-600">Hair Color</p>
                  <p className="font-medium">{person.hair_color}</p>
                </div>
              )}
              {person.eye_color && (
                <div>
                  <p className="text-sm text-gray-600">Eye Color</p>
                  <p className="font-medium">{person.eye_color}</p>
                </div>
              )}
            </div>

            {person.distinctive_features && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Distinctive Features</p>
                <p className="font-medium">{person.distinctive_features}</p>
              </div>
            )}
          </div>

          {/* Last Seen */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Last Seen Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{person.last_seen_location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {format(new Date(person.last_seen_date), 'MMMM dd, yyyy')}
                  {person.last_seen_time && ` at ${person.last_seen_time}`}
                </p>
              </div>
              {person.clothing_description && (
                <div>
                  <p className="text-sm text-gray-600">Clothing</p>
                  <p className="font-medium">{person.clothing_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-2">
              <p><span className="text-gray-600">Contact:</span> <span className="font-medium">{person.contact_name}</span></p>
              <p><span className="text-gray-600">Phone:</span> <a href={`tel:${person.contact_phone}`} className="font-medium text-primary-600 hover:text-primary-700">{person.contact_phone}</a></p>
              {person.contact_email && (
                <p><span className="text-gray-600">Email:</span> <a href={`mailto:${person.contact_email}`} className="font-medium text-primary-600 hover:text-primary-700">{person.contact_email}</a></p>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comments & Tips</h2>
            
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or tip..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-2"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mr-2"
                  />
                  Post anonymously
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                >
                  Add Comment
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-primary-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{comment.user_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Update Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select status...</option>
                  <option value="missing">Missing</option>
                  <option value="investigation">Under Investigation</option>
                  <option value="found">Found</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {newStatus === 'found' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Found Location</label>
                  <input
                    type="text"
                    value={foundLocation}
                    onChange={(e) => setFoundLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={3}
                  placeholder="Add details about this status update..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

