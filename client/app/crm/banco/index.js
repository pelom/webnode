'use strict';

import angular from 'angular';
import BancoController from './banco.controller';
import BancoEditController from './banco.edit.controller';
import BancoPagamentoController from './bancopagamento.controller';
import BancoPagamentoModalController from './bancopagamento.modal.controller';

export default angular.module('webnodeApp.banco', [])
  .controller('BancoController', BancoController)
  .controller('BancoEditController', BancoEditController)
  .controller('BancoPagamentoController', BancoPagamentoController)
  .controller('BancoPagamentoModalController', BancoPagamentoModalController)
  .name;
