import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/carousel',
    method: 'get',
    params
  })
}

export function updateCarousel(data) {
  return request({
    url: '/api/carousel',
    method: 'put',
    data
  })
}

export function addCarousel(data) {
  return request({
    url: '/api/carousel',
    method: 'post',
    data
  })
}

export function deleteCarousel(id) {
  return request({
    url: '/api/carousel?id=' + id,
    method: 'delete'
  })
}
