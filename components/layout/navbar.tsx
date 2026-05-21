"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Menu, X, User, LogOut, Shield, Settings } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { ProfileSettingsModal } from "@/components/auth/profile-settings-modal"
import { UserAvatar } from "@/components/auth/user-avatar"
import { SearchResultsDropdown } from "@/components/search/search-results-dropdown"
import "./navbar.css"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [authOpen, setAuthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut, isOwner } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/movies", label: "Films" },
    { href: "/tv", label: "Séries" },
    { href: "/calendar", label: "Calendrier" },
    { href: "/genres", label: "Genres" },
    { href: "/requests", label: "Demandes" },
    { href: "/live-sport", label: "Live TV" },
  ]

  return (
    <>
      <nav className={`navbar-nav ${scrolled ? "navbar-nav-scrolled" : "navbar-nav-default"}`}>
        <div className={`navbar-inner ${scrolled ? "navbar-inner-scrolled" : "navbar-inner-default"}`}>
          <div className="navbar-left-zone">
            <Link href="/" className="navbar-logo-link">
              <span className="navbar-logo-text">
                Spyder<span className="navbar-logo-accent">Cast</span>
              </span>
            </Link>
          </div>

          <div className="navbar-center-nav">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-nav-link ${isActive ? "navbar-nav-link-active" : "navbar-nav-link-inactive"}`}
                >
                  <span className="navbar-nav-link-text">{link.label}</span>
                  {isActive && <div className="navbar-nav-link-indicator-active" />}
                  {!isActive && <div className="navbar-nav-link-indicator-hover" />}
                </Link>
              )
            })}
          </div>

          <div className="navbar-right-zone">
            <div className="navbar-search-desktop">
              <form onSubmit={handleSearch} className="navbar-search-form">
                <Search className="navbar-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="navbar-search-input"
                />
              </form>
              <SearchResultsDropdown
                query={searchQuery}
                onClose={() => { setSearchOpen(false); setSearchQuery("") }}
              />
            </div>

            <div className="navbar-search-mobile">
              {searchOpen ? (
                <div className="navbar-search-mobile-open">
                  <div className="navbar-search-mobile-form-wrap">
                    <form onSubmit={handleSearch}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        autoFocus
                        className="navbar-search-mobile-input"
                      />
                    </form>
                    <SearchResultsDropdown
                      query={searchQuery}
                      onClose={() => { setSearchOpen(false); setSearchQuery("") }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                    className="navbar-search-close-btn"
                  >
                    <X className="navbar-icon-sm" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setSearchOpen(true)} className="navbar-search-open-btn">
                  <Search className="navbar-icon-md" />
                </button>
              )}
            </div>

            {user ? (
              <div className="navbar-user-menu" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="navbar-avatar-btn"
                >
                  <UserAvatar
                    avatarIconId={user.avatarIconId}
                    avatarUrl={user.avatarUrl}
                    username={user.username}
                    size="sm"
                  />
                </button>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-username" style={{ color: user.nameColor }}>{user.username}</p>
                      <p className="navbar-dropdown-email">{user.email}</p>
                      {isOwner && <span className="navbar-admin-badge">Admin</span>}
                    </div>
                    <div className="navbar-dropdown-actions">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="navbar-dropdown-btn">
                        <User className="navbar-dropdown-icon" />
                        Mon profil
                      </Link>
                      <button type="button" onClick={() => { setSettingsOpen(true); setDropdownOpen(false) }} className="navbar-dropdown-btn">
                        <Settings className="navbar-dropdown-icon" />
                        Paramètres
                      </button>
                      {isOwner && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="navbar-dropdown-admin-link">
                          <Shield className="navbar-dropdown-icon" />
                          Administration
                        </Link>
                      )}
                      <button type="button" onClick={async () => { await signOut(); setDropdownOpen(false) }} className="navbar-dropdown-logout-btn">
                        <LogOut className="navbar-dropdown-icon" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => setAuthOpen(true)} className="navbar-login-btn">
                <User className="navbar-dropdown-icon" />
                <span className="navbar-login-btn-text">Connexion</span>
              </button>
            )}

            <button type="button" className="navbar-mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="navbar-icon-lg" /> : <Menu className="navbar-icon-lg" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-menu-inner">
              {user && (
                <div className="navbar-mobile-user-section">
                  <UserAvatar
                    avatarIconId={user.avatarIconId}
                    avatarUrl={user.avatarUrl}
                    username={user.username}
                    size="sm"
                  />
                  <div>
                    <p className="navbar-mobile-user-name" style={{ color: user.nameColor }}>{user.username}</p>
                    <p className="navbar-mobile-user-email">{user.email}</p>
                  </div>
                </div>
              )}
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`navbar-mobile-nav-link ${isActive ? "navbar-mobile-nav-link-active" : "navbar-mobile-nav-link-inactive"}`}
                  >
                    {link.label}
                    {isActive && <div className="navbar-mobile-nav-dot" />}
                  </Link>
                )
              })}
              {user && (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="navbar-mobile-settings-btn">
                    <User className="navbar-dropdown-icon" />
                    Mon profil
                  </Link>
                  <button type="button" onClick={() => { setSettingsOpen(true); setMenuOpen(false) }} className="navbar-mobile-settings-btn">
                    <Settings className="navbar-dropdown-icon" />
                    Parametres
                  </button>
                </>
              )}
              {isOwner && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="navbar-mobile-admin-link">
                  <Shield className="navbar-dropdown-icon" />
                  Administration
                </Link>
              )}
              {!user && (
                <button type="button" onClick={() => { setMenuOpen(false); setAuthOpen(true) }} className="navbar-mobile-login-btn">
                  Connexion / Inscription
                </button>
              )}
              {user && (
                <button type="button" onClick={async () => { await signOut(); setMenuOpen(false) }} className="navbar-mobile-logout-btn">
                  <LogOut className="navbar-dropdown-icon" />
                  Se deconnecter
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <ProfileSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
