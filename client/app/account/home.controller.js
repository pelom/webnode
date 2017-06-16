/* eslint no-sync: 0 */

'use strict';
import angular from 'angular';
import Controller from './controller';
import {openModalView} from './agenda/agenda.model.service';
import moment from 'moment';

export default class HomeController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $location,
    EventoService, toastr, usSpinnerService, Auth, Modal) {
    super($window, $scope, toastr, usSpinnerService);
    //this.toastr = toastr;
    this.isAdmin = Auth.isAdminSync;
    //this.usSpinnerService = usSpinnerService;
    this.Modal = Modal;
    this.init($stateParams);
    this.EventoService = EventoService;
    this.EventoService.loadCalendar()
      .then(this.initCalendar($stateParams));
    //this.managerLayout($window, $scope);
  }

  init($stateParams) {
    this.defaultView = $stateParams.defaultView || 'listWeek';
    this.defaultDate = $stateParams.defaultDate || new Date();
    this.defaultStatus = $stateParams.defaultStatus || '';
    this.startInterval = null;
    this.endInterval = null;
    this.eventSources = [];
    this.checks = 0;
  }

  initCalendar($stateParams) {
    return calendar => {
      let calendarDefault = this.createCalendar();
      let config = Object.assign(calendarDefault, calendar);
      moment.locale(config.locale);
      config.businessHours.forEach(item => {
        item._id = undefined;
      });
      this.uiConfig = {
        calendar: config
      };

      if($stateParams.eventId) {
        this.openModalEventId($stateParams.eventId);
      }
    };
  }

  /*managerLayout($window, $scope) {
    this.width = $window.innerWidth;

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
  }*/

  createCalendar() {
    return {
      defaultView: this.defaultView,
      defaultDate: this.defaultDate,
      viewRender: view /*element*/ => {
        this.findEventListView(view);
      },
      eventRender: (event, element, view) => {
        if(view.name == 'listWeek') {
          this.renderViewListWeek(event, element);
        } else {
          this.renderView(event, element);
        }
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
        let event = this.EventoService.createEvent(startDate, endDate);
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
    };
  }

  renderViewListWeek(event, element) {
    let sCell = `<span style="color:${event.color}"><i class="fa ${event.icon}" aria-hidden="true"></i> ${event.title}</span><br/>`;
    let sCell1 = ` <span title="Tarefas (${event.tarefas.length})" class="badge"> ${event.tarefas.length}</span> <br/>`;
    let sCell2 = `<span title="Assunto (${event.subject})" class="label label-default"> ${event.subject}</span>`;
    let sCell3 = `<small title="Prioridade (${event.prioridade})"> ${event.prioridade}</small>`;
    //let sCell3 = ` / <a target="_black" href="/usuario/edit/${event.proprietario._id}">${event.proprietario.nome} ${event.proprietario.sobrenome}</a>`;
    let cell = sCell
      + (event.subject ? sCell2 : '')
      + sCell3
      + (event.tarefas.length != 0 ? sCell1 : '');

    element.find('td.fc-list-item-title').html(cell);
  }

  renderView(event, element) {
    element.attr('title', event.start.format('LLLL'));
    element.find('.fc-title')
      .html(`<i class="fa ${event.icon}" aria-hidden="true"></i> <b>${event.title}</b>`);
    if(event.origin) {
      element.find('.fc-title').after(
        `&nbsp;<span style="color: #777;">[${event.origin.title}]</span>`);
    }
  }

  createEventClick(calEvent) {
    let evento = angular.copy(calEvent);
    evento.start = this.EventoService.momentToDate(evento.start);
    if(evento.end !== null) {
      evento.end = this.EventoService.momentToDate(evento.end);
    }
    return evento;
  }

  openModalEventId(eventId) {
    this.usSpinnerService.spin('spinner-1');
    this.EventoService.loadEvento({id: eventId})
    .then(event => {
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

  openModalEvent(event) {
    let modalCtl = openModalView(event, this.Modal);
    modalCtl.onSaveEvent = ev => {
      console.log('onSaveEvent()', ev);
      modalCtl.dismiss();
      this.findEventList();
    };
    modalCtl.onDeleteEvent = ev => {
      console.log('onDeleteEvent()', ev);
      modalCtl.dismiss();
      this.findEventList();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    modalCtl.onSaveTask = () => {
      this.findEventList();
    };
    this.EventoService.setModalCtl(modalCtl);
  }

  findEventListView(view) {
    this.setParamRealod(view);
    this.startInterval = view.intervalStart.local().format();
    this.endInterval = view.intervalEnd.local().format();
    this.findEventList();
  }

  setParamRealod(view) {
    this.defaultView = view.name;
    this.defaultDate = view.intervalStart.format();
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

  callbackLoadEventoList() {
    return eventList => {
      this.EventoService.setEventList(eventList);
      this.checks = this.EventoService.caclCents(eventList);
      let eventSource = {
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

  isActive(path) {
    if(this.defaultStatus == '' && path == '') {
      return true;
    }
    return this.defaultStatus == path;
  }

  /*isJustified() {
    if(this.isFull()) {
      return 'nav-justified';
    }
    return '';
  }

  isFull() {
    return this.width >= 800;
  }*/
}
