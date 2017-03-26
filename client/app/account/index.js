'use strict';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './account.routes';
import login from './login';
import settings from './settings';
import signup from './signup';
import perfil from './perfil';
export default angular.module('webnodeApp.account',
[uiRouter, login, settings, signup, perfil])
  .config(routing)
  .run(function($rootScope) {
    'ngInject';

    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if(next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  })
  .name;
