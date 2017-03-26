'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import usuario from './usuario';
import permissao from './permissao';
import aplicacao from './aplicacao';

export default angular.module('webnodeApp.admin',
['webnodeApp.auth', 'ui.router', usuario, aplicacao, permissao])
  .config(routes)
  .controller('AdminController', AdminController).name;
