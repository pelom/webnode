'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import usuario from './usuario';
//import permissao from './permissao';
import aplicacao from './aplicacao';

export default angular.module('oauthApplicationApp.admin',
['oauthApplicationApp.auth', 'ui.router', usuario, aplicacao])
  .config(routes)
  .controller('AdminController', AdminController).name;
