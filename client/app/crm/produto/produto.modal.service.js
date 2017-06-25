'use strict';

export function openModalView(Modal, params) {
  let modalView = createModalView('');
  let showOpen = Modal.show.open();
  let modalCtl = showOpen(modalView);
  if(params !== null) {
    modalCtl.params = params;
  }
  return modalCtl;
}

export function createModalView(title) {
  return {
    controller: 'ProdutoFindModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./produtofind.modal.html')
  };
}

export function openModalProdutoCatalogFind(Modal, params) {
  let modalView = createModalProdutoCatalogFind('');
  let showOpen = Modal.show.open();
  let modalCtl = showOpen(modalView);
  if(params !== null) {
    modalCtl.params = params;
  }
  return modalCtl;
}

export function createModalProdutoCatalogFind(title) {
  return {
    controller: 'ProdutoCatalogFindModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./produtocatalogfind.modal.html')
  };
}
