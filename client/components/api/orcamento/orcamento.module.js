'use strict';

import angular from 'angular';
import {OrcamentoResource} from './orcamento.resource';
import {OrcamentoService} from './orcamento.service';

export default angular.module('webnodeApp.orcamento.service', [])
  .factory('OrcamentoResource', OrcamentoResource)
  .factory('OrcamentoService', OrcamentoService)
  .name;
