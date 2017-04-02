'use strict';

export function UserResource($resource) {
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
    signupvalid: {
      method: 'PUT',
      params: {
        controller: 'signupvalid'
      }
    },
    getsignupvalid: {
      method: 'GET',
      params: {
        controller: 'signupvalid'
      }
    },
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
