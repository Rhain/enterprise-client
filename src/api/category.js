import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/category',
    method: 'get',
    params
  })
}

export function updateCategory(data) {
  return request({
    url: '/api/category',
    method: 'put',
    data
  })
}

export function addCategory(data) {
  return request({
    url: '/api/category',
    method: 'post',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: '/api/category?id=' + id,
    method: 'delete'
  })
}

export function checkName(name) {
  return request({
    url: '/api/category/check?name=' + name,
    method: 'get'
  })
}
