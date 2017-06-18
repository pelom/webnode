'use strict';

import angular from 'angular';
import ContatoController from './contato.controller';
import ContatoEditController from './contato.edit.controller';
import ContaFindModalController from '../conta/contafind.modal.controller';
export default angular.module('webnodeApp.contato', [])
  .controller('ContaFindModalController', ContaFindModalController)
  .controller('ContatoEditController', ContatoEditController)
  .controller('ContatoController', ContatoController)
  .name;
