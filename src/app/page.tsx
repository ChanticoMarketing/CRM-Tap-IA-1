import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import DatabaseWarning from "@/components/DatabaseWarning";
import { formatMoney, getAgencyCurrency } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const getCampaignRows = () =>
    prisma.campaign.findMany({
      include: { client: true },
      orderBy: { updatedAt: "desc" },
    });
  const getActivityRows = () =>
    prisma.activity.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    });

  let dbError = false;
  let campaigns: Awaited<ReturnType<typeof getCampaignRows>> = [];
  let activities: Awaited<ReturnType<typeof getActivityRows>> = [];
  let currency = "USD";

  try {
    const [campaignRows, activityRows, agencyCurrency] = await Promise.all([
      getCampaignRows(),
      getActivityRows(),
      getAgencyCurrency(),
    ]);
    campaigns = campaignRows;
    activities = activityRows;
    currency = agencyCurrency;
  } catch {
    dbError = true;
  }

  const totalRevenue = campaigns.reduce((acc, curr) => acc + curr.spend, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "Running").length;
  const pendingApprovals = campaigns.filter((c) => c.status === "Needs Review").length;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Running":
        return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      case "Needs Review":
        return "bg-secondary-fixed text-on-secondary-fixed-variant";
      default:
        return "bg-surface-container-high text-on-surface-variant";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Running":      return "bg-on-tertiary-fixed-variant";
      case "Needs Review": return "bg-secondary";
      default:             return "bg-surface-tint";
    }
  };

  const getIndustryIcon = (industry: string | null) => {
    switch (industry) {
      case "Cosmetics":   return "apartment";
      case "Automotive":  return "directions_car";
      default:            return "chair";
    }
  };

  return (
    <>
      <Sidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <main
          id="main-content"
          className="flex-1 p-6 md:p-10 w-full max-w-screen-xl mx-auto"
        >
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2
                className="font-semibold text-on-surface tracking-tight mb-1"
                style={{
                  fontFamily: "var(--font-outfit, sans-serif)",
                  fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
                  lineHeight: 1.2,
                }}
              >
                Command Center
              </h2>
              <p className="text-sm text-on-surface-variant"
                 style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                Overview of current operations and active campaigns.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-outline-variant px-4 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
                download
              </span>
              Export Report
            </button>
          </div>

          {dbError && <DatabaseWarning />}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm mb-6">
            {[
              { label: "TOTAL REVENUE", value: formatMoney(totalRevenue, currency), color: "text-on-surface" },
              { label: "ACTIVE CAMPAIGNS", value: String(activeCampaigns), color: "text-on-surface" },
              { label: "CLIENT RETENTION", value: "94%", color: "text-on-surface" },
              { label: "PENDING APPROVALS", value: String(pendingApprovals), color: "text-secondary", last: true },
            ].map((kpi, i) => (
              <div
                key={i}
                className={`flex flex-col px-6 py-6 ${
                  i < 3 ? "border-r border-outline-variant" : ""
                } ${i < 2 ? "border-b border-outline-variant md:border-b-0" : ""}`}
              >
                <span
                  className="text-on-surface-variant font-semibold tracking-widest uppercase mb-2"
                  style={{ fontSize: "10px", fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                >
                  {kpi.label}
                </span>
                <span
                  className={`font-bold tracking-tight ${kpi.color}`}
                  style={{
                    fontFamily: "var(--font-outfit, sans-serif)",
                    fontSize: "clamp(1.5rem, 2vw, 2rem)",
                    lineHeight: 1.1,
                  }}
                >
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Main Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Active Campaigns Table */}
            <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="font-semibold text-on-surface tracking-tight"
                  style={{
                    fontFamily: "var(--font-outfit, sans-serif)",
                    fontSize: "1.125rem",
                  }}
                >
                  Active Campaigns
                </h3>
                <Link
                  href="/campaigns"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      {["CLIENT / PROJECT", "STATUS", "SPEND", "ROAS"].map((h, i) => (
                        <th
                          key={h}
                          className={`pb-3 font-semibold tracking-widest text-on-surface-variant uppercase whitespace-nowrap ${
                            i >= 2 ? "text-right" : ""
                          }`}
                          style={{ fontSize: "10px", fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className="border-b border-outline-variant hover:bg-surface-container-low/60 transition-colors"
                      >
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant shrink-0"
                              aria-hidden="true"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                {getIndustryIcon(campaign.client.industry)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-on-surface leading-tight">
                                <Link
                                  href={`/clients?id=${campaign.client.id}`}
                                  className="hover:text-primary transition-colors outline-none focus-visible:underline"
                                >
                                  {campaign.client.name}
                                </Link>
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {campaign.project}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded font-semibold tracking-wide uppercase ${getStatusStyles(campaign.status)}`}
                            style={{ fontSize: "10px" }}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${getStatusDot(campaign.status)}`}
                              aria-hidden="true"
                            />
                            {campaign.status}
                          </span>
                        </td>
                        <td
                          className="py-3.5 text-right text-sm font-medium text-on-surface tabular-nums"
                          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                        >
                          {formatMoney(campaign.spend, currency)}
                        </td>
                        <td
                          className="py-3.5 text-right text-sm font-medium text-on-surface tabular-nums"
                          style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                        >
                          {campaign.roas ? `${campaign.roas}x` : "—"}
                        </td>
                      </tr>
                    ))}
                    {campaigns.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-sm text-on-surface-variant">
                          No campaigns available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 md:p-8 flex flex-col">
              <h3
                className="font-semibold text-on-surface tracking-tight mb-5"
                style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "1.125rem" }}
              >
                Activity Feed
              </h3>

              <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1 scrollbar-thin flex-1">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 shrink-0" aria-hidden="true">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "alert" ? "bg-secondary" : "bg-outline-variant"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm text-on-surface leading-snug"
                        style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                      >
                        <span className="font-semibold">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        <span className="font-semibold">{activity.target}</span>.
                      </p>
                      <time
                        className="text-on-surface-variant mt-1 block tabular-nums"
                        style={{
                          fontFamily: "var(--font-jetbrains, monospace)",
                          fontSize: "11px",
                        }}
                        suppressHydrationWarning
                      >
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {new Date(activity.timestamp).toDateString() !==
                          new Date().toDateString()
                          ? ` · ${new Date(activity.timestamp).toLocaleDateString()}`
                          : ""}
                      </time>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-sm text-on-surface-variant">No recent activity.</p>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
