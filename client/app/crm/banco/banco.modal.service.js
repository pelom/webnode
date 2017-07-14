'use strict';

export function openBancoPagamentoModalView(Modal, params) {
  let modalView = createBancoPagamentoModalView('');
  let showOpen = Modal.show.open();
  let modalCtl = showOpen(modalView);
  if(params !== null) {
    modalCtl.params = params;
  }
  return modalCtl;
}

export function createBancoPagamentoModalView(title) {
  return {
    controller: 'BancoPagamentoModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./bancopagamento.modal.html')
  };
}
