'use strict';

import angular from 'angular';
import {OportunidadeResource} from './oportunidade.resource';
import {OportunidadeService} from './oportunidade.service';

export default angular.module('webnodeApp.oportunidade.service', [])
  .factory('OportunidadeResource', OportunidadeResource)
  .factory('OportunidadeService', OportunidadeService)
  .name;
