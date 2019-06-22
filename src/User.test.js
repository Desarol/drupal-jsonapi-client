/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import GlobalClient from './GlobalClient'
import User from './User'

import UserLoginResponse from './__data__/response_4.json'

describe('User', () => {
  it('can login and fetch user information', async () => {
    const USERNAME = 'test_username'
    const CSRF_TOKEN = 'test_csrf_token'
    GlobalClient.transport = async (request) => {
      if (request.url === '/user/login?_format=json') {
        UserLoginResponse.csrf_token = CSRF_TOKEN
        UserLoginResponse.current_user.name = USERNAME
        return { data: UserLoginResponse }
      }

      return null
    }

    const user = await User.Login(USERNAME, 'password')

    expect(user).toMatchSnapshot()
    expect(user.csrf_token).toEqual(CSRF_TOKEN)
    expect(user.current_user.name).toEqual(USERNAME)
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
