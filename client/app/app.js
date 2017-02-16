'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';
import ngValidationMatch from 'angular-validation-match';

import {routeConfig} from './app.config';

import _Auth from '../components/auth/auth.module';
//import PermissaoService from '../components/api/permissao/permissao.module';
import AplicacaoService from '../components/api/aplicacao/aplicacao.module';

import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import Modal from '../components/modal/modal.service';

import loadingDirec from '../components/directive/loading/loading.directive';
import nomeValidoDirec from '../components/directive/nome-valido/nomevalido.directive';
import './app.css';

import checkStrength from '../components/check-strength/checkStrength.directive';
import '../components/check-strength/check.css';

angular.module('oauthApplicationApp', [ngCookies, ngResource, ngSanitize,
  ngValidationMatch, 'btford.socket-io', loadingDirec, nomeValidoDirec, checkStrength,
  uiRouter, uiBootstrap, AplicacaoService,
  _Auth, account, admin, navbar, footer, main, constants, socket, util, Modal
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['oauthApplicationApp'], {
      strictDi: true
    });
  });
