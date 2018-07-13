import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/users',
    method: 'get',
    params
  })
}

export function updateUser(data) {
  return request({
    url: '/api/user',
    method: 'put',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/api/user',
    method: 'post',
    data
  })
}

export function deleteUser(username) {
  return request({
    url: '/api/user?username=' + username,
    method: 'delete'
  })
}

export function checkUsername(username) {
  return request({
    url: '/api/user/checkUsername?username=' + username,
    method: 'get'
  })
}
