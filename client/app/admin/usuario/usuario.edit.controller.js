'use strict';

export default class UsuarioEditController {
  /*@ngInject*/
  constructor($stateParams, UsuarioService, PermissaoService) {
    this.id = $stateParams.id;
    this.UsuarioService = UsuarioService;
    this.PermissaoService = PermissaoService;
    this.PermissaoService.loadProfileList((err, prof) => {
      if(err) {
        return;
      }

      if(this.id) {
        this.UsuarioService.loadUser({ id: $stateParams.id }, (err, user) => {
          this.user = user;
        });
      } else {
        this.user = {
          nome: '',
          sobrenome: '',
          username: '',
          email: '',
          telefone: '',
          celular: ''
        }
      }
    });
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
