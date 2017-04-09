'use strict';

export default class UsuarioController {
  /*@ngInject*/
  constructor(UsuarioService) {
    UsuarioService.loadUserList()
    .then(users => {
      this.users = users;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    this.profiles = [];
  }
}
