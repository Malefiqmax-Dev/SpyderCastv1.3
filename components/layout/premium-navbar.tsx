"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, X, User, LogOut, Shield, Settings, Menu, Home, Film, Tv, Calendar, List, MessageSquare, Radio } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { ProfileSettingsModal } from "@/components/auth/profile-settings-modal"
import { UserAvatar } from "@/components/auth/user-avatar"
import { SearchResultsDropdown } from "@/components/search/search-results-dropdown"
import "./premium-navbar.css"

const NAV_ITEMS = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Film", href: "/movies", icon: Film },
  { name: "Séries", href: "/tv", icon: Tv },
  { name: "Calendrier", href: "/calendar", icon: Calendar },
  { name: "Genres", href: "/genres", icon: List },
  { name: "Demandes", href: "/requests", icon: MessageSquare },
  { name: "Live TV", href: "/live-sport", icon: Radio },
]

export function PremiumNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
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
      setSearchQuery("")
      setSearchOpen(false)
    }
  }

  return (
    <>
      <nav className={`premium-navbar-nav ${scrolled ? "premium-navbar-nav-scrolled" : "premium-navbar-nav-default"}`}>
        <div className={`premium-navbar-inner ${scrolled ? "premium-navbar-inner-scrolled" : "premium-navbar-inner-default"}`}>
          <div className="premium-navbar-left-group">
            <Link href="/" className="premium-navbar-logo-link">
              <span className="premium-navbar-logo-text">
                Spyder<span className="premium-navbar-logo-accent">Cast</span>
              </span>
            </Link>

            <div className="premium-navbar-nav-links-desktop">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`premium-navbar-nav-link ${isActive ? "premium-navbar-nav-link-active" : "premium-navbar-nav-link-inactive"}`}
                  >
                    <span className="premium-navbar-nav-link-text">{item.name}</span>
                    {isActive && <div className="premium-navbar-nav-link-indicator-active" />}
                    {!isActive && <div className="premium-navbar-nav-link-indicator-hover" />}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="premium-navbar-right-side">
            <div className="premium-navbar-search-desktop">
              <form onSubmit={handleSearch} className="premium-navbar-search-form">
                <Search className="premium-navbar-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="premium-navbar-search-input"
                />
              </form>
              <SearchResultsDropdown query={searchQuery} onClose={() => setSearchQuery("")} />
            </div>

            <div className="premium-navbar-search-mobile">
              {searchOpen ? (
                <div className="premium-navbar-search-mobile-open">
                  <form onSubmit={handleSearch} className="premium-navbar-search-form">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      autoFocus
                      className="premium-navbar-search-mobile-input"
                    />
                    <SearchResultsDropdown query={searchQuery} onClose={() => { setSearchQuery(""); setSearchOpen(false) }} />
                  </form>
                  <button type="button" onClick={() => setSearchOpen(false)} className="premium-navbar-search-close-btn">
                    <X className="premium-navbar-icon-md" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setSearchOpen(true)} className="premium-navbar-search-open-btn">
                  <Search className="premium-navbar-icon-md" />
                </button>
              )}
            </div>

            {user ? (
              <div className="premium-navbar-user-menu" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="premium-navbar-avatar-btn"
                >
                  <UserAvatar
                    avatarIconId={user.avatarIconId}
                    avatarUrl={user.avatarUrl}
                    username={user.username}
                    size="sm"
                  />
                </button>
                {dropdownOpen && (
                  <div className="premium-navbar-dropdown">
                    <div className="premium-navbar-dropdown-header">
                      <p className="premium-navbar-dropdown-username" style={{ color: user.nameColor }}>{user.username}</p>
                      <p className="premium-navbar-dropdown-email">{user.email}</p>
                      {isOwner && <span className="premium-navbar-admin-badge">Admin</span>}
                    </div>
                    <div className="premium-navbar-dropdown-actions">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="premium-navbar-dropdown-btn">
                        <User className="premium-navbar-dropdown-icon" /> Mon profil
                      </Link>
                      <button type="button" onClick={() => { setSettingsOpen(true); setDropdownOpen(false) }} className="premium-navbar-dropdown-btn">
                        <Settings className="premium-navbar-dropdown-icon" /> Paramètres
                      </button>
                      {isOwner && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="premium-navbar-dropdown-admin-link">
                          <Shield className="premium-navbar-dropdown-icon" /> Administration
                        </Link>
                      )}
                      <button type="button" onClick={async () => { await signOut(); setDropdownOpen(false) }} className="premium-navbar-dropdown-logout-btn">
                        <LogOut className="premium-navbar-dropdown-icon" /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => setAuthOpen(true)} className="premium-navbar-login-btn">
                <User className="premium-navbar-dropdown-icon" />
                <span className="premium-navbar-login-btn-text">Connexion</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="premium-navbar-mobile-menu-toggle"
            >
              {menuOpen ? <X className="premium-navbar-icon-lg" /> : <Menu className="premium-navbar-icon-lg" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="premium-navbar-mobile-menu">
            <div className="premium-navbar-mobile-menu-inner">
              {user && (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="premium-navbar-mobile-nav-link premium-navbar-mobile-nav-link-inactive">
                    Mon profil
                  </Link>
                  <button type="button" onClick={() => { setSettingsOpen(true); setMenuOpen(false) }} className="premium-navbar-mobile-nav-link premium-navbar-mobile-nav-link-inactive">
                    Parametres
                  </button>
                </>
              )}
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`premium-navbar-mobile-nav-link ${isActive ? "premium-navbar-mobile-nav-link-active" : "premium-navbar-mobile-nav-link-inactive"}`}
                  >
                    <Icon className="premium-navbar-mobile-nav-icon" />
                    <span>{item.name}</span>
                    {isActive && <div className="premium-navbar-mobile-nav-dot" />}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <ProfileSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
