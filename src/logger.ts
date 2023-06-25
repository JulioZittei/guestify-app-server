import pino from 'pino'
import config from 'config'

const logger = pino({
  enabled: config.get('App.server.logger.enabled'),
  level: config.get('App.server.logger.level'),
})

export default logger
