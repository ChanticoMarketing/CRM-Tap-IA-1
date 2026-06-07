"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface AppNavigationProps {
  activeTab: "dashboard" | "clients" | "campaigns" | "insights" | "billing" | "settings";
}

export default function AppNavigation({ activeTab }: AppNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTabClass = (tab: string) => {
    const base = "flex items-center gap-3 py-3 px-6 transition-all duration-200 outline-none focus-visible:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset";
    if (activeTab === tab) {
      // Premium focus/active visual: Midnight vertical left border, no shrinking scale
      return `${base} text-primary border-l-[3px] border-primary font-semibold bg-surface-container-low`;
    }
    return `${base} text-on-surface-variant font-medium hover:bg-surface-container hover:translate-x-0.5`;
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/" },
    { id: "clients", label: "Clients", icon: "group", href: "/clients" },
    { id: "campaigns", label: "Campaigns", icon: "campaign", href: "/campaigns" },
    { id: "insights", label: "Insights", icon: "analytics", href: "/insights" },
    { id: "billing", label: "Billing", icon: "payments", href: "/billing" },
    { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
  ] as const;

  return (
    <>
      {/* 1. MOBILE RESPONSIVE HEADER (Visible on viewport < 768px / md) */}
      <header className="md:hidden flex justify-between items-center w-full px-margin-mobile h-20 border-b border-outline-variant bg-surface sticky top-0 z-40">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold text-on-surface tracking-tight">
          Avenue
        </h1>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <button 
            type="button"
            className="hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Search Dashboard"
          >
            <span className="material-symbols-outlined leading-none" aria-hidden="true">search</span>
          </button>
          <button 
            type="button"
            className="hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open Navigation Menu"
            onClick={() => setIsOpen(true)}
          >
            <span className="material-symbols-outlined leading-none" aria-hidden="true">menu</span>
          </button>
        </div>
      </header>

      {/* 2. MOBILE SIDEBAR DRAWER OVERLAY (Portal effect) */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay blur */}
        <div 
          className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Sliding navigation drawer */}
        <nav 
          aria-label="Mobile Navigation Menu"
          className={`absolute top-0 left-0 bottom-0 w-72 bg-surface border-r border-outline-variant flex flex-col py-8 shadow-2xl transition-transform duration-300 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header row in mobile navigation drawer */}
          <div className="px-6 mb-8 flex justify-between items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface">Avenue CRM</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Agency v2.4</p>
            </div>
            <button 
              type="button"
              className="p-2 rounded-full hover:bg-surface-container outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close Navigation Menu"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined leading-none" aria-hidden="true">close</span>
            </button>
          </div>

          {/* Links navigation list */}
          <div className="flex flex-col gap-1 w-full flex-grow">
            {tabs.map((tab) => (
              <Link 
                key={tab.id}
                className={getTabClass(tab.id)} 
                href={tab.href}
                aria-current={activeTab === tab.id ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                <span 
                  className={`material-symbols-outlined leading-none ${activeTab === tab.id ? "material-symbols-filled" : ""}`}
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
                <span className="font-label-md text-label-md">{tab.label}</span>
              </Link>
            ))}
          </div>

          {/* User profile / Drawer footer */}
          <div className="px-6 mt-auto">
            <Link 
              href="/campaigns/new" 
              className="w-full bg-primary text-on-primary font-body-md text-body-md py-3 px-4 rounded flex items-center justify-center gap-2 hover:bg-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors outline-none font-medium"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined leading-none" aria-hidden="true">add</span> New Campaign
            </Link>
            <div className="mt-6 flex items-center gap-3 border-t border-outline-variant pt-5">
              <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant">
                <Image
                  alt="Agency Director Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG2KhAVrHoOxkwlzbXtRhp8Xi64-EO05wNdaim8Ah_RaXjhdtbQdXiAr7cfjZ2ZHZNZ78huYDsfgg1UmG4DLR41RZ0GksVjvOeFzcWydUXjfBl5wcZltydseaDDwld0okFh-i_2VDSACu7heuLZ7-HSKDldSObHF9yaNrUbK8BmVldCYPFuNRLCTvsxeHlImX2lDEUdEgx3k9Ma9wGapkosWAhl-z8pLHu7_kgmJZFgRs63WigygQHONjgf_21ro4drcIFneeo6W6G"
                  width={40}
                  height={40}
                  priority={false}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-body-md text-body-md font-semibold text-on-surface">E. Sterling</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">DIRECTOR</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* 3. DESKTOP SIDEBAR NAVIGATION (Visible on viewport >= 768px / md) */}
      <nav 
        aria-label="Main Navigation Menu" 
        className="docked h-screen w-64 left-0 top-0 border-r border-outline-variant bg-surface hidden md:flex flex-col py-8 z-50 sticky"
      >
        <div className="px-6 mb-12">
          <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight">
            Avenue CRM
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Marketing Agency v2.4
          </p>
        </div>

        <div className="flex flex-col gap-1.5 w-full flex-grow">
          {tabs.map((tab) => (
            <Link 
              key={tab.id}
              className={getTabClass(tab.id)} 
              href={tab.href}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <span 
                className={`material-symbols-outlined leading-none ${activeTab === tab.id ? "material-symbols-filled" : ""}`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              <span className="font-label-md text-label-md">{tab.label}</span>
            </Link>
          ))}
        </div>

        <div className="px-6 mt-auto">
          <Link 
            href="/campaigns/new" 
            className="w-full bg-primary text-on-primary font-body-md text-body-md py-3 px-4 rounded flex items-center justify-center gap-2 hover:bg-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors outline-none font-medium"
          >
            <span className="material-symbols-outlined leading-none" aria-hidden="true">add</span> New Campaign
          </Link>
          <div className="mt-6 flex items-center gap-3 border-t border-outline-variant pt-5">
            <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant">
              <Image
                alt="Agency Director Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG2KhAVrHoOxkwlzbXtRhp8Xi64-EO05wNdaim8Ah_RaXjhdtbQdXiAr7cfjZ2ZHZNZ78huYDsfgg1UmG4DLR41RZ0GksVjvOeFzcWydUXjfBl5wcZltydseaDDwld0okFh-i_2VDSACu7heuLZ7-HSKDldSObHF9yaNrUbK8BmVldCYPFuNRLCTvsxeHlImX2lDEUdEgx3k9Ma9wGapkosWAhl-z8pLHu7_kgmJZFgRs63WigygQHONjgf_21ro4drcIFneeo6W6G"
                width={40}
                height={40}
                priority={false}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-body-md text-body-md font-semibold text-on-surface">E. Sterling</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">DIRECTOR</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
