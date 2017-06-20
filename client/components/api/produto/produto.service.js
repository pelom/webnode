'use strict';
import angular from 'angular';
export function ProdutoService(ProdutoResource, Util) {
  'ngInject';
  let safeCb = Util.safeCb;
  let produtoList = [];
  let produto = [];
  let modalCtl;
  let produtoService = {
    getModalCtl() {
      return modalCtl;
    },
    setModalCtl(modCtl) {
      modalCtl = modCtl;
    },
    getProdutoList() {
      return produtoList;
    },
    loadDomain(callback) {
      return ProdutoResource.domain(function(data) {
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadProduto(product, callback) {
      return ProdutoResource.get(product, data => {
        produto = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    loadProdutoList(query, callback) {
      return ProdutoResource.query(query, function(data) {
        produtoList = data;
        return safeCb(callback)(null, data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
    saveProduto(newProduct, callback) {
      let product = {
        _id: newProduct._id,
        nome: newProduct.nome,
        descricao: newProduct.descricao,
        marcar: newProduct.marcar,
        modelo: newProduct.modelo,
        codigo: newProduct.codigo,
        categoria: newProduct.categoria,
        subcategoria: newProduct.subcategoria,
        uso: newProduct.uso,
        unidade: newProduct.unidade,
      };
      if(angular.isUndefined(product._id)) {
        return ProdutoResource.save(product, function(data) {
          return safeCb(callback)(data);
        }, function(err) {
          console.log('Ex:', err);
          return safeCb(callback)(err);
        }).$promise;
      }
      return ProdutoResource.update(product, function(data) {
        return safeCb(callback)(data);
      }, function(err) {
        console.log('Ex:', err);
        return safeCb(callback)(err);
      }).$promise;
    },
  };
  return produtoService;
}
