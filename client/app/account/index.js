'use strict';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './account.routes';
import login from './login';
import settings from './settings';
import signup from './signup';
import perfil from './perfil';
import agenda from './agenda';
import lead from './lead';
import conta from './conta';
import contato from './contato';

import HomeController from './home.controller';
import HomeMenuController from './home.menu.controller';
import AgendaModalController from './agenda/agenda.modal.controller';
import LeadController from './lead/lead.controller';
import ContaController from './conta/conta.controller';
import ContatoController from './contato/contato.controller';

export default angular.module('webnodeApp.account',
[uiRouter, login, settings, signup, perfil, agenda, lead, conta, contato])
  .config(routing)
  .run(function($rootScope) {
    'ngInject';

    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if(next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  })
  .controller('LeadController', LeadController)
  .controller('ContaController', ContaController)
  .controller('ContatoController', ContatoController)
  .controller('AgendaModalController', AgendaModalController)
  .controller('HomeMenuController', HomeMenuController)
  .controller('HomeController', HomeController).name;
