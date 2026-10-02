// OmniAgency OS - Content Approval System & Review Pipeline

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SocialPost, PostStatus } from '../../types/database';
import { dbService } from '../../lib/database';
import { SocialAdapterFactory } from '../../lib/socialAdapters';
import {
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface ApprovalQueueProps {
  onStatusChange?: () => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ onStatusChange }) => {
  const { currentUser, securityContext, activeClient, refreshDataVersion, triggerRefresh } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [editCaption, setEditCaption] = useState<string>('');
  const [editHashtags, setEditHashtags] = useState<string>('');
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<{ id: string; msg: string } | null>(null);

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await dbService.getSocialPosts(
        securityContext,
        activeClient ? activeClient.id : undefined
      );
      setPosts(allPosts);
    }
    loadPosts();
  }, [currentUser.id, activeClient?.id, refreshDataVersion]);

  const filteredPosts = posts.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const handleApprove = async (post: SocialPost) => {
    await dbService.updatePostStatus(securityContext, post.id, 'APPROVED');
    triggerRefresh();
    if (onStatusChange) onStatusChange();
  };

  const handleOpenReject = (postId: string) => {
    setRejectingPostId(postId);
    setRejectionReason('Copy does not align with tone guidelines or ingredient claims require citation.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingPostId) return;
    await dbService.updatePostStatus(securityContext, rejectingPostId, 'REJECTED', {
      rejection_reason: rejectionReason,
    });
    setRejectingPostId(null);
    triggerRefresh();
    if (onStatusChange) onStatusChange();
  };

  const handleSchedule = async (post: SocialPost) => {
    const scheduledTime = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days in future
    await dbService.updatePostStatus(securityContext, post.id, 'SCHEDULED', {
      scheduled_for: scheduledTime,
    });
    triggerRefresh();
    if (onStatusChange) onStatusChange();
  };

  const handlePublishNow = async (post: SocialPost) => {
    setPublishingPostId(post.id);
    try {
      const adapter = SocialAdapterFactory.getAdapter(post.platform_id);
      const result = await adapter.publishPost({
        caption: post.caption,
        hashtags: post.hashtags,
        mediaUrl: post.media_url,
      });

      if (result.success) {
        await dbService.updatePostStatus(securityContext, post.id, 'PUBLISHED');
        setPublishFeedback({
          id: post.id,
          msg: `Published to ${post.platform_id.toUpperCase()} (${result.adapterMode === 'production' ? 'Production API' : 'Sandbox Adapter'})`,
        });
        setTimeout(() => setPublishFeedback(null), 4000);
        triggerRefresh();
        if (onStatusChange) onStatusChange();
      }
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    } finally {
      setPublishingPostId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    const tagsArray = editHashtags
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    await dbService.updatePostCaption(securityContext, editingPost.id, editCaption, tagsArray);
    setEditingPost(null);
    triggerRefresh();
    if (onStatusChange) onStatusChange();
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
      case 'PENDING_REVIEW':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300';
      case 'PUBLISHED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300';
      case 'FAILED':
        return 'bg-neutral-800 text-rose-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Workflow Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
          Agency Human-in-the-Loop Content Pipeline
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI GENERATION</span>
          </div>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            <span>DRAFT</span>
          </div>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/40">
            <span>CONTENT MANAGER REVIEW</span>
          </div>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </div>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            <span>SCHEDULED</span>
          </div>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Send className="w-3.5 h-3.5" />
            <span>PUBLISHED</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
          {['PENDING_REVIEW', 'DRAFT', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'REJECTED', 'ALL'].map(
            (status) => {
              const count = posts.filter((p) => status === 'ALL' || p.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {status.replace('_', ' ')} ({count})
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Posts Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs">
          No posts currently in status{' '}
          <span className="font-bold text-neutral-600 dark:text-neutral-300">
            {statusFilter.replace('_', ' ')}
          </span>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                      {post.platform_id}
                    </span>
                    {post.ai_generated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Origin
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      post.status
                    )}`}
                  >
                    {post.status.replace('_', ' ')}
                  </span>
                </div>

                {post.media_url && (
                  <div className="mb-3 rounded-xl overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-800 relative">
                    <img
                      src={post.media_url}
                      alt="Post creative"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-4">
                  {post.caption}
                </p>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.rejection_reason && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
                    <span className="font-bold block text-[10px] uppercase">Rejection Reason:</span>
                    {post.rejection_reason}
                  </div>
                )}

                {post.scheduled_for && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Slot: {new Date(post.scheduled_for).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setEditCaption(post.caption);
                    setEditHashtags(post.hashtags.join(' '));
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {post.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleOpenReject(post.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(post)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </>
                  )}

                  {post.status === 'APPROVED' && (
                    <button
                      onClick={() => handleSchedule(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Schedule 2d</span>
                    </button>
                  )}

                  {(post.status === 'APPROVED' || post.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handlePublishNow(post)}
                      disabled={publishingPostId === post.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{publishingPostId === post.id ? 'Publishing...' : 'Publish Now'}</span>
                    </button>
                  )}
                </div>
              </div>

              {publishFeedback && publishFeedback.id === post.id && (
                <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {publishFeedback.msg}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Reject Content with Editorial Notes
            </h4>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State precise reason for rejection..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRejectingPostId(null)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Edit Post Copy & Hashtags
            </h4>
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">Caption:</label>
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">Hashtags (space separated):</label>
              <input
                type="text"
                value={editHashtags}
                onChange={(e) => setEditHashtags(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setEditingPost(null)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
