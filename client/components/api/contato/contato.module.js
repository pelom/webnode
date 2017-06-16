'use strict';

import angular from 'angular';
import {ContatoResource} from './contato.resource';
import {ContatoService} from './contato.service';

export default angular.module('webnodeApp.contato.service', [])
  .factory('ContatoResource', ContatoResource)
  .factory('ContatoService', ContatoService)
  .name;
