'use strict';

import angular from 'angular';
import ContaController from './conta.controller';
//import LeadEditController from './lead.edit.controller';
export default angular.module('webnodeApp.conta', [])
  //.controller('LeadEditController', LeadEditController)
  .controller('ContaController', ContaController)
  .name;
