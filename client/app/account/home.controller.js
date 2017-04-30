'use strict';
import angular from 'angular';
import {openModalView} from './agenda/agenda.model.service';
/* eslint no-sync: 0 */
export default class HomeController {
  /*@ngInject*/
  constructor($stateParams, EventoService, Auth,
    toastr, usSpinnerService, Modal) {
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$stateParams = $stateParams;
    this.toastr = toastr;
    this.usSpinnerService = usSpinnerService;
    this.Modal = Modal;
    this.EventoService = EventoService;
    this.defaultView = $stateParams.defaultView || 'listWeek';
    this.defaultDate = $stateParams.defaultDate || new Date();
    this.defaultStatus = $stateParams.defaultStatus || null;
    if($stateParams.eventId) {
      this.openModalEventId($stateParams.eventId);
    }
    this.startInterval = null;
    this.endInterval = null;
    this.eventSources = [];
    this.uiConfig = {
      calendar: {
        header: {
          //left: 'month basicWeek basicDay agendaWeek agendaDay',
          left: 'title',
          right: 'today prev,next',
          center: 'timelineDay,agendaDay,listWeek,agendaWeek,month'
          //right: 'today,month,basicWeek basicDay,agendaWeek,agendaDay,listWeek'
        },
        defaultView: this.defaultView,
        defaultDate: this.defaultDate,
        locale: 'pt-br',
        lang: 'pt-br',
        height: 500,
        nowIndicator: true,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        selectable: true,
        eventLimit: true, // allow "more" link when too many events
        //selectConstraint: 'businessHours',
        //eventConstraint: 'businessHours',
        businessHours: [{
          dow: [1, 2, 3], // Monday, Tuesday, Wednesday
          start: '08:00', // 8am
          end: '18:00' // 6pm
        }, {
          dow: [4, 5], // Thursday, Friday
          start: '08:00', // 10am
          end: '18:00' // 4pm
        }],
        selectHelper: true,
        startEditable: true,
        slotDuration: '01:00:00',
        timezone: 'local',
        loading: bool => {
          if(bool) {
            this.usSpinnerService.spin('spinner-1');
          } else {
            this.usSpinnerService.stop('spinner-1');
          }
          console.log('loading:', bool);
        },
        viewRender: view /*element*/ => {
          this.findEventListView(view);
        },
        eventRender: (event, element) => {
          element.attr('title', event.start.format('LLLL'));
          element.find('.fc-title')
            .html('<i class="fa ' + event.icon + '" aria-hidden="true"></i>'
              + ' <b>' + event.title + '</b>');
        },
        eventClick: calEvent/*(calEvent, jsEvent, view)*/ => {
          let event = this.createEventClick(calEvent);
          this.openModalEvent(event);
        },
        /*dayClick: date => {
          let stgStart = date.format('YYYY-MM-DD HH:mm:ss');
          let modalCtl = openModalView({
            title: 'Novo',
            start: new Date(stgStart),
            end: null
          }, this.Modal);
          this.EventoService.setModalCtl(modalCtl);
        },*/
        select: (startDate, endDate) => {
          let event = this.createEventSelect(startDate, endDate);
          this.openModalEvent(event);
        },
        eventDrop: calEvent /*(calEvent, delta, revertFunc, jsEvent, ui, view)*/ => {
          let evento = this.createEventClick(calEvent);
          this.saveEvent(evento);
        },
        eventResize: calEvent /*(calEvent, delta, revertFunc, jsEvent, ui, view)*/ => {
          let evento = this.createEventClick(calEvent);
          this.saveEvent(evento);
        }
      }
    };
  }
  createEventClick(calEvent) {
    let evento = angular.copy(calEvent);
    evento.start = this.momentToDate(evento.start);
    if(evento.end !== null) {
      evento.end = this.momentToDate(evento.end);
    }
    return evento;
  }
  momentToDate(momentDate) {
    try {
      return momentDate.local().toDate();
    } catch(err) {
      console.log(err);
      return null;
    }
  }
  createEventSelect(startDate, endDate) {
    let evento = {
      title: startDate.format('LLLL'),
      start: this.momentToDate(startDate),
      end: this.momentToDate(endDate),
      status: 'Pendente',
      prioridade: 'Normal'
    };
    let evList = [evento];
    this.EventoService.setEventList(evList);
    return evList[0];
  }
  openModalEvent(event) {
    let modalCtl = openModalView(event, this.Modal);
    modalCtl.defaultView = this.defaultView;
    modalCtl.defaultDate = this.defaultDate;
    this.EventoService.setModalCtl(modalCtl);
  }
  findEventListView(view) {
    this.setParamRealod(view);
    this.startInterval = view.intervalStart.local().format();
    this.endInterval = view.intervalEnd.local().format();
    this.findEventList();
  }
  findEventList() {
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.loadEventoList({
      start: this.startInterval,
      end: this.endInterval,
      status: this.defaultStatus
    })
    .then(this.callbackLoadEventoList())
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }
  setParamRealod(view) {
    this.defaultView = view.name;
    this.defaultDate = view.intervalStart.format();
  }
  callbackLoadEventoList() {
    return eventList => {
      this.EventoService.setEventList(eventList);
      let eventSource = {
        //color: '#378006', textColor: '#FFF', eventColor: '#378006',
        events: eventList,
      };
      this.eventSources.pop();
      this.eventSources.push(eventSource);
    };
  }
  findEventListStatus(status) {
    this.defaultStatus = status;
    this.findEventList();
  }
  saveEvent(evento) {
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.saveEvent(evento)
    .then(newEvento => {
      this.toastr.success('Evento salvo com sucesso.', `${newEvento.title}`);
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
  openModalEventId(eventId) {
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.loadEvento({id: eventId})
    .then(event => {
      event.start = new Date(event.start);
      if(event.end) {
        event.end = new Date(event.end);
      }
      this.openModalEvent(event);
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
