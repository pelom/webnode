'use strict';
import angular from 'angular';
export function LeadService(LeadResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let leadList = [];
  let naoContatados = 0;
  let contatados = 0;
  let convertidos = 0;
  let eventoService = {
    getNaoContatados() {
      return naoContatados;
    },
    getContatados() {
      return contatados;
    },
    getConvertidos() {
      return convertidos;
    },
    getLeadList() {
      return leadList;
    },
    loadDomain(callback) {
      return LeadResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadLeadList(query, callback) {
      return LeadResource.query(query, function(data) {
        leadList = data;

        let countStatus = leads => {
          naoContatados = 0;
          contatados = 0;
          convertidos = 0;
          leads.forEach(item => {
            if(item.status === 'Não Contatado') {
              naoContatados++;
            } else if(item.status === 'Contatado') {
              contatados++;
            } else if(item.status === 'Convertido') {
              convertidos++;
            }
          });
        };
        countStatus(leadList);
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadLead(lead, callback) {
      return LeadResource.get(lead, function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveLead(lead, callback) {
      if(angular.isUndefined(lead._id)) {
        return LeadResource.save(lead, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return LeadResource.update(lead, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return eventoService;
}
