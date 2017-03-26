'use strict';

//import angular from 'angular';

export default class SignupValidController {
  /*@ngInject*/
  constructor($state) {
    this.token = $state.params.token;
    console.log(this.token);
    //TODO: redirecionar para login quando a senha estiver configurada
    /*Auth.signupvalid(token)
      .then(() => {
        // Account created, redirect to home
        $state.go('main');
        //$state.go(referrer);
      })
      .catch(err => {
        console.log(err);
      });
    */
  }
}
