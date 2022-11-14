import request from '@/utils/request'
// 检查费用相关JS
// 查询检查费用列表，分页查询
export function listProjectFee(query) {
  return request({
    url: '/his/profee/list',
    method: 'get',
    params: query
  })
}

// 查询检查费用详细
export function getDoctorProjectFee(projectId) {
  return request({
    url: '/his/profee/' + projectId,
    method: 'get'
  })
}

// 新增检查费用
export function addProjectFee(data) {
  return request({
    url: '/his/profee',
    method: 'post',
    data: data
  })
}

// 修改检查费用
export function updateDoctorProjectFee(data) {
  return request({
    url: '/his/profee',
    method: 'put',
    data: data
  })
}

// 删除检查费用
export function delDoctorProjectFee(projectIds) {
  return request({
    url: '/his/profee/' + projectIds,
    method: 'delete'
  })
}

// 导出岗位
export function exportPost(query) {
  return request({
    url: '/system/post/export',
    method: 'get',
    params: query
  })
}
