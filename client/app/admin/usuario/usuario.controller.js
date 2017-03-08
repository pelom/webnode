'use strict';

export default class UsuarioController {
  /*@ngInject*/
  constructor(User) {
    this.users = User.query();
    this.profiles = [];
  }
}
