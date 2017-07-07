'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
//import {openModalView} from '../agenda/agenda.model.service';

export default class NfEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    NfService, ContaService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
    this.$state = $state;
    this.$timeout = $timeout;
    this.Modal = Modal;
    this.ContaService = ContaService;
    this.NfService = NfService;
    this.NfService.loadDomain().then(domain => {
      this.status = domain.status;
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    if(this.id) {
      this.NfService.loadNf({ id: this.id })
        .then(this.callbackLoadNf())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.nf = this.createNf();
      this.updateMask();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadNf() {
    return nf => {
      this.nf = nf;
      this.nf.dataEmissao = new Date(this.nf.dataEmissao);
    };
  }

  createNf() {
    return {
      status: 'Não Contatado',
    };
  }
}
