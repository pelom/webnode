'use strict';
import angular from 'angular';
export default class UsuarioEditController {
  errors = {};
  isCollapsed = true;
  /*@ngInject*/
  constructor($stateParams, $state, UsuarioService, PermissaoService, toastr) {
    this.id = $stateParams.id;
    this.$state = $state;
    this.toastr = toastr;
    this.UsuarioService = UsuarioService;
    this.PermissaoService = PermissaoService;
    this.PermissaoService.loadProfileList(err => {
      if(err) {
        return;
      }

      if(this.id) {
        this.UsuarioService.loadUser({ id: $stateParams.id }, (err, user) => {
          if(err) {
            return;
          }
          this.user = user;
          this.user.isNotificar = false;
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
    this.situacao = this.UsuarioService.getItemIsAtivoDefault();
  }
  selectOptionProfile() {
    return this.PermissaoService.getProfileList();
  }
  saveUser(form) {
    if(form.$invalid) {
      return;
    }
    this.UsuarioService.saveUser(this.user)
      .then(() => {
        this.toastr.success('Usuário salvo com sucesso', `${this.user.nome} ${this.user.sobrenome}`);
        this.$state.go('usuario');
      })
      .catch(err => {
        console.log('Ex:', err);
        this.toastr.error(err.data.message, err.data.name, {
          autoDismiss: false,
          closeButton: true,
          timeOut: 0,
        });
        err = err.data;
        this.errors = {};

        angular.forEach(err.errors, (error, field) => {
          if(form.hasOwnProperty(field)) {
            form[field].$setValidity('mongoose', false);
          } else {
            this.toastr.error(error.message, field, {
              closeButton: true,
            });
          }
          this.errors[field] = error.message;
        });
      });
  }
}
