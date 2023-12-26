import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Add a console transport for logging to the console
    new winston.transports.Console()
  ]
})
