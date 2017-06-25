'use strict';

import angular from 'angular';
import ContaController from './conta.controller';
import ContaEditController from './conta.edit.controller';
import ContatoModalController from '../contato/contato.modal.controller';

export default angular.module('webnodeApp.conta', [])
  .controller('ContatoModalController', ContatoModalController)
  .controller('ContaEditController', ContaEditController)
  .controller('ContaController', ContaController)
  .name;
