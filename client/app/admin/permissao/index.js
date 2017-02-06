'use strict';

import angular from 'angular';
import PermissaoController from './permissao.controller';

export default angular.module('oauthApplicationApp.permissao', [])
  .controller('PermissaoController', PermissaoController)
  .name;
