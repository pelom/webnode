'use strict';

import angular from 'angular';
import OrcamentoController from './orcamento.controller';
import OrcamentoEditController from './orcamento.edit.controller';
import OrcamentoItemModalController from './orcamento.item.modal.controller';

export default angular.module('webnodeApp.orcamento', [])
  .controller('OrcamentoItemModalController', OrcamentoItemModalController)
  .controller('OrcamentoEditController', OrcamentoEditController)
  .controller('OrcamentoController', OrcamentoController)
  .name;
