'use strict';
import angular from 'angular';
export function ContaService(ContaResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let contaList = [];
  let conta = {};
  let contaService = {
    getContaList() {
      return contaList;
    },
    loadDomain(callback) {
      return ContaResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadConta(acc, callback) {
      return ContaResource.get(acc, data => {
        conta = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadContaList(query, callback) {
      return ContaResource.query(query, function(data) {
        contaList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveConta(newAccount, callback) {
      let account = {
        _id: newAccount._id,
        nome: newAccount.nome,
        cpf: newAccount.cpf,
        cnpj: newAccount.cnpj,
        telefone: newAccount.telefone,
        descricao: newAccount.descricao,
        origem: newAccount.origem,
        endereco: newAccount.endereco,
      };
      if(angular.isUndefined(account._id)) {
        return ContaResource.save(account, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return ContaResource.update(account, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return contaService;
}
