import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import apiClient from '../../api/client';

interface Overview {
  total_visitors: number;
  total_page_views: number;
}

interface VisitorTime {
  date: string;
  count: number;
}

interface ReadBlog {
  blog: string;
  total_reads: number;
  avg_time: number;
}

interface PageCount {
  path: string;
  count: number;
}

interface ActiveSession {
  session_id: string;
  location: string;
  current_page: string;
  last_seen: string;
}

export const AnalyticsManager = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [visitorsOverTime, setVisitorsOverTime] = useState<VisitorTime[]>([]);
  const [mostRead, setMostRead] = useState<ReadBlog[]>([]);
  const [pageCounts, setPageCounts] = useState<PageCount[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, timeRes, blogRes, pageRes, activeRes] = await Promise.all([
        apiClient.get('/track/overview/'),
        apiClient.get('/track/visitors-over-time/'),
        apiClient.get('/track/most-read-blogs/'),
        apiClient.get('/track/page-counts/'),
        apiClient.get('/track/active-sessions/'),
      ]);

      setOverview(overviewRes.data);
      setVisitorsOverTime(timeRes.data);
      setMostRead(blogRes.data);
      setPageCounts(pageRes.data);
      setActiveSessions(activeRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-text-main text-center py-10">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      {/* Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-secondary p-6 rounded-2xl border border-slate-200 shadow-lg">
          <div className="text-text_muted text-sm font-bold uppercase mb-1">Total Unique Visitors</div>
          <div className="text-4xl font-extrabold text-text-main">{overview?.total_visitors || 0}</div>
        </div>
        <div className="bg-secondary p-6 rounded-2xl border border-slate-200 shadow-lg">
          <div className="text-text_muted text-sm font-bold uppercase mb-1">Total Page Views</div>
          <div className="text-4xl font-extrabold text-text-main">{overview?.total_page_views || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visitors Over Time Chart */}
        <div className="bg-secondary p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xl font-bold text-text-main mb-6">Visitor Traffic (Daily)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(str) => new Date(str).toLocaleDateString()}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Read Blogs Bar Chart */}
        <div className="bg-secondary p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xl font-bold text-text-main mb-6">Most Read Blogs</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostRead}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="blog"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `Blog ${val.substring(0, 4)}...`}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="total_reads" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Page View Table */}
        <div className="bg-secondary p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xl font-bold text-text-main mb-6">Top Pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-text_muted border-b border-slate-200">
                  <th className="pb-3 font-medium">Path</th>
                  <th className="pb-3 font-medium text-right">Views</th>
                </tr>
              </thead>
              <tbody className="text-text-main">
                {pageCounts.map((page, i) => (
                  <tr key={i} className="border-b border-slate-300 last:border-0">
                    <td className="py-3 font-mono text-xs">{page.path}</td>
                    <td className="py-3 text-right font-bold">{page.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Sessions List */}
        <div className="bg-secondary p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-xl font-bold text-text-main mb-6">Currently Active</h3>
          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <p className="text-text_muted text-sm italic">No active sessions at the moment.</p>
            ) : (
              activeSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-primary rounded-lg border border-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-xs text-text-main truncate max-w-[150px]">{session.current_page}</div>
                  </div>
                  <div className="text-[10px] text-text_muted">{session.location || 'Unknown'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
