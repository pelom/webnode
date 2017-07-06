'use strict';
import angular from 'angular';
export function NfService(NfResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let nfList = [];
  let notaFiscal;
  let modalCtl;
  let produtoService = {
    getModalCtl() {
      return modalCtl;
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    loadDomain(callback) {
      return NfResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadNf(nf, callback) {
      return NfResource.get(nf, data => {
        notaFiscal = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadNfList(query, callback) {
      return NfResource.query(query, function(data) {
        nfList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveNf(newNf, callback) {
      let nf = {
        _id: newNf._id,
        titulo: newNf.titulo,
        descricao: newNf.descricao,
      };
      if(angular.isUndefined(nf._id)) {
        return NfResource.save(nf, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return NfResource.update(nf, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    uploadFile(file, callback) {
      return NfResource.upload(file, function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    }
  };
  return produtoService;
}
