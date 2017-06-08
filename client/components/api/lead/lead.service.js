'use strict';
//import angular from 'angular';
export function LeadService(LeadResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let leadList = [];
  let eventoService = {
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
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return eventoService;
}
