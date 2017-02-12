export function PermissaoResource($resource) {
  'ngInject';
  return $resource('/api/application/:id/:controller', {
    id: '@_id'
  }, {
    modulo: {
      method: 'PUT',
      params: {
        controller: 'modulo'
      }
    }
  });
}
