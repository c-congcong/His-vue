import request from '@/utils/request'

// 查询药品信息列表，分页查询
export function listOrderAndOthers(query) {
  return request({
    url: '/drugs/order/list',
    method: 'get',
    params: query
  })
}

export function getAllDrugSupports() {
  return request({
    url: '/drugs/support/all',
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

// 新增药品信息
export function addDrugOrderAndDetails(supportId, orderTotal, data) {
  return request({
    url: '/drugs/order/'+supportId+"/"+orderTotal,
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

