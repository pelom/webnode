'use strict';
import angular from 'angular';
export function OrcamentoService(OrcamentoResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let orcamentoList = [];
  let modalCtl;
  let orcamentoService = {
    getModalCtl() {
      return modalCtl;
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    getOrcamentoList() {
      return orcamentoList;
    },
    loadDomain(callback) {
      return OrcamentoResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadOrcamento(orcamento, callback) {
      return OrcamentoResource.get(orcamento, data => {
        orcamento = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadOrcamentoList(query, callback) {
      return OrcamentoResource.query(query, function(data) {
        orcamentoList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveProduto(newOrcamento, callback) {
      let orcamento = {
        _id: newOrcamento._id,
        nome: newOrcamento.nome,
        descricao: newOrcamento.descricao,
        contato: newOrcamento.contato,
        conta: newOrcamento.conta,
        itens: newOrcamento.itens,
        dataValidade: newOrcamento.dataValidade,
        valorTotal: newOrcamento.valorTotal,
      };

      if(angular.isUndefined(orcamento._id)) {
        return OrcamentoResource.save(orcamento, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return OrcamentoResource.update(orcamento, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return orcamentoService;
}
