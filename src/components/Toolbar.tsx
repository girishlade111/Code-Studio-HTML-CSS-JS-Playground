import { 
  FilePlus, 
  FolderOpen, 
  Download, 
  Save, 
  Code2, 
  Trash2,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  onFormat: () => void;
  onClear: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  loading?: boolean;
}

export function Toolbar({
  onNew,
  onOpen,
  onSave,
  onExport,
  onFormat,
  onClear,
  isDark,
  onToggleTheme,
  loading
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 8h10M7 12h6M7 16h8" />
        </svg>
        <span>Code Studio</span>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onNew} title="New Project (Ctrl+N)">
          <FilePlus size={16} />
          New
        </button>
        <button className="toolbar-btn" onClick={onOpen} title="Open Files">
          <FolderOpen size={16} />
          Open
        </button>
        <button className="toolbar-btn" onClick={onSave} title="Save (Ctrl+S)">
          <Save size={16} />
          Save
        </button>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onExport} title="Export (Ctrl+E)">
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="spacer" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onFormat} title="Format Code">
          <Code2 size={16} />
          Format
        </button>
        <button className="toolbar-btn" onClick={onClear} title="Clear Console">
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      <button 
        className="toolbar-btn theme-toggle-btn" 
        onClick={onToggleTheme}
        title={isDark ? 'Switch to Light' : 'Switch to Dark'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {loading && <Loader2 className="spinner" size={16} />}
    </header>
  );
}