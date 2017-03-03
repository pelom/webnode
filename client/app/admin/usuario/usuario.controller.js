'use strict';

export default class UsuarioController {
  /*@ngInject*/
  constructor(User, PermissaoService) {
    this.PermissaoService = PermissaoService;
    // Use the User $resource to fetch all users
    this.users = User.query();
    this.profiles = [];
    this.PermissaoService.loadProfileList();
  }
  selectOptionProfile() {
    return this.PermissaoService.getProfileList();
  }
  newUser() {
    this.isNovo = true;
    this.user = {
      nome: '',
      sobrenome: '',
      username: '',
      email: '',
      telefone: '',
      celular: '',
    }
  }
  editUser(user) {
    let userClone = angular.copy(user);
    this.isNovo = true;
    this.user = userClone;
  }
  saveUser(form) {
    console.log(this.user);
  }
  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}
