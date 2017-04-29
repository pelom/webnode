'use strict';

import angular from 'angular';
import PermissaoController from './permissao.controller';
import PermissaoEditController from './permissao.edit.controller';
export default angular.module('webnodeApp.permissao', [])
  .controller('PermissaoEditController', PermissaoEditController)
  .controller('PermissaoController', PermissaoController).name;
