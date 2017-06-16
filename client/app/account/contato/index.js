'use strict';

import angular from 'angular';
import ContatoController from './contato.controller';
//import ContatoEditController from './contato.edit.controller';
export default angular.module('webnodeApp.contato', [])
  //.controller('ContatoEditController', ContatoEditController)
  .controller('ContatoController', ContatoController)
  .name;
