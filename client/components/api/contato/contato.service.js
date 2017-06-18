'use strict';
import angular from 'angular';
export function ContatoService(ContatoResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let contatoList = [];
  let contato = {};
  let modalCtl;
  let contatoService = {
    getContatoList() {
      return contatoList;
    },
    getModalCtl() {
      return modalCtl;
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    loadDomain(callback) {
      return ContatoResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadContato(acc, callback) {
      return ContatoResource.get(acc, data => {
        if(data.dataNascimento) {
          data.dataNascimento = new Date(data.dataNascimento);
        }
        contato = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadContatoList(query, callback) {
      return ContatoResource.query(query, function(data) {
        contatoList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveContato(newContact, callback) {
      let contact = {
        _id: newContact._id,
        nome: newContact.nome,
        sobrenome: newContact.sobrenome,
        telefone: newContact.telefone,
        celular: newContact.celular,
        email: newContact.email,
        dataNascimento: newContact.dataNascimento,
        descricao: newContact.descricao,
        origem: newContact.origem,
        endereco: newContact.endereco,
        conta: newContact.conta,
        titulo: newContact.titulo,
        cargo: newContact.cargo,
      };
      if(angular.isUndefined(contact._id)) {
        return ContatoResource.save(contact, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return ContatoResource.update(contact, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return contatoService;
}
