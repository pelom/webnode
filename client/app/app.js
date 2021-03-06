'use strict';

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import uiSelect from 'ui-select';
import uiMask from 'angular-ui-mask';
// import ngMessages from 'angular-messages';
import ngValidationMatch from 'angular-validation-match';
import 'angular-file-model';

import 'angular-chart.js';
import toastr from 'angular-toastr';
import 'angular-spinner';
import 'fullcalendar/dist/locale-all';
import 'angular-i18n/angular-locale_pt-br';
import 'angular-ui-calendar';
import 'angular-br-filters';
import 'angular-input-masks';

import {routeConfig} from './app.config';

import _Auth from '../components/auth/auth.module';
import PermissaoService from '../components/api/permissao/permissao.module';
import AplicacaoService from '../components/api/aplicacao/aplicacao.module';
import UsuarioService from '../components/api/usuario/usuario.module';
import EventoService from '../components/api/evento/evento.module';
import JobService from '../components/api/job/job.module';
import LeadService from '../components/api/lead/lead.module';
import ContaService from '../components/api/conta/conta.module';
import ContatoService from '../components/api/contato/contato.module';
import ProdutoService from '../components/api/produto/produto.module';
import OrcamentoService from '../components/api/orcamento/orcamento.module';
import OportunidadeService from '../components/api/oportunidade/oportunidade.module';
import NfService from '../components/api/nf/nf.module';
import BancoService from '../components/api/banco/banco.module';

import account from './account';
import admin from './admin';
import crm from './crm';

import changePassword from '../components/change-password/change.password.component';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import Modal from '../components/modal/modal.service';
import mongooseError from '../components/mongoose-error/mongoose-error.directive';

import loadingDirec from '../components/directive/loading/loading.directive';
import nomeValidoDirec from '../components/directive/nome-valido/nomevalido.directive';
import googlemaps from '../components/googlemaps/googlemaps.directive';
import endereco from '../components/endereco/endereco.directive';
import atividade from '../components/atividade/atividade.directive';
import './app.css';

import checkStrength from '../components/check-strength/checkStrength.directive';
import '../components/check-strength/check.css';

angular.module('webnodeApp', [ngCookies, ngResource, ngSanitize, ngAnimate, toastr,
  ngValidationMatch, 'btford.socket-io', loadingDirec, nomeValidoDirec, checkStrength,
  googlemaps, endereco, atividade,
  uiRouter, uiBootstrap, uiSelect, uiMask, UsuarioService, AplicacaoService,
  PermissaoService, EventoService, JobService, ContaService, ContatoService, ProdutoService,
  OrcamentoService, OportunidadeService, NfService, BancoService,
  LeadService, _Auth, account, admin, crm, navbar, footer, main, constants, socket, util, Modal,
  changePassword, mongooseError, 'angularSpinner', 'ui.calendar',
  'idf.br-filters', 'ui.utils.masks', 'file-model', 'chart.js'
])
  .config(routeConfig)
  .config(function(uiSelectConfig) {
    'ngInject';
    uiSelectConfig.theme = 'bootstrap';
    uiSelectConfig.resetSearchInput = true;
    uiSelectConfig.appendToBody = true;
  })
  .config(function(toastrConfig) {
    'ngInject';
    angular.extend(toastrConfig, {
      positionClass: 'toast-top-center'
    });
  })
  /*.run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
      console.log('APP: stateChangeStart: ', next);
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  })*/;

angular.element(document).ready(() => {
  angular.bootstrap(document, ['webnodeApp'], {
    strictDi: true
  });
});
