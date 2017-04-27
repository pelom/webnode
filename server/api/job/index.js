'use strict';
import {Router} from 'express';
import * as controller from './job.controller';
import agendaJobs from '../../components/agenda';
import config from '../../config/environment';

module.exports = function(agenda) {
  let router = new Router();
  router.get('/', controller.index);
  return router;
};
