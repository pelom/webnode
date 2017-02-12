'use strict';

import angular from 'angular';
import PermissaoController from './permissao.controller';

export default angular.module('oauthApplicationApp.permissao', [])
  .run(function($rootScope, PermissaoService) {
    'ngInject';
    $rootScope.$on('$stateChangeStart', function(event, next) {
      console.log('stateChangeStart', next);
      PermissaoService.loadAppList();
    });
    $rootScope.$on('$locationChangeSuccess', function(event, next) {
      console.log('locationChangeSuccess', next);
    });
  })
  .controller('PermissaoController', PermissaoController).name;
