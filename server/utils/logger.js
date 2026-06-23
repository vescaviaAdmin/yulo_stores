import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

let transport;
if (isDev) {
  try {
    transport = pino.transport({ target: 'pino-pretty', options: { colorize: true } });
  } catch {
    // pino-pretty not available — fall back to plain pino
  }
}

const logger = pino({ level: isDev ? 'debug' : 'info' }, transport);

export default logger;
