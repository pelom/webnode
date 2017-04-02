'use strict';

export function UsuarioResource($resource) {
  'ngInject';
  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    register: {
      method: 'POST',
      params: {
        id: 'register'
      }
    },
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    }
  });
}
