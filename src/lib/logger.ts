// Simple logger that overrides console based on log level
// Works on BOTH server and client side

const logLevel = parseInt(process.env.NEXT_PUBLIC_LOG_LEVEL || '5', 10);

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  trace: console.trace,
};

const noop = () => {};

// Override console methods based on log level
if (logLevel === 0) {
  // Silent - no logs at all
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  console.debug = noop;
  console.trace = noop;
} else if (logLevel === 1) {
  // Errors only
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.debug = noop;
  console.trace = noop;
} else if (logLevel === 2) {
  // Errors + warnings
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.trace = noop;
} else if (logLevel === 3) {
  // Errors + warnings + log
  console.info = noop;
  console.debug = noop;
  console.trace = noop;
} else if (logLevel === 4) {
  // All except debug/trace
  console.debug = noop;
  console.trace = noop;
}
// Level 5 = all logs (do nothing)

// Export logger for explicit logging that respects levels
export const logger = {
  log: (...args: unknown[]) => logLevel >= 3 && originalConsole.log(...args),
  info: (...args: unknown[]) => logLevel >= 4 && originalConsole.info(...args),
  warn: (...args: unknown[]) => logLevel >= 2 && originalConsole.warn(...args),
  error: (...args: unknown[]) => logLevel >= 1 && originalConsole.error(...args),
  debug: (...args: unknown[]) => logLevel >= 5 && originalConsole.debug(...args),
  trace: (...args: unknown[]) => logLevel >= 5 && originalConsole.trace(...args),
};

export default logger;
