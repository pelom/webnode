'use strict';

export default class UsuarioEditController {
  /*@ngInject*/
  constructor($stateParams, User, PermissaoService) {
    this.id = $stateParams.id;
    this.PermissaoService = PermissaoService;
    this.profiles = [];
    this.PermissaoService.loadProfileList((err, prof) => {
      if(err) {
        return;
      }
      let profile = prof[1];
      if(this.id) {
        this.User.get({ id: $stateParams.id }, us => {
          this.user = us;
        });
      } else {
        this.user = {
          nome: '',
          sobrenome: '',
          username: '',
          email: '',
          telefone: '',
          celular: '',
          profileId: profile._id
        }
      }
    });
    this.User = User;
  }
  selectOptionProfile() {
    return this.PermissaoService.getProfileList();
  }
  saveUser(form) {
    console.log(this.user);
  }
  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}
