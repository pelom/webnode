'use strict';

export function openModalView(contact, Modal) {
  let modalView = createModalView(`${contact.nome} ${contact.sobrenome}`);
  let showOpen = Modal.show.open();
  let modalCtl = showOpen(modalView);
  if(contact !== null) {
    modalCtl.dataSource = contact;
  }
  return modalCtl;
}

export function createModalView(title) {
  return {
    controller: 'ContatoModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./contato.modal.html')
  };
}

export function openModalContatoFind(Modal, params) {
  let modalView = createModalContatoFind('');
  let showOpen = Modal.show.open();
  let modalCtl = showOpen(modalView);
  if(params !== null) {
    modalCtl.params = params;
  }
  return modalCtl;
}

export function createModalContatoFind(title) {
  return {
    controller: 'ContatoFindModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./contatofind.modal.html')
  };
}
