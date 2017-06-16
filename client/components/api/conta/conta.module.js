'use strict';

import angular from 'angular';
import {ContaResource} from './conta.resource';
import {ContaService} from './conta.service';

export default angular.module('webnodeApp.conta.service', [])
  .factory('ContaResource', ContaResource)
  .factory('ContaService', ContaService)
  .name;
