'use strict';
import moment from 'moment';
export default class AgendaModalController {
  /*@ngInject*/
  constructor(Auth, EventoService, $state, $scope, toastr, usSpinnerService, Modal) {
    this.EventoService = EventoService;
    this.usSpinnerService = usSpinnerService;
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.Modal = Modal;
    this.modalCtl = EventoService.getModalCtl();
    this.event = this.modalCtl.dataSource;
    if(this.event.tarefas) {
      this.EventoService.setEventList(this.event.tarefas);
      let dur = 0;
      this.event.tarefas.forEach(item => {
        //var duration = moment.duration(item.end.diff(item.start));
        //var hours = duration.asHours();
        if(item.end) {
          var ms = moment(item.end).diff(moment(item.start));
          var d = moment.duration(ms);
          var h = Math.floor(d.asHours());
          dur += ms;
          item.duration = (h < 10 ? '0' + h : h) + moment.utc(ms).format(":mm:ss");
          //item.duration = moment(moment.duration(diff)).format('HH:mm:ss');
          //item.duration = `${hourDuration} : ${minuteDuration}`;
        }
      });
      var d = moment.duration(dur);
      var h = Math.floor(d.asHours());
      this.durationTotal = (h < 10 ? '0' + h : h) + moment.utc(dur).format(":mm:ss");
    }
    this.status = [];
    this.prioridade = [];
    EventoService.loadDomain().then(domain => {
      this.status = domain.status;
      this.prioridade = domain.prioridade;
    });
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
    $scope.$watch('ctl.event.start', () => {
      this.validateDates($scope);
    });
    $scope.$watch('ctl.event.end', () => {
      this.validateDates($scope);
    });

    this.isEdit = true;
  }
  validateDates($scope) {
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
      fieldDateEnd.$setValidity(endBeforeStart, !this.isDateEndInvalid());
    }
  }

  isDateEndInvalid() {
    return this.event.end <= this.event.start;
  }
  saveEvent(form) {
    if(form.$invalid) {
      return;
    }
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.saveEvent(this.event)
    .then(newEvento => {
      this.toastr.success('Evento salvo com sucesso.', `${newEvento.title}`);
      this.modalCtl.dismiss();
      let origin;
      if(this.event.origin && typeof this.event.origin === 'string') {
        origin = this.event.origin;
      } else if(this.event.origin) {
        origin = this.event.origin._id;
      }
      this.$state.go('home', {
        defaultView: this.modalCtl.defaultView,
        defaultDate: this.modalCtl.defaultDate,
        eventId: origin
      }, {reload: true});
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
    this.modalCtl.dismiss();
    this.$state.go('home', {
      defaultView: this.modalCtl.defaultView,
      defaultDate: this.modalCtl.defaultDate,
      eventId: undefined
    });
  }
  newTask() {
    this.modalCtl.dismiss();
    this.$state.go('home', {
      defaultView: this.modalCtl.defaultView,
      defaultDate: this.modalCtl.defaultDate,
      eventId: `task:${this.event._id}`
    }, { reload: true });
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
        this.modalCtl.dismiss();
        this.$state.go('home', {
          defaultView: this.modalCtl.defaultView,
          defaultDate: this.modalCtl.defaultDate,
          eventId: undefined
        }, { reload: true });
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
