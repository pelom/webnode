'use strict';
import angular from 'angular';
import {openModalView} from '../agenda/agenda.model.service';
import moment from 'moment';
export default class LeadEditController {
  /*@ngInject*/
  constructor($stateParams, $timeout, $state, toastr, usSpinnerService, LeadService, EventoService, Modal) {
    this.id = $stateParams.id;
    this.$state = $state;
    this.toastr = toastr;
    this.$timeout = $timeout;
    this.usSpinnerService = usSpinnerService;
    this.Modal = Modal;
    this.EventoService = EventoService;
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
      status: 'Não Contatado',
      origem: 'Ligação',
      isAtivo: true
    };
  }

  save(form) {
    if(form.$invalid) {
      return;
    }
    console.log(this.lead.email);
    console.log(this.isEmpty(this.lead.email));
    if(this.isNotContact()) {
      this.toastr.error('', 'Informe o Email ou Telefone ou o Celular como uma forma de contato');
      return;
    }
    console.log(this.lead);

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

  newTask() {
    let data = new Date();
    let name = `Lead (${this.lead.nome} ${this.lead.sobrenome})`;
    let evento = {
      title: name,
      type: 'Task',
      status: 'Pendente',
      prioridade: 'Normal',
      references: [{
        name,
        objectId: `${this.lead._id}`,
        object: 'Lead'
      }]
    };
    let modalCtl = openModalView(evento, this.Modal);
    modalCtl.redirect = false;
    this.EventoService.setModalCtl(modalCtl);
  }

  registerContact() {
    let data = new Date();
    let evento = {
      title: 'Novo ',
      start: data,
      status: 'Concluído',
      prioridade: 'Normal'
    };
    let modalCtl = openModalView(evento, this.Modal);
    modalCtl.redirect = false;
    this.EventoService.setModalCtl(modalCtl);
  }
}
