"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats]   = useState({ totalLeads: 0, activeLeads: 0, hotLeads: 0, closedWon: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [top,    setTop]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(data => {
        if (data.totalLeads !== undefined) {
          setStats({
            totalLeads:  data.totalLeads,
            activeLeads: data.activeLeads,
            hotLeads:    data.hotLeads,
            closedWon:   data.closedWon,
          });
          setRecent(data.recentLeads || []);
          setTop(data.topLeads     || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total leads",     value: stats.totalLeads,  icon: "👥" },
    { label: "Active pipeline", value: stats.activeLeads, icon: "📈" },
    { label: "Hot leads",       value: stats.hotLeads,    icon: "🔥" },
    { label: "Closed won",      value: stats.closedWon,   icon: "🏆" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            An overview of your pipeline and hottest opportunities.
          </p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
        >
          + Add lead
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{card.label}</p>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-semibold mt-2">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two column section */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Top scoring leads */}
        <div className="bg-white border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Top scoring leads</h2>
            <Link href="/leads" className="text-sm text-gray-500 hover:text-black">
              View all →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : top.length === 0 ? (
            <p className="text-sm text-gray-400">No active leads yet.</p>
          ) : (
            <div className="space-y-3">
              {top.map((lead: any) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.propertyInterest || "No property"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{lead.score}/100</p>
                    <p className={`text-xs font-medium capitalize ${
                      lead.priority === "high"   ? "text-red-600"    :
                      lead.priority === "medium" ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {lead.priority}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recently added */}
        <div className="bg-white border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Recently added</h2>
            <Link href="/leads" className="text-sm text-gray-500 hover:text-black">
              View all →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-gray-400">No leads yet. Add one to get started.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((lead: any) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                    <p className={`text-xs font-medium capitalize mt-0.5 ${
                      lead.priority === "high"   ? "text-red-600"    :
                      lead.priority === "medium" ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {lead.priority} priority
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}