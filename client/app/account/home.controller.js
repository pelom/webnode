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
    this.defaultView = $stateParams.defaultView || 'listWeek';
    this.defaultDate = $stateParams.defaultDate || {};
    this.EventoService = EventoService;
    this.events = [];
    this.eventList = [];
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
          this.defaultView = view.name;
          this.defaultDate = view.intervalStart.format();
          usSpinnerService.spin('spinner-1');
          EventoService.loadEventoList({
            start: view.intervalStart.format(),
            end: view.intervalEnd.format()
          })
            .then(eventList => {
              this.eventList = eventList;
              this.eventList.forEach(item => {
                if(item.status === 'Pendente') {
                  item.color = '#f0ad4e';
                } else if(item.status === 'Em Andamento') {
                  item.color = '#428bca';
                } else if(item.status === 'Concluído') {
                  item.color = '#5cb85c';
                } else if(item.status === 'Cancelado') {
                  item.color = '#d9534f';
                }
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
            })
            .finally(() => {
              usSpinnerService.stop('spinner-1');
            });
        },
        /*eventRender(event, element, view) {
          console.log('eventRender', event, element, view);
          element.attr({
            tooltip: event.title
          });
          $compile(element)($scope);
        },*/
        eventClick: (calEvent, jsEvent, view) => {
          let event = this.createEvent(calEvent);
          let modalCtl = openModalView(event, this.Modal);
          modalCtl.defaultView = this.defaultView;
          modalCtl.defaultDate = this.defaultDate;
          this.EventoService.setModalCtl(modalCtl);
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
          let modalCtl = openModalView({
            title: 'Novo',
            start: this.momentToDate(startDate),
            end: this.momentToDate(endDate),
            status: 'Pendente',
            prioridade: 'Normal'
          }, this.Modal);
          modalCtl.defaultView = this.defaultView;
          modalCtl.defaultDate = this.defaultDate;
          this.EventoService.setModalCtl(modalCtl);
        }
      }
    };
  }
  createEvent(calEvent) {
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
}
