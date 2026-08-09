import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Code2, Download } from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fetch all relevant source files using Vite's import.meta.glob
const sourceFiles = import.meta.glob([
  '../*.tsx',
  '../*.ts',
  '../components/*.tsx',
  '../services/*.ts',
  '../index.html',
  '../package.json',
  '../vite.config.ts'
], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const fileEntries = Object.entries(sourceFiles).map(([path, content]) => {
    // Clean up path to show just the relative part from root
    const cleanPath = path.replace('../', '');
    return { path: cleanPath, content };
  }).sort((a, b) => a.path.localeCompare(b.path));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (!selectedFile && fileEntries.length > 0) {
        setSelectedFile(fileEntries[0].path);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedFile, fileEntries]);

  if (!isOpen) return null;

  const handleCopyAll = () => {
    const allCode = fileEntries.map(file => `\n\n--- ${file.path} ---\n\`\`\`${file.path.split('.').pop()}\n${file.content}\n\`\`\``).join('');
    navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySingle = () => {
    const file = fileEntries.find(f => f.path === selectedFile);
    if (file) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentContent = fileEntries.find(f => f.path === selectedFile)?.content || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 tracking-tight">Código Completo</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Para comparar o exportar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-95 shadow-md shadow-brand-500/20"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '¡Copiado!' : 'Copiar Todo'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 overflow-y-auto custom-scrollbar p-4 space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Archivos</div>
            {fileEntries.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file.path)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${
                  selectedFile === file.path 
                    ? 'bg-brand-100 text-brand-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                {file.path}
              </button>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={handleCopySingle}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Copy size={12} /> Copiar Archivo
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
              <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                <code>{currentContent}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
