'use strict';
import angular from 'angular';
import {UsuarioService} from './usuario.service';
import {UsuarioResource} from './usuario.resource';
export default angular.module('webnodeApp.usuario.service', [])
  .factory('UsuarioService', UsuarioService)
  .factory('UsuarioResource', UsuarioResource)
  .name;
