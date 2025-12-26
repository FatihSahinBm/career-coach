import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const argsString = args.length > 0 ? ' ' + args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ') : '';
  return `[${timestamp}] [${level}] ${message}${argsString}`;
}

function writeToFile(message) {
  if (process.env.NODE_ENV === 'production') {
    fs.appendFileSync(logFile, message + '\n');
  }
}

export const logger = {
  info: (message, ...args) => {
    const formatted = formatMessage('INFO', message, ...args);
    console.log(formatted);
    writeToFile(formatted);
  },
  error: (message, ...args) => {
    const formatted = formatMessage('ERROR', message, ...args);
    console.error(formatted);
    writeToFile(formatted);
  },
  warn: (message, ...args) => {
    const formatted = formatMessage('WARN', message, ...args);
    console.warn(formatted);
    writeToFile(formatted);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      const formatted = formatMessage('DEBUG', message, ...args);
      console.debug(formatted);
    }
  }
};
