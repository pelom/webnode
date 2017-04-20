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
    loadEvento(ev, callback) {
      return EventoResource.get(ev, function(data) {
        evento = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadEventoList(callback) {
      return EventoResource.query(function(data) {
        eventoList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return eventoService;
}
