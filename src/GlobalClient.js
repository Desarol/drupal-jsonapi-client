import Client from './Client'

const GlobalClient = new Client({
  transport: () => {},
  baseUrl: '',
  authorization: null,
  sendCookies: false,
  middleware: [],
})

export default GlobalClient
