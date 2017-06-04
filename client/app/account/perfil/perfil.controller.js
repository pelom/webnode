'use strict';

export default class PerfilController {
  /*@ngInject*/
  constructor(UsuarioService, Auth, $state, Modal, usSpinnerService) {
    this.Auth = Auth;
    this.$state = $state;
    this.meProfile = {};
    this.Modal = Modal;
    this.usSpinnerService = usSpinnerService;
    this.UsuarioService = UsuarioService;
    UsuarioService.loadMeProfile().then(meProfile => {
      this.meProfile = meProfile;
      console.log(meProfile);
      this.usSpinnerService.stop('spinner-1');
    });
  }

  openModalView() {
    let modalView = this.createModalView(this.meProfile.nome + ' ' + this.meProfile.sobrenome);
    let showOpen = this.Modal.show.open();
    let modalCtl = showOpen(modalView);
    this.UsuarioService.setModalCtl(modalCtl);
    return modalCtl;
  }

  createModalView(title) {
    return {
      controller: 'PerfilEditModalController',
      controllerAs: 'ctl',
      dismissable: true,
      backdrop: 'static',
      //keyboard: true,
      title,
      html: require('./perfiledit.modal.html')
    };
  }
}
