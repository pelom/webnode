'use strict';

import angular from 'angular';
import {JobResource} from './job.resource';
import {JobService} from './job.service';

export default angular.module('webnodeApp.job.service', [])
  .factory('JobResource', JobResource)
  .factory('JobService', JobService)
  .name;
