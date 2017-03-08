'use strict';

import angular from 'angular';
import PermissaoController from './permissao.controller';
import PermissaoEditController from './permissao.edit.controller';
export default angular.module('oauthApplicationApp.permissao', [])
  .run(function($rootScope) {
    'ngInject';
    /*$rootScope.$on('$stateChangeStart', function(event, next) {
      console.log('stateChangeStart', next);

    });
    $rootScope.$on('$locationChangeSuccess', function(event, next) {
      console.log('locationChangeSuccess', next);
    });
    */
  })
  .controller('PermissaoEditController', PermissaoEditController)
  .controller('PermissaoController', PermissaoController).name;
