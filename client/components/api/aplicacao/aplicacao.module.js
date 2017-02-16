'use strict';

import angular from 'angular';
import {AplicacaoService} from './aplicacao.service';
import {AplicacaoResource} from './aplicacao.resource';

export default angular.module('oauthApplicationApp.aplicacao.service', [])
  .factory('AplicacaoService', AplicacaoService)
  .factory('AplicacaoResource', AplicacaoResource)
  .name;
