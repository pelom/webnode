'use strict';

export default class PerfilController {
  /*@ngInject*/
  constructor(UsuarioService, Auth, $state, Modal) {
    this.Auth = Auth;
    this.$state = $state;
    this.meProfile = {};
    this.Modal = Modal;
    UsuarioService.loadMeProfile().then(meProfile => {
      this.meProfile = meProfile;
      console.log(meProfile);

      this.openModalView();
    });
    this.user = {
      nome: 'André',
      sobrenome: 'Leite',
      email: 'pelommedrado@gmail.com',
      telefone: '11 5555 6666',
      celular: '11 9 7988 5555',
      endereco: {
        rua: 'Rua Ângelo Dedivitis',
        cep: '04410-060',
        bairro: 'Americanópolis',
        cidade: 'São Paulo',
        estado: 'SP',
        complemento: 'Minha Casa',
        numero: '441'
      }
    };
  }

  openModalView() {
    let modalView = this.createModalView(this.meProfile.nome + ' ' + this.meProfile.sobrenome);
    let showOpen = this.Modal.show.open();
    let modalCtl = showOpen(modalView);
    return modalCtl;
  }

  createModalView(title) {
    return {
      controller: 'PerfilEditModalController',
      controllerAs: 'ctl',
      dismissable: false,
      backdrop: 'static',
      keyboard: false,
      title,
      html: require('./perfiledit.modal.html')
    };
  }
}
