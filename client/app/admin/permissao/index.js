'use strict';

import angular from 'angular';
import PermissaoController from './permissao.controller';
import PermissaoAppController from './permissao.app.controller';

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
  .controller('PermissaoAppController', PermissaoAppController)
  .controller('PermissaoController', PermissaoController).name;
