'use strict';

import angular from 'angular';
import {EventoResource} from './evento.resource';
import {EventoService} from './evento.service';

export default angular.module('webnodeApp.evento.service', [])
  .factory('EventoResource', EventoResource)
  .factory('EventoService', EventoService)
  .name;
