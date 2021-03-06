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
    controller: 'ContaFindModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./contafind.modal.html')
  };
}
