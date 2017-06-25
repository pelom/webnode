'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
//import {openModalView} from '../agenda/agenda.model.service';

export default class LeadEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    LeadService, EventoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
    this.$state = $state;
    this.$timeout = $timeout;
    this.Modal = Modal;
    this.EventoService = EventoService;
    this.LeadService = LeadService;
    this.LeadService.loadDomain().then(domain => {
      this.status = domain.status;
      this.origem = domain.origem;
      this.produto = domain.produto;
      this.setor = domain.setor;
      this.setor.sort();
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
      this.updateMask();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadLead() {
    return lead => {
      this.lead = lead;
      this.lead.iden = 'cpf';

      if(this.lead.cpfCnpj && this.lead.cpfCnpj.length == 14) {
        this.lead.iden = 'cnpj';
      }
      this.updateMask();
      this.loadAtividades();
    };
  }

  loadAtividades() {
    this.EventoService.loadEventoList({ idref: this.lead._id })
    .then(eventos => {
      this.lead.atividades = eventos;
    });
  }

  createLead() {
    return {
      status: 'Não Contatado',
      origem: 'Ligação',
      iden: 'cpf',
      isAtivo: true
    };
  }

  updateMask() {
    if(this.lead.iden == 'cpf') {
      this.mask = '999.999.999-99';
    } else if(this.lead.iden == 'cnpj') {
      this.mask = '99.999.999.9999-99';
    }
  }

  save(form) {
    if(form.$invalid) {
      return;
    }

    if(this.isNotContact()) {
      this.toastr.error('', 'Informe o Email ou Telefone ou o Celular como uma forma de contato');
      return;
    }

    this.usSpinnerService.spin('spinner-1');
    this.LeadService.saveLead(this.lead)
      .then(() => {
        this.toastr.success('Lead salvo com sucesso',
        `${this.lead.nome} ${this.lead.sobrenome}`);
        this.$state.go('leads');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  isNotContact() {
    return this.isEmpty(this.lead.email)
      && this.isEmpty(this.lead.telefone)
      && this.isEmpty(this.lead.celular);
  }

  isEmpty(str) {
    if(!str) {
      return true;
    }
    return str === '';
  }

  callbackError(form) {
    return err => {
      console.log('Ex:', err);

      this.toastr.error(err.data.message, err.data.name, {
        autoDismiss: false,
        closeButton: true,
        timeOut: 0,
      });
      err = err.data;
      this.errors = {};

      angular.forEach(err.errors, (error, field) => {
        if(form.hasOwnProperty(field)) {
          form[field].$setValidity('mongoose', false);
        } else {
          this.toastr.error(error.message, field, {
            closeButton: true,
          });
        }
        this.errors[field] = error.message;
      });
    };
  }

  createEventReference(type, subject, status, data) {
    let name = `Lead (${this.lead.nome} ${this.lead.sobrenome})`;
    return {
      title: name,
      type,
      subject,
      start: data,
      status,
      prioridade: 'Normal',
      references: [this.createReferenceLead(name)]
    };
  }

  createReferenceLead(name) {
    return {
      name,
      description: this.lead.descricao ? `${this.lead.descricao}` : '',
      link: `/leads/edit/${this.lead._id}`,
      objectId: `${this.lead._id}`,
      object: 'Lead'
    };
  }

  isEdit() {
    if(!this.lead) {
      return false;
    }
    return !(this.lead.status === 'Convertido' && this.lead.isConvertido);
  }
}
