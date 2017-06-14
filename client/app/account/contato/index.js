'use strict';

import angular from 'angular';
import ContatoController from './contato.controller';
//import LeadEditController from './lead.edit.controller';
export default angular.module('webnodeApp.contato', [])
  //.controller('LeadEditController', LeadEditController)
  .controller('ContatoController', ContatoController)
  .name;
