'use strict';
import angular from 'angular';
export function EventoService(EventoResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let modalCtl;
  let eventoList = [];
  let evento;
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
    loadDomain(callback) {
      return EventoResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadEvento(ev, callback) {
      return EventoResource.get(ev, function(data) {
        evento = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadEventoList(query, callback) {
      return EventoResource.query(query, function(data) {
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
        nome: newEvent.nome,
        descricao: newEvent.descricao,
        prioridade: newEvent.prioridade,
        status: newEvent.status,
        isAtivo: newEvent.isAtivo,
        proprietario: newEvent.proprietario,
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
  };
  return eventoService;
}
