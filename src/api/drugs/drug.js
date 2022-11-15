import request from '@/utils/request'

// 查询药品信息列表，分页查询
export function listDrug(query) {
  return request({
    url: '/drugs/drug/list',
    method: 'get',
    params: query
  })
}

export function getAllDrugProducers() {
  return request({
    url: '/drugs/producer/all',
    method: 'get'
  });
}

// 查询药品信息详细
export function getDrug(deptId) {
  return request({
    url: '/drugs/drug/' + deptId,
    method: 'get'
  })
}

// 根据供应商主键查询药品信息详细
export function getDrugBySupportId(supportId) {
  return request({
    url: '/drugs/drug/bySupport/' + supportId,
    method: 'get'
  })
}

// 新增药品信息
export function addDrug(data) {
  return request({
    url: '/drugs/drug',
    method: 'post',
    data: data
  })
}

// 修改药品信息
export function updateDrug(data) {
  return request({
    url: '/drugs/drug',
    method: 'put',
    data: data
  })
}

// 删除药品信息
export function delDrugs(deptIds) {
  return request({
    url: '/drugs/drug/' + deptIds,
    method: 'delete'
  })
}

