'use strict';

export default class ContatoModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, ContatoService, Modal) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.Modal = Modal;
    this.usSpinnerService = usSpinnerService;
    this.ContatoService = ContatoService;
    this.ContatoService.loadDomain().then(domain => {
      this.origem = domain.origem;
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    this.contato = this.ContatoService.getModalCtl().dataSource;
  }

  saveContato(form) {
    if(form.$invalid) {
      return;
    }

    console.log(this.contato);

    this.usSpinnerService.spin('spinner-1');
    this.ContatoService.saveContato(this.contato)
    .then(newContato => {
      this.toastr.success('Contato salvo com sucesso.', `${newContato.nome} ${newContato.sobrenome}`);
      this.ContatoService.getModalCtl().onSaveEvent(newContato);
    })
    .catch(err => {
      console.log('Ex:', err);
      this.toastr.error(err.data.message, err.data.name, {
        autoDismiss: false,
        closeButton: true,
        timeOut: 0,
      });
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  close() {
    this.ContatoService.getModalCtl().onClose();
  }
}
