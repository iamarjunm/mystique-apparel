"use client";

import { Mail, Click, Eye, TrendingUp } from "lucide-react";

export default function EmailAnalytics({ stats = {} }) {
  const {
    totalSent = 0,
    totalOpened = 0,
    totalClicked = 0,
    openRate = 0,
    clickRate = 0,
  } = stats;

  const metrics = [
    {
      icon: Mail,
      label: "Emails Sent",
      value: totalSent,
      color: "blue",
      trend: null,
    },
    {
      icon: Eye,
      label: "Total Opens",
      value: totalOpened,
      color: "purple",
      trend: openRate ? `${openRate}%` : null,
    },
    {
      icon: Click,
      label: "Total Clicks",
      value: totalClicked,
      color: "green",
      trend: clickRate ? `${clickRate}%` : null,
    },
    {
      icon: TrendingUp,
      label: "Engagement Rate",
      value: `${Math.round((totalClicked / (totalOpened || 1)) * 100)}%` || "0%",
      color: "orange",
      trend: null,
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    orange: "bg-orange-500/20 border-orange-500/30 text-orange-400",
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">📊 Campaign Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const className = colorClasses[metric.color];

          return (
            <div
              key={idx}
              className={`border rounded p-4 ${className}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" />
                {metric.trend && (
                  <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                    {metric.trend}
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75">{metric.label}</p>
              <p className="text-2xl font-bold mt-1">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {totalSent === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-4 text-sm text-amber-300">
          <p className="font-semibold">📧 No campaigns sent yet</p>
          <p className="text-xs mt-1 opacity-75">
            Send your first campaign to see analytics here
          </p>
        </div>
      )}
    </div>
  );
}
