/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import {openModalView} from './agenda/agenda.model.service';
import moment from 'moment';
moment.locale('pt-br');

export default class Controller {
  constructor($window, $scope, toastr, usSpinnerService, Modal) {
    this.usSpinnerService = usSpinnerService;
    this.toastr = toastr;
    this.Modal = Modal;
    this.managerLayout($window, $scope);
  }

  managerLayout($window, $scope) {
    this.width = $window.innerWidth;
    this.$window = $window;

    let onResize = () => {
      //console.log('$window.innerWidth:', $window.innerWidth);
      this.width = $window.innerWidth;
      $scope.$digest();
    };

    angular.element($window).on('resize', onResize);

    $scope.$on('$destroy', () => {
      console.log('$destroy');
      angular.element($window).off('resize', onResize);
    });
  }

  isJustified() {
    if(this.isFull()) {
      return 'nav-justified';
    }
    return '';
  }

  isFull() {
    return this.width >= 800;
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

  newTask(EventoService) {
    //let data = new Date();
    let evento = this.createEventReference(
      'Task', 'Tarefa', 'Pendente', null);
    let modalCtl = this.openEventModal(evento, this.Modal);
    modalCtl.onSaveEvent = this.callbackSaveEvent(modalCtl);
    modalCtl.onClose = this.callbackClose(modalCtl);
    EventoService.setModalCtl(modalCtl);
  }

  newEvent(EventoService) {
    //let data = new Date();
    let evento = this.createEventReference(
      'Event', 'Evento', 'Pendente', null);
    let modalCtl = this.openEventModal(evento, this.Modal);
    modalCtl.onSaveEvent = this.callbackSaveEvent(modalCtl);
    modalCtl.onClose = this.callbackClose(modalCtl);
    EventoService.setModalCtl(modalCtl);
  }

  registerContact(EventoService) {
    let data = new Date();
    let evento = this.createEventReference(
      'Activity', 'Contato', 'Concluído', data);
    let modalCtl = this.openEventModal(evento, this.Modal);
    modalCtl.onSaveEvent = this.callbackSaveEvent(modalCtl);
    modalCtl.onClose = this.callbackClose(modalCtl);
    EventoService.setModalCtl(modalCtl);
  }

  openEventModal(event) {
    return openModalView(event, this.Modal);
  }

  openModalEventId(eventId, EventoService) {
    this.usSpinnerService.spin('spinner-1');
    EventoService.loadEvento({id: eventId})
    .then(event => {
      this.activityEdit(event, EventoService);
    })
    .catch(err => {
      console.log(err);
      this.toastr.error('Não foi possível abrir o evento');
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  activityEdit(activity, EventoService) {
    let modalActivity = this.openEventModal(activity);

    modalActivity.onSaveEvent = this.callbackSaveEvent(modalActivity);
    modalActivity.onDeleteEvent = this.callbackDeleteEvent(modalActivity);
    modalActivity.onSaveTask = () => {};
    modalActivity.onClose = this.callbackClose(modalActivity);
    EventoService.setModalCtl(modalActivity);
  }

  callbackSaveEvent(modalCtl) {
    return () => {
      modalCtl.dismiss();
      this.loadAtividades();
    };
  }

  callbackDeleteEvent(modalCtl) {
    return () => {
      modalCtl.dismiss();
      this.loadAtividades();
    };
  }

  callbackClose(modalCtl) {
    return () => {
      modalCtl.dismiss();
    };
  }
}
