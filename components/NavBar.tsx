
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Truck, Menu, X, Sparkles, Layout, BookOpen, Brain, ArrowRight, Code2, BarChart3 } from 'lucide-react';
import { CodeViewerModal } from './CodeViewerModal';

export const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  // Close menu on navigation or window resize
  useEffect(() => {
    closeMenu();
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) closeMenu();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Inicio', href: '/', icon: <Layout size={18} /> },
    { name: 'Herramientas AI', href: '/tools', icon: <Sparkles size={18} /> },
    { name: 'Dashboard KPI', href: '/dashboard', icon: <BarChart3 size={18} /> },
    { name: 'Consultor Expert', href: '/consultant', icon: <Brain size={18} /> },
    { name: 'Programa', href: '/program', icon: <BookOpen size={18} /> },
  ];

  const activeStyle = "text-brand-600 bg-brand-50/80 md:bg-transparent";
  const inactiveStyle = "text-slate-600 hover:text-brand-600 hover:bg-slate-50 md:hover:bg-transparent";

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            to="/"
            className="flex items-center space-x-2 group cursor-pointer" 
          >
            <div className="bg-brand-600 p-2 rounded-lg text-white group-hover:bg-brand-700 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-brand-500/20">
              <Truck size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              MF1012 <span className="text-brand-600 group-hover:text-brand-700">Logística AI</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.href} 
                className={({ isActive }) => `relative flex items-center gap-2 py-2 px-3 text-sm font-bold transition-all duration-300 rounded-xl group ${isActive ? activeStyle : inactiveStyle}`}
              >
                {link.icon}
                <span className="relative z-10">{link.name}</span>
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-600 transform origin-center transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100 group-[.active]:scale-x-100 opacity-0 group-hover:opacity-100 group-[.active]:opacity-100" />
              </NavLink>
            ))}
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button 
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-md"
            >
              <Code2 size={16} />
              Código Completo
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90" 
            onClick={toggleMenu}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar (Drawer) */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop Overlay with separate transition for smoothness */}
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-700 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />

        {/* Side Panel with refined sliding easing */}
        <div className={`absolute right-0 inset-y-0 w-[85%] max-w-[320px] bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/20">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-1.5 rounded-lg text-white shadow-lg shadow-brand-500/20">
                <Truck size={18} />
              </div>
              <span className="font-black text-slate-900 tracking-tight text-sm uppercase">Navegación</span>
            </div>
            <button 
              onClick={closeMenu}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links with improved staggered animations */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 py-8">
            {navLinks.map((link, index) => (
              <NavLink 
                key={link.name} 
                to={link.href} 
                className={({ isActive }) => `flex items-center justify-between px-5 py-4 font-bold rounded-2xl transition-all active:scale-[0.97] group ${isActive ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100' : 'text-slate-600 hover:bg-slate-50'}`}
                onClick={closeMenu}
                style={{ 
                  transitionDelay: isOpen ? `${index * 60 + 150}ms` : '0ms',
                  transform: isOpen ? 'translateX(0)' : 'translateX(40px)',
                  opacity: isOpen ? '1' : '0',
                  transitionProperty: 'transform, opacity',
                  transitionDuration: '0.5s, 0.5s',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1), ease-out'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${location.pathname === link.href ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    {link.icon}
                  </div>
                  <span className="text-[15px] tracking-tight">{link.name}</span>
                </div>
                <ArrowRight size={16} className={`transition-all duration-300 ${location.pathname === link.href ? 'translate-x-0 opacity-100 text-brand-500' : '-translate-x-4 opacity-0 group-hover:opacity-40 group-hover:translate-x-0'}`} />
              </NavLink>
            ))}
            
            <div className="my-4 border-t border-slate-100 pt-4">
              <button 
                onClick={() => {
                  closeMenu();
                  setIsCodeModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-5 py-4 font-bold rounded-2xl transition-all active:scale-[0.97] bg-slate-900 text-white shadow-md"
                style={{ 
                  transitionDelay: isOpen ? `${navLinks.length * 60 + 150}ms` : '0ms',
                  transform: isOpen ? 'translateX(0)' : 'translateX(40px)',
                  opacity: isOpen ? '1' : '0',
                  transitionProperty: 'transform, opacity',
                  transitionDuration: '0.5s, 0.5s',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1), ease-out'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 text-white">
                    <Code2 size={18} />
                  </div>
                  <span className="text-[15px] tracking-tight">Código Completo</span>
                </div>
              </button>
            </div>
          </div>

          {/* Drawer Footer with subtle entry */}
          <div 
            className="p-8 border-t border-slate-50 bg-slate-50/80 transition-all duration-700 delay-500"
            style={{ 
              opacity: isOpen ? '1' : '0',
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Plataforma Logística</p>
                <div className="text-sm font-black text-slate-900">MF1012 AI PRO <span className="text-brand-600">v3.0</span></div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Smoother easing function for premium feel */
        .cubic-bezier(0.4, 0, 0.2, 1) {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Custom scrollbar for mobile drawer */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>

      <CodeViewerModal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} />
    </>
  );
};
