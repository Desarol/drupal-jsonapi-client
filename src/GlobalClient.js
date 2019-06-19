import axios from 'axios'
import Client from './Client'

const GlobalClient = new Client({
  transport: axios.request,
  baseUrl: '',
  authorization: null,
  sendCookies: false,
  middleware: [],
})

export default GlobalClient
