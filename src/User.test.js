/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import { Request, Response } from 'node-fetch'
import GlobalClient from './GlobalClient'
import User from './User'

import UserLoginResponse from './__data__/response_4.json'
import GetUserResponse from './__data__/response_3.json'

global.Request = Request
global.Response = Response

describe('User', () => {
  it('can login and fetch user information', async () => {
    const USERNAME = 'test_username'
    const CSRF_TOKEN = 'test_csrf_token'
    GlobalClient.transport = async (request) => {
      if (request.url === '/user/login?_format=json') {
        UserLoginResponse.csrf_token = CSRF_TOKEN
        UserLoginResponse.current_user.name = USERNAME
        return new Response(JSON.stringify(UserLoginResponse))
      }

      if (request.url.indexOf('/jsonapi/user/user') === 0) {
        GetUserResponse.data[0].attributes.name = USERNAME
        return new Response(JSON.stringify(GetUserResponse))
      }

      return null
    }

    const user = await User.Login(USERNAME, 'password')

    expect(user).toBeInstanceOf(User)
    expect(user._csrfToken).toEqual(CSRF_TOKEN)
    expect(user.name).toEqual(USERNAME)
  })

  it('can be set as default user', async () => {
    const USER_UUID = 'uuid'
    const CSRF_TOKEN = 'csrf_token'

    const user = new User(USER_UUID, CSRF_TOKEN)
    user.setDefault()

    expect(user._csrfToken).toEqual(CSRF_TOKEN)
    expect(GlobalClient.user).toEqual(user)
  })
})
