'use strict';

import angular from 'angular';
import {UtilService} from './util.service';

export default angular.module('webnodeApp.util', [])
  .factory('Util', UtilService)
  .name;
