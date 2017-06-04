'use strict';
export default class PerfilEditModalController {
  /*@ngInject*/
  constructor(UsuarioService, $state, $scope, toastr, usSpinnerService) {
    this.UsuarioService = UsuarioService;
    this.usSpinnerService = usSpinnerService;
    this.toastr = toastr;
    this.$state = $state;
    this.modalCtl = UsuarioService.getModalCtl();
    UsuarioService.loadMeProfile().then(meProfile => {
      this.meProfile = meProfile;
      console.log(meProfile);
      this.usSpinnerService.stop('spinner-1');
    });
  }

  saveProfile() {
    this.usSpinnerService.spin('spinner-1');
    this.UsuarioService.updateProfile(this.meProfile).then(userProfile => {
      this.toastr.success('Perfil salvo com sucesso.');
      console.log(userProfile);
      this.modalCtl.dismiss();
      this.$state.go('perfil', {}, {reload: true});
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
}
