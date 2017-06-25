export function OportunidadeResource($resource) {
  'ngInject';
  return $resource('/api/opportunity/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
    domain: {
      method: 'GET',
      params: {
        id: 'domain'
      }
    }
  });
}
