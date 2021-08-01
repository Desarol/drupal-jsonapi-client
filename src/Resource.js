import QueryParameters from './QueryParameters'

const withMimeType = req => ({
  ...req,
  headers: {
    ...req.headers,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
})

class Resource {
  static Get({
    type,
    id,
  }) {
    const [p1, p2] = type.split('--')

    return withMimeType({
      method: 'GET',
      url: `/${p1}/${p2}/${id}`,
    })
  }

  static GetList({
    type,
    filter = null,
    include = [],
    offset = 0,
    limit = 50,
  }) {
    const [p1, p2] = type.split('--')
    const params = [
      `page[offset]=${offset}`,
      `page[limit]=${limit}`,
    ]

    if (filter != null) {
      params.push(typeof filter.query === 'function' ? filter.query() : filter)
    }

    if (include.length > 0) {
      params.push(`include=${include.join(',')}`)
    }

    const queryParameters = new QueryParameters(params)
    return withMimeType({
      method: 'GET',
      url: `/${p1}/${p2}?${queryParameters.toString(Number.MAX_SAFE_INTEGER)}`,
    })
  }

  static New({
    type,
    data,
  }) {
    const [p1, p2] = type.split('--')

    return withMimeType({
      url: `/${p1}/${p2}`,
      method: 'POST',
      data: JSON.stringify(data),
    })
  }
}

export default Resource
