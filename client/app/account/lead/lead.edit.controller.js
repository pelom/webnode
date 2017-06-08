'use strict';
import angular from 'angular';
export default class LeadEditController {
  /*@ngInject*/
  constructor($stateParams, $timeout, $state, toastr, usSpinnerService, LeadService) {
    this.id = $stateParams.id;
    this.$state = $state;
    this.toastr = toastr;
    this.$timeout = $timeout;
    this.usSpinnerService = usSpinnerService;
    this.LeadService = LeadService;
    this.LeadService.loadDomain().then(domain => {
      this.status = domain.status;
      this.origem = domain.origem;
      this.produto = domain.produto;
      this.init();
    });
  }

  init() {
    if(this.id) {
      this.LeadService.loadLead({ id: this.id })
        .then(this.callbackLoadLead())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.lead = this.createLead();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadLead() {
    return lead => {
      this.lead = lead;
    };
  }

  createLead() {
    return {
      nome: '',
      sobrenome: '',
      email: '',
      celular: '',
      telefone: '',
      empresa: '',
      website: '',
      status: 'Não Contatado',
      origem: '',
      descricao: '',
      isAtivo: true
    };
  }
}
