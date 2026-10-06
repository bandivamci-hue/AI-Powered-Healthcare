import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Pill, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PublicNavbar = () => {
  const [language, setLanguage] = useState('English');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(sectionId);

    if (window.location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header 
      className="public-nav" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        width: '100%',
        background: theme === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: theme === 'dark' ? '1px solid #263244' : '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', padding: '0 7%', width: '100%', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Left: Brand Logo */}
        <Link to="/" onClick={(e) => scrollToSection(e, 'home')} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '38px',
            height: '38px',
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
          }}>
            <Pill size={20} style={{ transform: 'rotate(-45deg)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.1', letterSpacing: '-0.3px' }}>
              MediCare<span style={{ color: 'var(--primary-green)' }}> AI</span>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Your Medicine Assistant
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="public-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a 
            href="#home" 
            onClick={(e) => scrollToSection(e, 'home')}
            style={{ 
              color: activeSection === 'home' ? 'var(--primary-green)' : 'var(--text-secondary)', 
              fontWeight: activeSection === 'home' ? 800 : 600, 
              fontSize: '14.5px', 
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            Home
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            style={{ 
              color: activeSection === 'how-it-works' ? 'var(--primary-green)' : 'var(--text-secondary)', 
              fontWeight: activeSection === 'how-it-works' ? 800 : 600, 
              fontSize: '14.5px', 
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            How It Works
          </a>
          <a 
            href="#features" 
            onClick={(e) => scrollToSection(e, 'features')}
            style={{ 
              color: activeSection === 'features' ? 'var(--primary-green)' : 'var(--text-secondary)', 
              fontWeight: activeSection === 'features' ? 800 : 600, 
              fontSize: '14.5px', 
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            Features
          </a>
          <a 
            href="#about" 
            onClick={(e) => scrollToSection(e, 'about')}
            style={{ 
              color: activeSection === 'about' ? 'var(--primary-green)' : 'var(--text-secondary)', 
              fontWeight: activeSection === 'about' ? 800 : 600, 
              fontSize: '14.5px', 
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            About Us
          </a>
          <a 
            href="#contact" 
            onClick={(e) => scrollToSection(e, 'contact')}
            style={{ 
              color: activeSection === 'contact' ? 'var(--primary-green)' : 'var(--text-secondary)', 
              fontWeight: activeSection === 'contact' ? 800 : 600, 
              fontSize: '14.5px', 
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
          >
            Contact
          </a>
        </nav>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="btn-outline"
            aria-label="Toggle theme"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
              backgroundColor: theme === 'dark' ? '#172033' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="var(--text-secondary)" />}
          </button>

          {/* LANGUAGE SELECTOR */}
          <div className="flex items-center gap-1" style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '9px', border: '1px solid var(--border-subtle)', backgroundColor: theme === 'dark' ? '#172033' : 'rgba(255, 255, 255, 0.8)', color: 'var(--text-primary)' }}>
            <Globe size={14} color="var(--primary-green)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}
            >
              <option value="English">EN</option>
              <option value="Hindi">HI</option>
              <option value="Telugu">TE</option>
              <option value="Tamil">TA</option>
            </select>
          </div>

          {/* AUTH BUTTONS */}
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>Dashboard</Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '13px', backgroundColor: theme === 'dark' ? 'transparent' : 'rgba(255, 255, 255, 0.8)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '13px' }}>Sign Up</Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-public-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: theme === 'dark' ? '#0F172A' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <a href="#home" onClick={(e) => scrollToSection(e, 'home')} style={{ color: activeSection === 'home' ? 'var(--primary-green)' : 'var(--text-primary)', fontWeight: 700, fontSize: '14.5px', textDecoration: 'none' }}>Home</a>
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} style={{ color: activeSection === 'how-it-works' ? 'var(--primary-green)' : 'var(--text-primary)', fontWeight: 600, fontSize: '14.5px', textDecoration: 'none' }}>How It Works</a>
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')} style={{ color: activeSection === 'features' ? 'var(--primary-green)' : 'var(--text-primary)', fontWeight: 600, fontSize: '14.5px', textDecoration: 'none' }}>Features</a>
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')} style={{ color: activeSection === 'about' ? 'var(--primary-green)' : 'var(--text-primary)', fontWeight: 600, fontSize: '14.5px', textDecoration: 'none' }}>About Us</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} style={{ color: activeSection === 'contact' ? 'var(--primary-green)' : 'var(--text-primary)', fontWeight: 600, fontSize: '14.5px', textDecoration: 'none' }}>Contact</a>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
