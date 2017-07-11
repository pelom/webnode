'use strict';

import angular from 'angular';
import NfController from './nf.controller';
import NfEditController from './nf.edit.controller';
import NfPagamentoModalController from './nfpagamento.modal.controller';
export default angular.module('webnodeApp.nf', [])
  .controller('NfPagamentoModalController', NfPagamentoModalController)
  .controller('NfEditController', NfEditController)
  .controller('NfController', NfController)
  .name;
