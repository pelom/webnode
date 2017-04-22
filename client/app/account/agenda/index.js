'use strict';

import angular from 'angular';
import AgendaController from './agenda.controller';
export default angular.module('webnodeApp.agenda', [])
  .controller('AgendaController', AgendaController)
  .name;
