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
