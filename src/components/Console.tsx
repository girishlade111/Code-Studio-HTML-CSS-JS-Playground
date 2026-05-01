import { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Info,
  AlertTriangle,
  XCircle,
  Circle
} from 'lucide-react';
import { ConsoleLog } from '../types';

interface ConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
}

const icons = {
  log: Circle,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
};

export function Console({ logs, onClear }: ConsoleProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`console ${collapsed ? 'collapsed' : ''}`}>
      <div className="console-header">
        <button 
          className="console-title-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Terminal size={14} />
          Console
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button className="console-btn" onClick={onClear} title="Clear Console">
          <Trash2 size={14} />
        </button>
      </div>
      
      {!collapsed && (
        <div className="console-body">
          {logs.length === 0 ? (
            <div className="console-empty">
              <Info size={16} />
              Console ready. Type JavaScript to see output.
            </div>
          ) : (
            logs.map(log => {
              const Icon = icons[log.type];
              return (
                <div key={log.id} className={`console-log ${log.type}`}>
                  <Icon size={14} />
                  <span className="console-time">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="console-message">{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}