import { CheckCircle } from 'lucide-react';

interface StatusBarProps {
  line: number;
  column: number;
  fileType: string;
}

export function StatusBar({ line, column, fileType }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <div className="statusbar-left">
        <span className="status-item">
          <CheckCircle size={12} />
          Ready
        </span>
      </div>
      <div className="statusbar-right">
        <span className="status-item">Ln {line}, Col {column}</span>
        <span className="status-item">{fileType.toUpperCase()}</span>
        <span className="status-item">UTF-8</span>
      </div>
    </footer>
  );
}