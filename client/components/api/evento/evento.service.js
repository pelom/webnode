'use strict';
import angular from 'angular';
import moment from 'moment';

export function EventoService(EventoResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let numChecks = 0;
  let modalCtl;
  let eventoList = [];
  let evento;
  let pendente = 0;
  let emAndamento = 0;
  let concluido = 0;
  let cancelado = 0;
  let itemIsAtivo = [
    { name: 'Ativo', value: true },
    { name: 'Desativo', value: false }
  ];
  let eventoService = {
    getEvento() {
      return evento;
    },
    getEventoList() {
      return eventoList;
    },
    getItemIsAtivoDefault() {
      return itemIsAtivo;
    },
    getModalCtl() {
      return modalCtl;
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    getNumPendente() {
      return pendente;
    },
    getNumConcluido() {
      return concluido;
    },
    getNumEmAndamento() {
      return emAndamento;
    },
    getNumCancelado() {
      return cancelado;
    },
    getNumChecks() {
      return numChecks;
    },
    resetNumberResult() {
      pendente = 0;
      emAndamento = 0;
      concluido = 0;
      cancelado = 0;
    },
    isConcluido(ev) {
      return ev.status === 'Concluído';
    },
    isPendente(ev) {
      return ev.status === 'Pendente';
    },
    isEmAndamento(ev) {
      return ev.status === 'Em Andamento';
    },
    isCancelado(ev) {
      return ev.status === 'Cancelado';
    },
    setEventList(evList) {
      this.resetNumberResult();
      evList.forEach(item => {
        this.setEventStatus(item);
        if(this.isPendente(item)) {
          pendente++;
        } else if(this.isEmAndamento(item)) {
          emAndamento++;
        } else if(this.isConcluido(item)) {
          concluido++;
        } else if(this.isCancelado(item)) {
          cancelado++;
        }
      });
    },
    setEventStatus(ev) {
      if(this.isPendente(ev)) {
        ev.color = '#f0ad4e';
        ev.icon = 'fa-clock-o';
      } else if(this.isEmAndamento(ev)) {
        ev.color = '#428bca';
        ev.icon = 'fa-spinner';
      } else if(this.isConcluido(ev)) {
        ev.color = '#5cb85c';
        ev.icon = 'fa-check';
      } else if(this.isCancelado(ev)) {
        ev.color = '#d9534f';
        ev.icon = 'fa-ban';
      }
    },
    caclCents(evList) {
      if(!evList || evList.length == 0) {
        return 0;
      }
      let check = 0;
      evList.forEach(item => {
        if(this.isConcluido(item)) {
          check++;
        }
      });
      numChecks = check / evList.length * 100;
      return numChecks;
    },
    calcDuration(taskList) {
      let milleTotal = 0;
      taskList.forEach(item => {
        if(item.end) {
          var ms = moment(item.end).diff(moment(item.start));
          item.duration = this.formatHour(ms);
          milleTotal += ms;
        }
      });

      return this.formatHour(milleTotal);
    },
    formatHour(mille) {
      var days = moment.duration(mille);
      var hour = Math.floor(days.asHours());
      return this.formatDuration(hour, mille);
    },
    formatDuration(hour, mille) {
      return this.formatHourZero(hour) + moment.utc(mille).format(':mm:ss');
    },
    formatHourZero(hour) {
      return hour < 10 ? `0${hour}` : hour;
    },
    createEvent(startDate, endDate) {
      let ev = {
        title: startDate.format('LLLL'),
        start: this.momentToDate(startDate),
        end: this.momentToDate(endDate),
        status: 'Pendente',
        prioridade: 'Normal'
      };
      return this.configEvent(ev);
    },
    createEventTask(title, subject) {
      return {
        title,
        subject,
        type: 'Task',
        start: new Date(),
        status: 'Pendente',
        prioridade: 'Normal'
      };
    },
    momentToDate(momentDate) {
      try {
        return moment(momentDate.format()).toDate();
      } catch(err) {
        console.log(err);
        return null;
      }
    },
    configEvent(ev) {
      let evList = [ev];
      this.setEventList(evList);
      return evList[0];
    },
    loadDomain(callback) {
      return EventoResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadCalendar(callback) {
      return EventoResource.calendar(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadEvento(ev, callback) {
      return EventoResource.get(ev, data => {
        data.start = new Date(data.start);
        if(data.end) {
          data.end = new Date(data.end);
        }
        data = this.configEvent(data);
        evento = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadEventoList(query, callback) {
      return EventoResource.query(query, data => {
        eventoList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveEvent(newEvent, callback) {
      let event = {
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        allDay: newEvent.allDay,
        _id: newEvent._id,
        local: newEvent.local,
        descricao: newEvent.descricao,
        prioridade: newEvent.prioridade,
        status: newEvent.status,
        subject: newEvent.subject,
        isAtivo: newEvent.isAtivo,
        proprietario: newEvent.proprietario,
        origin: newEvent.origin,
        references: newEvent.references,
        type: newEvent.type
      };
      if(angular.isUndefined(event._id)) {
        return EventoResource.save(event, function(data) {
          evento = data;
          return safeCb(callback)(evento);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return EventoResource.update(event, function(data) {
        evento = data;
        return safeCb(callback)(evento);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    deleteEvent(event, callback) {
      return EventoResource.delete({id: event._id}, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return eventoService;
}
