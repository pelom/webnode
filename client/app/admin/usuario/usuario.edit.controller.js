'use strict';

export default class UsuarioEditController {
  /*@ngInject*/
  constructor($stateParams, $state, UsuarioService, PermissaoService) {
    this.id = $stateParams.id;
    this.$state = $state;
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
          celular: '',
          isNotificar: true
        };
      }
    });
  }
  selectOptionProfile() {
    return this.PermissaoService.getProfileList();
  }
  saveUser(form) {
    console.log(this.user);
    if(form.$invalid) {
      return;
    }
    this.UsuarioService.saveUser(this.user)
      .then(user => {
        console.log('this.user', user);
        this.$state.go('usuarios');
      })
      .catch(err => {
        console.log('Ex:', err);
      });
  }
}
