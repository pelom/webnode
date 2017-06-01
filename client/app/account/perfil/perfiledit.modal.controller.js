'use strict';
export default class PerfilEditModalController {
  /*@ngInject*/
  constructor(UsuarioService, $state, $scope, toastr, usSpinnerService) {
    UsuarioService.loadMeProfile().then(meProfile => {
      this.meProfile = meProfile;
      console.log(meProfile);
    });
  }
}
