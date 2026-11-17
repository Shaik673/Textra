"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Cpu,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Active link check
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = isAuthenticated
    ? [
        { href: "/studio", label: "Core Studio", badge: "Live" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/profile", label: "Profile" },
      ]
    : [
        { href: "/", label: "Home" },
      ];

  const homeHref = isAuthenticated ? "/studio" : "/";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Textra Logo" className="w-9 h-9 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-800 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                TEXTRA
              </span>
              <span className="text-[10px] text-zinc-400 -mt-1 font-medium">NLP Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded-full bg-indigo-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth & CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 bg-white/60 dark:bg-zinc-900/60 transition-all text-xs font-medium text-zinc-700 dark:text-zinc-200"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={logout}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>

                <Link
                  href="/auth/signup"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Get Started
                </Link>
              </>
            )}

            <Link
              href="/studio"
              className="ml-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 text-white hover:opacity-95 shadow-sm shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              Launch Studio
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.href)
                  ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500">
                  Signed in as <strong className="text-zinc-800 dark:text-zinc-200">{user.name}</strong>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-left px-3 py-2 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950"
                >
                  Get Started
                </Link>
              </>
            )}
            <Link
              href="/studio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white"
            >
              Launch Studio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
