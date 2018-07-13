import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/products/search',
    method: 'get',
    params
  })
}

export function updateProduct(data) {
  return request({
    url: '/api/products',
    method: 'put',
    data
  })
}

export function addProduct(data) {
  return request({
    url: '/api/products',
    method: 'post',
    data
  })
}

export function deleteProduct(id) {
  return request({
    url: '/api/products?id=' + id,
    method: 'delete'
  })
}
