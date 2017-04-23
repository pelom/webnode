'use strict';
import angular from 'angular';
import {openModalView} from './agenda/agenda.model.service';
/* eslint no-sync: 0 */
export default class HomeController {
  /*@ngInject*/
  constructor($stateParams, $state, EventoService, $scope,
    $compile, Auth, usSpinnerService, Modal) {
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.Modal = Modal;
    this.$stateParams = $stateParams;
    this.usSpinnerService = usSpinnerService;
    this.defaultView = $stateParams.defaultView || 'listWeek';
    this.defaultDate = $stateParams.defaultDate || new Date();
    this.defaultStatus = $stateParams.defaultStatus || null;
    this.startInterval = null;
    this.endInterval = null;
    this.EventoService = EventoService;
    this.events = [];
    this.eventList = [];
    this.resetNumberResult();
    this.$state = $state;
    this.uiConfig = {
      calendar: {
        header: {
          //left: 'month basicWeek basicDay agendaWeek agendaDay',
          left: 'title',
          right: 'today prev,next',
          center: 'agendaDay,listWeek,agendaWeek,month'
          //right: 'today,month,basicWeek basicDay,agendaWeek,agendaDay,listWeek'
        },
        defaultView: this.defaultView,
        defaultDate: this.defaultDate,
        locale: 'pt-br',
        lang: 'pt-br',
        height: 500,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        selectable: true,
        eventLimit: true, // allow "more" link when too many events
        businessHours: [{
          dow: [1, 2, 3], // Monday, Tuesday, Wednesday
          start: '08:00', // 8am
          end: '18:00' // 6pm
        },
        {
          dow: [4, 5], // Thursday, Friday
          start: '10:00', // 10am
          end: '16:00' // 4pm
        }],
        selectHelper: true,
        startEditable: true,
        slotDuration: '01:00:00',
        timezone: 'local',
        loading(bool) {
          if(bool) {
            usSpinnerService.spin('spinner-1');
          } else {
            usSpinnerService.stop('spinner-1');
          }
          console.log('loading:', bool);
        },
        viewRender: view /*element*/ => {
          this.findEventListView(view);
        },
        /*eventRender(event, element, view) {
          console.log('eventRender', event, element, view);
          element.attr({
            tooltip: event.title
          });
          $compile(element)($scope);
        },*/
        eventClick: (calEvent, jsEvent, view) => {
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
          console.log('select', startDate.format(), endDate.format());
          let event = this.createEventSelect(startDate, endDate);
          this.openModalEvent(event);
        }
      }
    };
  }
  resetNumberResult() {
    this.pendente = 0;
    this.emAndamento = 0;
    this.concluido = 0;
    this.cancelado = 0;
  }
  createEventClick(calEvent) {
    let event = angular.copy(calEvent);
    event.start = this.momentToDate(event.start);
    if(event.end !== null) {
      event.end = this.momentToDate(event.end);
    }
    return event;
  }
  momentToDate(momentDate) {
    try {
      let stgStart = momentDate.format();
      return new Date(stgStart);
    } catch(err) {
      console.log(err);
      return null;
    }
  }
  createEventSelect(startDate, endDate) {
    return {
      title: 'Novo evento',
      start: this.momentToDate(startDate),
      end: this.momentToDate(endDate),
      status: 'Pendente',
      prioridade: 'Normal'
    };
  }
  openModalEvent(event) {
    let modalCtl = openModalView(event, this.Modal);
    modalCtl.defaultView = this.defaultView;
    modalCtl.defaultDate = this.defaultDate;
    this.EventoService.setModalCtl(modalCtl);
  }
  findEventListView(view) {
    this.setParamRealod(view);
    this.startInterval = view.intervalStart.format();
    this.endInterval = view.intervalEnd.format();
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
      this.resetNumberResult();
      this.eventList = eventList;
      this.eventList.forEach(item => {
        this.setColor(item);
      });
      let eventSource = {
        //color: '#378006',
        //textColor: '#FFF',
        //eventColor: '#378006',
        events: this.eventList,
      };
      this.events.pop();
      this.events.push(eventSource);
      console.log(this.events);
    };
  }
  setColor(item) {
    if(item.status === 'Pendente') {
      this.pendente++;
      item.color = '#f0ad4e';
    } else if(item.status === 'Em Andamento') {
      this.emAndamento++;
      item.color = '#428bca';
    } else if(item.status === 'Concluído') {
      this.concluido++;
      item.color = '#5cb85c';
    } else if(item.status === 'Cancelado') {
      this.cancelado++;
      item.color = '#d9534f';
    }
  }
  findEventListStatus(status) {
    this.defaultStatus = status;
    this.findEventList();
  }
}
