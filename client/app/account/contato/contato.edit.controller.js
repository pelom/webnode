/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');

export default class ContatoEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $state, $timeout, $stateParams,
    toastr, usSpinnerService, ContatoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);
    this.id = $stateParams.id;
    this.$timeout = $timeout;
    this.$state = $state;
    this.Modal = Modal;
    this.ContatoService = ContatoService;
    this.ContatoService.loadDomain().then(domain => {
      this.origem = domain.origem;
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    if(this.id) {
      this.ContatoService.loadContato({ id: this.id })
        .then(this.callbackLoadContato())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.contato = this.createContato();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadContato() {
    return contato => {
      this.contato = contato;
    };
  }

  createContato() {
    return {
      nome: '',
      sobrenome: '',
      isAtivo: true
    };
  }
}
