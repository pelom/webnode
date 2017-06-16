export function ContaResource($resource) {
  'ngInject';
  return $resource('/api/account/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    },
  });
}
