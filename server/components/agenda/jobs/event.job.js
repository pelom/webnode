'use strict';

import logger from '../../logger';

module.exports = function(agenda, jobFile) {
  logger.info('Loading jobFile', jobFile);

  agenda.define(jobFile.job, function(job, done) {
    logger.debug('Executando', job.attrs.name, new Date());
    done();
  });

  agenda.on('ready', function() {
    logger.debug('agenda.ready() job event');
    agenda.every(jobFile.cron, jobFile.job);
  });

  return agenda;
};
