export type FileType = 'html' | 'css' | 'js';

export interface File {
  name: string;
  type: FileType;
  content: string;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}