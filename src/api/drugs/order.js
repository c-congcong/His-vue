import request from '@/utils/request'

// 查询药品信息列表，分页查询
export function listOrderAndOthers(query) {
  return request({
    url: '/drugs/order/list',
    method: 'get',
    params: query
  })
}

// 提交审核
export function submitExamine(detailIds) {
  return request({
    url: '/drugs/order/submitExamine/' + detailIds,
    method: 'put'
  });
}

// 作废
export function submitCancel(detailIds) {
  return request({
    url: '/drugs/order/submitCancel/' + detailIds,
    method: 'put'
  });
}

// 提交入库
export function submitStorage(detailIds) {
  return request({
    url: '/drugs/order/submitStorage/' + detailIds,
    method: 'put'
  });
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

