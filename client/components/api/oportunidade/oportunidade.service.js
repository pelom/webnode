'use strict';
import angular from 'angular';
export function OportunidadeService(OportunidadeResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let oppList = [];

  let qualificadas = 0;
  let negociadas = 0;
  let orcamentos = 0;
  let faturadas = 0;
  let pedidas = 0;

  let oportunidadeService = {
    getQualificadas() {
      return qualificadas;
    },
    getNegociadas() {
      return negociadas;
    },
    getOrcamentos() {
      return orcamentos;
    },
    getFaturadas() {
      return faturadas;
    },
    getPerdidas() {
      return pedidas;
    },
    getOportunidadeList() {
      return oppList;
    },
    loadDomain(callback) {
      return OportunidadeResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadOportunidadeList(query, callback) {
      return OportunidadeResource.query(query, function(data) {
        oppList = data;

        let countStatus = opps => {
          qualificadas = 0;
          negociadas = 0;
          orcamentos = 0;
          faturadas = 0;
          pedidas = 0;

          opps.forEach(item => {
            if(item.status === 'Qualificação') {
              qualificadas++;
            } else if(item.status === 'Orçamento') {
              orcamentos++;
            } else if(item.status === 'Negociação') {
              negociadas++;
            } else if(item.status === 'Faturamento') {
              faturadas++;
            } else if(item.status === 'Perdida') {
              pedidas++;
            }
          });
        };

        countStatus(oppList);

        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadOportunidade(oppLod, callback) {
      return OportunidadeResource.get(oppLod, function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveOportunidade(oppSave, callback) {
      if(angular.isUndefined(oppSave._id)) {
        return OportunidadeResource.save(oppSave, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return OportunidadeResource.update(oppSave, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return oportunidadeService;
}
