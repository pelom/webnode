'use strict';

import angular from 'angular';
import OportunidadeController from './oportunidade.controller';
import OportunidadeEditController from './oportunidade.edit.controller';

export default angular.module('webnodeApp.oportunidade', [])
  .controller('OportunidadeEditController', OportunidadeEditController)
  .controller('OportunidadeController', OportunidadeController)
  .name;
