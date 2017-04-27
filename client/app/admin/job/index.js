'use strict';

import angular from 'angular';
import JobController from './job.controller';
export default angular.module('webnodeApp.job', [])
  .controller('JobController', JobController)
  .name;
