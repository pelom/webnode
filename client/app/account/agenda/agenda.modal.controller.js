'use strict';
import {openModalView} from './agenda.model.service';

export default class AgendaModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, EventoService, Modal) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.Modal = Modal;
    this.usSpinnerService = usSpinnerService;
    this.EventoService = EventoService;
    this.init(EventoService);
    this.managerChange($scope);
    this.managerValidateDates($scope);
  }

  init(EventoService) {
    this.status = [];
    this.prioridade = [];
    this.hstep = 1;
    this.mstep = 5;
    this.format = 'dd/MM/yyyy';
    this.dateOptions = {
      dateDisabled: false,
      //maxDate: new Date(2020, 5, 22),
      //minDate: new Date(),
      //startingDay: 1,
      weekStart: 0,
      todayHighlight: true,
      showWeeks: false
    };
    this.isEdit = true;

    EventoService.loadDomain().then(domain => {
      this.status = domain.status;
      this.prioridade = domain.prioridade;
    });

    this.modalCtl = EventoService.getModalCtl();
    this.event = this.modalCtl.dataSource;
    if(this.event.tarefas) {
      EventoService.setEventListStatus(this.event.tarefas);
      this.durationTotal = EventoService.calcDuration(this.event.tarefas);
    }
    if(this.event.references) {
      this.event.references.forEach(item => {
        if(item.object === 'Lead') {
          item.link = `/leads/edit/${item.objectId}`;
        }
      });
    }
  }

  managerChange($scope) {
    $scope.$watch('ctl.event.status', () => {
      this.EventoService.setEventStatus(this.event);
    });
  }
  managerValidateDates($scope) {
    let isDateEndInvalid = () => this.event.end <= this.event.start;

    let validateDates = () => {
      if(!$scope.form.hasOwnProperty('dateEnd')) {
        return;
      }
      let endBeforeStart = 'endBeforeStart';
      //let startBeforeNow = 'startBeforeNow';
      let fieldDateEnd = $scope.form.dateEnd;
      //let fieldDateStart = $scope.form.dateStart;

      //fieldDateStart.$setValidity(startBeforeNow, !(this.event.start < new Date()));
      fieldDateEnd.$setValidity(endBeforeStart, true);
      if(this.event.end !== null) {
        fieldDateEnd.$setValidity(endBeforeStart, !isDateEndInvalid());
      }
    };

    $scope.$watch('ctl.event.start', () => {
      validateDates($scope);
    });
    $scope.$watch('ctl.event.end', () => {
      validateDates($scope);
    });
  }

  saveEvent(form) {
    if(form.$invalid) {
      return;
    }

    this.usSpinnerService.spin('spinner-1');
    this.EventoService.saveEvent(this.event)
    .then(newEvento => {
      this.toastr.success('Evento salvo com sucesso.', `${newEvento.title}`);
      this.modalCtl.onSaveEvent(newEvento);
    })
    .catch(err => {
      console.log('Ex:', err);
      this.toastr.error(err.data.message, err.data.name, {
        autoDismiss: false,
        closeButton: true,
        timeOut: 0,
      });
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  close() {
    this.modalCtl.onClose();
  }

  newTask() {
    let newEv = this.EventoService.createEventTask('Nova tarefa', 'Tarefa');
    newEv.origin = this.event._id;

    let modalTaskCtl = openModalView(newEv, this.Modal);
    modalTaskCtl.onSaveEvent = ev => {
      console.log('onSaveEvent()', ev);
      modalTaskCtl.dismiss();
      this.reloadEvent();
    };
    modalTaskCtl.onClose = () => {
      modalTaskCtl.dismiss();
    };
    this.EventoService.setModalCtl(modalTaskCtl);
  }

  reloadEvent() {
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.loadEvento({id: this.event._id})
    .then(event => {
      this.EventoService.setEventStatus(event.tarefas);
      this.event = event;

      this.modalCtl.onSaveTask();
    })
    .catch(err => {
      console.log(err);
      this.toastr.error('Não foi possível abrir o evento');
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  confirmDelete() {
    let confimDelete = this.Modal.confirm.delete(this.deleteEvent());
    confimDelete(this.event.title);
  }

  deleteEvent() {
    return () => {
      this.usSpinnerService.spin('spinner-1');
      this.EventoService.deleteEvent(this.event)
      .then(() => {
        this.toastr.success('Evento excluído com sucesso.');
        this.modalCtl.onDeleteEvent(this.event);
      })
      .catch(err => {
        console.log('Ex:', err);
        this.toastr.error(err.data.message, err.data.name, {
          autoDismiss: false,
          closeButton: true,
          timeOut: 0,
        });
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    };
  }

  isSave() {
    if(!this.event._id) {
      return true;
    }
    let user = this.Auth.getCurrentUserSync();
    return this.event.proprietario._id === user._id;
  }

  isDelete() {
    if(!this.event._id) {
      return false;
    }
    let user = this.Auth.getCurrentUserSync();
    return this.event.proprietario._id === user._id;
  }
}
