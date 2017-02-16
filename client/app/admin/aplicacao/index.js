'use strict';

import angular from 'angular';
import AplicacaoController from './aplicacao.controller';
import AplicacaoEditController from './aplicacao.edit.controller';

export default angular.module('oauthApplicationApp.aplicacao', [])
  .controller('AplicacaoEditController', AplicacaoEditController)
  .controller('AplicacaoController', AplicacaoController)
  .name;
