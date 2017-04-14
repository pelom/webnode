'use strict';

export default class LoginController {
  user = {
    username: '',
    password: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $state, $scope) {
    this.Auth = Auth;
    this.$state = $state;
    this.$scope = $scope;
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.login({
        username: this.user.username, password: this.user.password
      })
      .then(/*user*/() => {
        this.$state.go('home');
        /*this.Auth.isAdmin(result => {
          if(result) {
            this.$state.go('admin');

            this.$scope.$emit('newapp', {
              name: 'Standard',
              show: true,
              menuLeft: [
                { state: 'usuario', title: 'Usuários', show: true },
                { state: 'permissoes', title: 'Permissões', show: true },
                { state: 'aplicacoes', title: 'Aplicações', show: true }
              ],
              menuRight: [
                //{ state: 'signup', title: 'Cadastre-se', icon: 'fa-edit', show: false },
                //{ state: 'login', title: 'Entrar', icon: 'fa-sign-in', show: true }
              ]
            });
            return result;
          }
          this.$state.go('perfil');
        });*/
      })
      .catch(err => {
        this.errors.login = err.message;
      });
    }
  }
}
