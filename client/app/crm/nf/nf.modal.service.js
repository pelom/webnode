'use strict';

export function openNfPagamentoModalView(Modal, params) {
  let modalView = createNfPagamentoModalView('');
  let showOpen = Modal.show.open();
  let modalCtl = showOpen(modalView);
  if(params !== null) {
    modalCtl.params = params;
  }
  return modalCtl;
}

export function createNfPagamentoModalView(title) {
  return {
    controller: 'NfPagamentoModalController',
    controllerAs: 'ctl',
    dismissable: false,
    backdrop: 'static',
    keyboard: false,
    title,
    html: require('./nfpagamento.modal.html')
  };
}
