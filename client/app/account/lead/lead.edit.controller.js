'use strict';
import angular from 'angular';
import {openModalView} from '../agenda/agenda.model.service';

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
    //let data = new Date();
    let evento = this.createEventReferenceLead(
      'Task', 'Tarefa', 'Pendente', null);
    let modalCtl = openModalView(evento, this.Modal);
    modalCtl.onSaveEvent = this.addEventLead(modalCtl);
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.EventoService.setModalCtl(modalCtl);
  }

  newEvent() {
    //let data = new Date();
    let evento = this.createEventReferenceLead(
      'Event', 'Evento', 'Pendente', null);
    let modalCtl = openModalView(evento, this.Modal);
    modalCtl.onSaveEvent = this.addEventLead(modalCtl);
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.EventoService.setModalCtl(modalCtl);
  }

  registerContact() {
    let data = new Date();
    let evento = this.createEventReferenceLead(
      'Activity', 'Contato', 'Concluído', data);
    let modalCtl = openModalView(evento, this.Modal);
    modalCtl.onSaveEvent = this.addEventLead(modalCtl);
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.EventoService.setModalCtl(modalCtl);
  }

  createEventReferenceLead(type, subject, status, data) {
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
      description: `${this.lead.descricao}`,
      link: `/leads/edit/${this.lead._id}`,
      objectId: `${this.lead._id}`,
      object: 'Lead'
    };
  }

  addEventLead(modalCtl) {
    return ev => {
      console.log('addEventLead()', ev);
      modalCtl.dismiss();
      let leadEv = angular.copy(this.lead);
      leadEv.evento = ev;
      this.LeadService.addActivity(leadEv).then(bol => {
        console.log(bol);
        this.init();
      });
    };
  }

  removeEventLead(modalCtl) {
    return ev => {
      console.log('removeEventLead()', ev);
      modalCtl.dismiss();
      let leadEv = angular.copy(this.lead);
      leadEv.evento = ev;
      this.LeadService.removeActivity(leadEv).then(bol => {
        console.log(bol);
        this.init();
      });
    };
  }

  openModalEventId(eventId) {
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.loadEvento({id: eventId})
    .then(event => {
      let modalTaskCtl = openModalView(event, this.Modal);
      modalTaskCtl.onSaveEvent = ev => {
        console.log('onSaveEvent()', ev);
        modalTaskCtl.dismiss();
        this.init();
      };
      modalTaskCtl.onSaveTask = () => {
        console.log('onSaveTask()');
      };
      modalTaskCtl.onDeleteEvent = this.removeEventLead(modalTaskCtl);
      modalTaskCtl.onClose = () => {
        modalTaskCtl.dismiss();
      };
      this.EventoService.setModalCtl(modalTaskCtl);
    })
    .catch(err => {
      console.log(err);
      this.toastr.error('Não foi possível abrir o evento');
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }
}
