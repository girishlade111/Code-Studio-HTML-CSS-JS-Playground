import { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import {
  Files,
  Search,
  GitBranch,
  Play,
  Settings,
  User,
  Bell,
  ChevronDown,
  ChevronRight,
  X,
  Terminal,
  AlertCircle,
  CheckCircle,
  Code2,
  Trash2,
  Sun,
  Moon,
  Download,
  FilePlus,
  FolderOpen,
  Save,
  RefreshCw,
  MoreHorizontal,
  SplitSquareHorizontal,
  Maximize2
} from 'lucide-react';
import type { ConsoleLog, Toast } from './types';
import { useTheme } from './hooks/useTheme';
import { useCodeEditor } from './hooks/useCodeEditor';
import { exportProject } from './utils/export';
import './App.css';

type FileKey = 'html' | 'css' | 'js';

const FILE_META: Record<FileKey, { name: string; color: string; icon: string }> = {
  html: { name: 'index.html', color: '#e34c26', icon: 'html' },
  css: { name: 'styles.css', color: '#264de4', icon: 'css' },
  js: { name: 'script.js', color: '#f7df1e', icon: 'js' }
};

function FileIcon({ type }: { type: FileKey }) {
  const color = FILE_META[type].color;
  const label = type.toUpperCase();
  return (
    <span className="file-icon" style={{ background: color }}>
      {label === 'JS' ? 'JS' : label === 'CSS' ? '#' : '<>'}
    </span>
  );
}

function App() {
  const { toggleTheme, isDark } = useTheme();
  const {
    html,
    css,
    js,
    activeFile,
    consoleLogs,
    setActiveFile,
    updateCode,
    newProject,
    addConsoleLog,
    clearConsole
  } = useCodeEditor();

  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [openTabs, setOpenTabs] = useState<FileKey[]>(['html', 'css', 'js']);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [folderOpen, setFolderOpen] = useState(true);
  const [bottomPanel, setBottomPanel] = useState<'console' | 'preview' | 'problems'>('console');
  const [activitySection, setActivitySection] = useState<'explorer' | 'search' | 'git' | 'run'>('explorer');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleEditorMount = useCallback((editor: Monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, column: e.position.column });
    });
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      updateCode(activeFile, value);
    }
  }, [activeFile, updateCode]);

  const handleNew = useCallback(() => {
    if (window.confirm('Create new project? Unsaved changes will be lost.')) {
      newProject();
      showToast('New project created', 'success');
    }
  }, [newProject, showToast]);

  const handleOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSave = useCallback(() => {
    showToast('Project saved', 'success');
  }, [showToast]);

  const handleExport = useCallback(async () => {
    try {
      const msg = await exportProject(html, css, js);
      showToast(msg, 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  }, [html, css, js, showToast]);

  const handleFormat = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
    showToast('Code formatted', 'success');
  }, [showToast]);

  const handleClear = useCallback(() => {
    clearConsole();
    showToast('Console cleared', 'info');
  }, [clearConsole, showToast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'html') updateCode('html', content);
        else if (ext === 'css') updateCode('css', content);
        else if (ext === 'js') updateCode('js', content);
        showToast(`Loaded ${file.name}`, 'success');
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  }, [updateCode, showToast]);

  const openFile = (key: FileKey) => {
    if (!openTabs.includes(key)) setOpenTabs(prev => [...prev, key]);
    setActiveFile(key);
  };

  const closeTab = (e: React.MouseEvent, key: FileKey) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== key);
    setOpenTabs(newTabs);
    if (activeFile === key && newTabs.length > 0) {
      setActiveFile(newTabs[newTabs.length - 1]);
    }
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'console') {
        addConsoleLog(e.data.method as ConsoleLog['type'], e.data.args.join(' '));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addConsoleLog]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'n') {
          e.preventDefault();
          handleNew();
        } else if (e.key === 'e') {
          e.preventDefault();
          handleExport();
        } else if (e.key === 'b') {
          e.preventDefault();
          setExplorerOpen(prev => !prev);
        } else if (e.key === '`') {
          e.preventDefault();
          setBottomPanel('console');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleNew, handleExport]);

  const currentCode = activeFile === 'html' ? html : activeFile === 'css' ? css : js;
  const language = activeFile === 'html' ? 'html' : activeFile === 'css' ? 'css' : 'javascript';

  const previewContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${css}</style>
    </head>
    <body>
      ${html}
      <script>
        (function() {
          const originalLog = console.log;
          const originalInfo = console.info;
          const originalWarn = console.warn;
          const originalError = console.error;

          function sendToParent(type, args) {
            window.parent.postMessage({
              type: 'console',
              method: type,
              args: Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a))
            }, '*');
          }

          console.log = function() { sendToParent('log', arguments); originalLog.apply(console, arguments); };
          console.info = function() { sendToParent('info', arguments); originalInfo.apply(console, arguments); };
          console.warn = function() { sendToParent('warn', arguments); originalWarn.apply(console, arguments); };
          console.error = function() { sendToParent('error', arguments); originalError.apply(console, arguments); };

          window.onerror = function(msg) {
            sendToParent('error', [msg]);
          };
        })();

        try {
          ${js}
        } catch(e) {
          console.error(e.message);
        }
      <\/script>
    </body>
    </html>
  `;

  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.close();
      }
    } catch {
      iframe.srcdoc = previewContent;
    }
  }, [previewContent]);

  // Update preview on code change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [updatePreview]);

  // Initial render
  useEffect(() => {
    if (iframeRef.current) {
      updatePreview();
    }
  }, []);

  return (
    <div className="vscode-shell">
      {/* Title Bar */}
      <header className="title-bar">
        <div className="title-bar-left">
          <div className="window-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0098FF">
              <path d="M16.5 2.5l-13 9 4 3 12-11.5-3-.5zm0 19l-9-7 4-3 8 9-3 1z"/>
            </svg>
          </div>
          <nav className="menu-bar">
            <button className="menu-item">File</button>
            <button className="menu-item">Edit</button>
            <button className="menu-item">Selection</button>
            <button className="menu-item">View</button>
            <button className="menu-item">Go</button>
            <button className="menu-item">Run</button>
            <button className="menu-item">Terminal</button>
            <button className="menu-item">Help</button>
          </nav>
        </div>
        <div className="title-bar-center">
          <span className="search-bar-mini">
            <Search size={12} />
            Code Studio — Web Playground
          </span>
        </div>
        <div className="title-bar-right">
          <button className="window-btn" title="Minimize">─</button>
          <button className="window-btn" title="Maximize"><Maximize2 size={10} /></button>
          <button className="window-btn close" title="Close"><X size={12} /></button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="vscode-body">
        {/* Activity Bar */}
        <aside className="activity-bar">
          <div className="activity-top">
            <button
              className={`activity-btn ${activitySection === 'explorer' ? 'active' : ''}`}
              onClick={() => { setActivitySection('explorer'); setExplorerOpen(true); }}
              title="Explorer (Ctrl+Shift+E)"
            >
              <Files size={22} />
            </button>
            <button
              className={`activity-btn ${activitySection === 'search' ? 'active' : ''}`}
              onClick={() => setActivitySection('search')}
              title="Search (Ctrl+Shift+F)"
            >
              <Search size={22} />
            </button>
            <button
              className={`activity-btn ${activitySection === 'git' ? 'active' : ''}`}
              onClick={() => setActivitySection('git')}
              title="Source Control (Ctrl+Shift+G)"
            >
              <GitBranch size={22} />
            </button>
            <button
              className={`activity-btn ${activitySection === 'run' ? 'active' : ''}`}
              onClick={() => setActivitySection('run')}
              title="Run and Debug (Ctrl+Shift+D)"
            >
              <Play size={22} />
            </button>
          </div>
          <div className="activity-bottom">
            <button className="activity-btn" title="Accounts">
              <User size={22} />
            </button>
            <button className="activity-btn" onClick={toggleTheme} title="Toggle Theme">
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button className="activity-btn" title="Settings">
              <Settings size={22} />
            </button>
          </div>
        </aside>

        {/* Side Bar (Explorer) */}
        {explorerOpen && (
          <aside className="side-bar">
            <div className="side-bar-header">
              <span>Explorer</span>
              <div className="side-bar-actions">
                <button className="icon-btn" title="New File" onClick={handleNew}>
                  <FilePlus size={14} />
                </button>
                <button className="icon-btn" title="Open File" onClick={handleOpen}>
                  <FolderOpen size={14} />
                </button>
                <button className="icon-btn" title="More Actions">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            <div className="explorer-section">
              <button
                className="folder-row"
                onClick={() => setFolderOpen(o => !o)}
              >
                {folderOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="folder-name">CODE-STUDIO</span>
              </button>

              {folderOpen && (
                <div className="folder-children">
                  {(Object.keys(FILE_META) as FileKey[]).map(key => (
                    <button
                      key={key}
                      className={`file-row ${activeFile === key ? 'active' : ''}`}
                      onClick={() => openFile(key)}
                    >
                      <FileIcon type={key} />
                      <span className="file-name">{FILE_META[key].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="explorer-section outline">
              <button className="folder-row">
                <ChevronRight size={14} />
                <span className="folder-name">OUTLINE</span>
              </button>
            </div>
            <div className="explorer-section outline">
              <button className="folder-row">
                <ChevronRight size={14} />
                <span className="folder-name">TIMELINE</span>
              </button>
            </div>
          </aside>
        )}

        {/* Editor + Panel Group */}
        <main className="editor-group">
          {/* Tab Bar */}
          <div className="tab-bar">
            <div className="tabs">
              {openTabs.map(key => (
                <button
                  key={key}
                  className={`tab ${activeFile === key ? 'active' : ''}`}
                  onClick={() => setActiveFile(key)}
                >
                  <FileIcon type={key} />
                  <span className="tab-name">{FILE_META[key].name}</span>
                  <span
                    className="tab-close"
                    onClick={(e) => closeTab(e, key)}
                  >
                    <X size={14} />
                  </span>
                </button>
              ))}
            </div>
            <div className="tab-actions">
              <button className="icon-btn" onClick={handleFormat} title="Format Code">
                <Code2 size={16} />
              </button>
              <button className="icon-btn" onClick={updatePreview} title="Refresh Preview">
                <RefreshCw size={16} />
              </button>
              <button className="icon-btn" onClick={handleSave} title="Save (Ctrl+S)">
                <Save size={16} />
              </button>
              <button className="icon-btn" onClick={handleExport} title="Export (Ctrl+E)">
                <Download size={16} />
              </button>
              <button className="icon-btn" title="Split Editor">
                <SplitSquareHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span className="crumb">code-studio</span>
            <ChevronRight size={12} />
            <span className="crumb">
              <FileIcon type={activeFile} />
              {FILE_META[activeFile].name}
            </span>
          </div>

          {/* Editor */}
          <div className="editor-container">
            <div className="editor-pane">
              <Editor
                height="100%"
                language={language}
                value={currentCode}
                theme={isDark ? 'vs-dark' : 'vs'}
                onMount={handleEditorMount}
                onChange={handleCodeChange}
                options={{
                  fontSize: 13,
                  fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
                  fontLigatures: true,
                  minimap: { enabled: true, scale: 1 },
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: true,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'off',
                  padding: { top: 8 },
                  renderLineHighlight: 'all',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  bracketPairColorization: { enabled: true },
                  guides: { indentation: true, bracketPairs: true },
                  scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontalScrollbarSize: 14
                  }
                }}
              />
            </div>

            {/* Live Preview Pane */}
            <div className="preview-pane">
              <div className="pane-header">
                <span className="pane-title">PREVIEW</span>
                <button className="icon-btn" onClick={updatePreview} title="Reload">
                  <RefreshCw size={14} />
                </button>
              </div>
              <iframe
                ref={iframeRef}
                className="preview-frame"
                title="Preview"
                sandbox="allow-scripts"
                srcDoc={previewContent}
              />
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="bottom-panel">
            <div className="panel-tabs">
              <button
                className={`panel-tab ${bottomPanel === 'problems' ? 'active' : ''}`}
                onClick={() => setBottomPanel('problems')}
              >
                PROBLEMS <span className="badge">0</span>
              </button>
              <button
                className={`panel-tab ${bottomPanel === 'console' ? 'active' : ''}`}
                onClick={() => setBottomPanel('console')}
              >
                OUTPUT
              </button>
              <button
                className={`panel-tab terminal ${bottomPanel === 'preview' ? 'active' : ''}`}
                onClick={() => setBottomPanel('preview')}
              >
                DEBUG CONSOLE
              </button>
              <button className="panel-tab active-only">
                TERMINAL
              </button>
              <div className="panel-spacer" />
              <button className="icon-btn" onClick={handleClear} title="Clear">
                <Trash2 size={14} />
              </button>
              <button className="icon-btn" title="Close Panel">
                <X size={14} />
              </button>
            </div>
            <div className="panel-body">
              {consoleLogs.length === 0 ? (
                <div className="console-empty">
                  <Terminal size={14} />
                  <span>&gt; Console ready. Run code to see output.</span>
                </div>
              ) : (
                consoleLogs.map((log) => (
                  <div key={log.id} className={`console-line ${log.type}`}>
                    <span className="console-prefix">
                      {log.type === 'error' ? '✖' : log.type === 'warn' ? '⚠' : '›'}
                    </span>
                    <span className="console-message">{log.message}</span>
                    <span className="console-time">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-left">
          <span className="status-item highlight">
            <GitBranch size={12} />
            main
          </span>
          <span className="status-item">
            <RefreshCw size={12} /> 0 ↓ 0 ↑
          </span>
          <span className="status-item">
            <AlertCircle size={12} /> 0
          </span>
          <span className="status-item">
            <CheckCircle size={12} /> 0
          </span>
        </div>
        <div className="status-right">
          <span className="status-item">Ln {cursorPos.line}, Col {cursorPos.column}</span>
          <span className="status-item">Spaces: 2</span>
          <span className="status-item">UTF-8</span>
          <span className="status-item">LF</span>
          <span className="status-item">{language === 'javascript' ? 'JavaScript' : language.toUpperCase()}</span>
          <span className="status-item">
            <Bell size={12} />
          </span>
        </div>
      </footer>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".html,.css,.js"
        onChange={handleFileChange}
      />

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast ${toast.type}`}
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Bell size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
