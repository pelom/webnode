'use strict';
import angular from 'angular';
export function BancoService(BancoResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let bancoList = [];
  let banco;
  let modalCtl;
  let bancoService = {
    getBanco() {
      return banco;
    },
    getModalCtl() {
      return modalCtl;
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    loadDomain(callback) {
      return BancoResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    accountPayable(query, callback) {
      return BancoResource.accountPayable(query, data => {
        banco = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadBanco(bank, callback) {
      return BancoResource.get(bank, data => {
        banco = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadBancoList(query, callback) {
      return BancoResource.query(query, function(data) {
        bancoList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveBanco(newBanco, callback) {
      let bank = {
        _id: newBanco._id,
        nome: newBanco.nome,
        descricao: newBanco.descricao,
        agencia: newBanco.agencia,
        conta: newBanco.conta,
        codigo: newBanco.codigo,
        account: newBanco.account,
        contact: newBanco.account,
        saldoInicial: newBanco.saldoInicial,
      };
      if(angular.isUndefined(bank._id)) {
        return BancoResource.save(bank, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return BancoResource.update(bank, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    operation(operation, callback) {
      return BancoResource.operation(operation, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return bancoService;
}
