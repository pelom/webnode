export function PermissaoResource($resource) {
  'ngInject';
  return $resource('/api/profile/:id/:controller', {
    id: '@_id'
  }, {
    /*modulo: {
      method: 'PUT',
      params: {
        controller: 'modulo'
      }
    }*/
  });
}
