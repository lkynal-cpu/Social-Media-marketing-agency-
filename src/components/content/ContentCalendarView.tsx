// OmniAgency OS - Interactive Content Calendar View (Monthly & Weekly Grid)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SocialPost } from '../../types/database';
import { dbService } from '../../lib/database';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const ContentCalendarView: React.FC = () => {
  const { currentUser, securityContext, activeClient, refreshDataVersion } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month');

  useEffect(() => {
    async function loadData() {
      const allPosts = await dbService.getSocialPosts(
        securityContext,
        activeClient ? activeClient.id : undefined
      );
      setPosts(allPosts);
    }
    loadData();
  }, [currentUser.id, activeClient?.id, refreshDataVersion]);

  // Days in October 2026
  const daysInOctober = Array.from({ length: 31 }, (_, i) => i + 1);

  const getPostsForDay = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const targetDate = `2026-10-${dayStr}`;

    return posts.filter((p) => {
      if (p.scheduled_for && p.scheduled_for.startsWith(targetDate)) return true;
      if (p.published_at && p.published_at.startsWith(targetDate)) return true;
      return false;
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300';
      case 'tiktok':
        return 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900';
      case 'facebook':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      case 'linkedin':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300';
      case 'twitter_x':
        return 'bg-neutral-800 text-neutral-200';
      case 'youtube':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-neutral-200 text-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              October 2026 Content Schedule
            </h3>
            <p className="text-xs text-neutral-500">
              {activeClient ? `Scheduled & published slots for ${activeClient.name}` : 'All client allocations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                calendarView === 'month'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setCalendarView('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                calendarView === 'list'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              List View
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {calendarView === 'month' ? (
        /* Calendar Grid */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-center text-xs font-bold text-neutral-600 dark:text-neutral-300 py-3">
            <div>Thu (Oct 1)</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200 dark:divide-neutral-800">
            {daysInOctober.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isToday = day === 2; // Local time context Oct 2, 2026

              return (
                <div
                  key={day}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {dayPosts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`w-full text-left p-1.5 rounded-lg border text-[11px] font-medium leading-tight truncate block transition-all shadow-2xs hover:scale-102 ${getPlatformColor(
                          post.platform_id
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold uppercase text-[9px]">{post.platform_id}</span>
                          <span className="text-[9px] opacity-80">
                            {post.status === 'PUBLISHED' ? 'Live' : 'Slot'}
                          </span>
                        </div>
                        <span className="truncate block opacity-90">{post.caption}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs divide-y divide-neutral-200 dark:divide-neutral-800">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${getPlatformColor(
                    post.platform_id
                  )}`}
                >
                  {post.platform_id}
                </span>
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white max-w-lg truncate">
                    {post.caption}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Status: <span className="font-medium text-neutral-700 dark:text-neutral-300">{post.status}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-neutral-500">
                {post.scheduled_for && (
                  <div>Slot: {new Date(post.scheduled_for).toLocaleDateString()}</div>
                )}
                {post.published_at && (
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Published</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Details Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${getPlatformColor(
                  selectedPost.platform_id
                )}`}
              >
                {selectedPost.platform_id}
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                Status: {selectedPost.status}
              </span>
            </div>

            {selectedPost.media_url && (
              <div className="rounded-xl overflow-hidden aspect-video bg-neutral-100">
                <img
                  src={selectedPost.media_url}
                  alt="Post creative"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
              {selectedPost.caption}
            </p>

            {selectedPost.hashtags && (
              <div className="flex flex-wrap gap-1">
                {selectedPost.hashtags.map((tag, i) => (
                  <span key={i} className="text-xs text-indigo-600 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {selectedPost.performance_metrics && (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Views</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {selectedPost.performance_metrics.views.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Likes</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {selectedPost.performance_metrics.likes.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Shares</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {selectedPost.performance_metrics.shares.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Engagement</span>
                  <span className="font-bold text-emerald-600">
                    {selectedPost.performance_metrics.engagement_rate}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
