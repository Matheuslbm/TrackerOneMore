type LogLevel = 'info' | 'debug' | 'warn' | 'error';

const colorMap: Record<LogLevel, string> = {
  info: '#3b82f6',
  debug: '#6366f1',
  warn: '#f59e0b',
  error: '#ef4444',
};

const emojiMap: Record<LogLevel, string> = {
  info: 'ℹ️',
  debug: '🔍',
  warn: '⚠️',
  error: '❌',
};

const log = (level: LogLevel, context: string, message: string, data?: any) => {
  if (!import.meta.env.DEV) return;
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const emoji = emojiMap[level];
  const color = colorMap[level];
  const prefix = '%c' + emoji + ' [' + timestamp + '] ' + context;
  const style = 'color: ' + color + '; font-weight: bold;';
  if (data) {
    console.log(prefix, style, message, data);
  } else {
    console.log(prefix, style, message);
  }
};

export default {
  info: (context: string, message: string, data?: any) => log('info', context, message, data),
  debug: (context: string, message: string, data?: any) => log('debug', context, message, data),
  warn: (context: string, message: string, data?: any) => log('warn', context, message, data),
  error: (context: string, message: string, data?: any) => log('error', context, message, data),
};
