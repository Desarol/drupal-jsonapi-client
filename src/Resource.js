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
    query = null,
  }) {
    const [p1, p2] = type.split('--')
    const params = query ? `?${query}` : ''

    return withMimeType({
      method: 'GET',
      url: `/${p1}/${p2}/${id}${params}`,
    })
  }

  static GetList({
    type,
    filter = null,
    sort = null,
    query = [],
    include = [],
    offset = 0,
    limit = 50,
  }) {
    const [p1, p2] = type.split('--')
    const params = [
      ...query,
      `page[offset]=${offset}`,
      `page[limit]=${limit}`,
    ]

    if (filter !== null) {
      params.push(typeof filter.query === 'function' ? filter.query() : filter)
    }

    if (sort !== null) {
      params.push(typeof sort.query === 'function' ? sort.query() : sort)
    }

    if (include.length > 0) {
      params.push(`include=${include.join(',')}`)
    }

    return withMimeType({
      method: 'GET',
      url: `/${p1}/${p2}?${new QueryParameters(params).toString(Number.MAX_SAFE_INTEGER)}`,
    })
  }

  static New({
    type,
    data = {},
  }) {
    const [p1, p2] = type.split('--')

    return withMimeType({
      url: `/${p1}/${p2}`,
      method: 'POST',
      data: JSON.stringify({
        data: {
          type,
          ...data,
        },
      }),
    })
  }

  static Update({
    type,
    id,
    data = {},
  }) {
    const [p1, p2] = type.split('--')

    return withMimeType({
      url: `/${p1}/${p2}/${id}`,
      method: 'PATCH',
      data: JSON.stringify({
        data: {
          type,
          id,
          ...data,
        },
      }),
    })
  }
}

export default Resource
