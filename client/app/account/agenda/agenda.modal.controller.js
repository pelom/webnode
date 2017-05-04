'use strict';
export default class AgendaModalController {
  /*@ngInject*/
  constructor(EventoService, $state, $scope, toastr, usSpinnerService) {
    this.EventoService = EventoService;
    this.usSpinnerService = usSpinnerService;
    this.toastr = toastr;
    this.$state = $state;
    this.modalCtl = EventoService.getModalCtl();
    this.event = this.modalCtl.dataSource;
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
      this.$state.go('home', {
        defaultView: this.modalCtl.defaultView,
        defaultDate: this.modalCtl.defaultDate,
        eventId: undefined
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
}
