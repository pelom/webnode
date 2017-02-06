'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import usuario from './usuario';
import permissao from './permissao';


export default angular.module('oauthApplicationApp.admin', [
  'oauthApplicationApp.auth', 'ui.router', usuario, permissao])
  .config(routes)
  .controller('AdminController', AdminController).name;
