import Link from "next/link";
import Image from "next/image";

interface SidebarProps {
  activeTab:
    | "dashboard"
    | "clients"
    | "leads"
    | "campaigns"
    | "insights"
    | "billing"
    | "settings";
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/" },
  { id: "clients",   label: "Clients",   icon: "group",     href: "/clients" },
  { id: "leads",     label: "Leads",     icon: "person_search", href: "/leads" },
  { id: "campaigns", label: "Campaigns", icon: "campaign",  href: "/campaigns" },
  { id: "insights",  label: "Insights",  icon: "analytics", href: "/insights" },
  { id: "billing",   label: "Billing",   icon: "payments",  href: "/billing" },
  { id: "settings",  label: "Settings",  icon: "settings",  href: "/settings" },
] as const;

export default function Sidebar({ activeTab }: SidebarProps) {
  return (
    <nav
      aria-label="Main Navigation"
      className="hidden md:flex flex-col h-screen w-64 shrink-0 sticky top-0 border-r border-outline-variant bg-surface"
    >
      {/* Logo / Brand */}
      <div className="px-6 py-8 mb-2">
        <h1 className="text-xl font-semibold text-on-surface tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}>
          Avenue CRM
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5"
           style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
          Marketing Agency
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 flex-grow px-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isActive
                  ? "bg-surface-container-low text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              ].join(" ")}
            >
              <span
                className={isActive ? "material-symbols-filled" : "material-symbols-outlined"}
                aria-hidden="true"
                style={{ fontSize: "20px" }}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom section: CTA + User */}
      <div className="px-3 pb-6 mt-auto">
        <Link
          href="/campaigns/new"
          className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary text-sm font-medium py-2.5 px-4 rounded-lg transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none mb-4"
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
            add
          </span>
          New Campaign
        </Link>

        <div className="flex items-center gap-3 border-t border-outline-variant pt-4">
          <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden border border-outline-variant shrink-0">
            <Image
              alt="E. Sterling — Agency Director"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG2KhAVrHoOxkwlzbXtRhp8Xi64-EO05wNdaim8Ah_RaXjhdtbQdXiAr7cfjZ2ZHZNZ78huYDsfgg1UmG4DLR41RZ0GksVjvOeFzcWydUXjfBl5wcZltydseaDDwld0okFh-i_2VDSACu7heuLZ7-HSKDldSObHF9yaNrUbK8BmVldCYPFuNRLCTvsxeHlImX2lDEUdEgx3k9Ma9wGapkosWAhl-z8pLHu7_kgmJZFgRs63WigygQHONjgf_21ro4drcIFneeo6W6G"
              width={36}
              height={36}
              priority={false}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-on-surface truncate"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
              E. Sterling
            </span>
            <span className="text-xs text-on-surface-variant tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)", fontSize: "10px" }}>
              Director
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
