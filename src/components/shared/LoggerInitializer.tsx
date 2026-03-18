'use client';

import { useEffect } from 'react';

export default function LoggerInitializer() {
  useEffect(() => {
    const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL
      ? parseInt(process.env.NEXT_PUBLIC_LOG_LEVEL)
      : 5;

    const noop = () => {};

    // Store original console methods
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      trace: console.trace,
    };

    // Override console methods based on log level
    if (logLevel === 0) {
      // Silent - disable all logs
      console.log = noop;
      console.info = noop;
      console.warn = noop;
      console.error = noop;
      console.debug = noop;
      console.trace = noop;
    } else if (logLevel === 1) {
      // Fatal & errors only
      console.log = noop;
      console.info = noop;
      console.warn = noop;
      console.debug = noop;
      console.trace = noop;
      // Keep error
    } else if (logLevel === 2) {
      // + Warnings
      console.log = noop;
      console.info = noop;
      console.debug = noop;
      console.trace = noop;
      // Keep error, warn
    } else if (logLevel === 3) {
      // + Logs
      console.info = noop;
      console.debug = noop;
      console.trace = noop;
      // Keep error, warn, log
    } else if (logLevel === 4) {
      // + Info
      console.debug = noop;
      console.trace = noop;
      // Keep error, warn, log, info
    }
    // Level 5 - keep all (do nothing)

    // Cleanup function to restore original console methods
    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
      console.trace = originalConsole.trace;
    };
  }, []);

  return null;
}
