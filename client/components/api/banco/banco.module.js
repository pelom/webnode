'use strict';

import angular from 'angular';
import {BancoResource} from './banco.resource';
import {BancoService} from './banco.service';

export default angular.module('webnodeApp.banco.service', [])
  .factory('BancoResource', BancoResource)
  .factory('BancoService', BancoService)
  .name;
