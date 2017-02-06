'use strict';

import angular from 'angular';
import UsuarioController from './usuario.controller';

export default angular.module('oauthApplicationApp.usuario', [])
  .controller('UsuarioController', UsuarioController)
  .name;
