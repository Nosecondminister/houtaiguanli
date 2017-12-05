import fetch from '@/utils/fetch'

export function fetchList(query) {
  return fetch({
    url: '/user/listByPage',
    method: 'get',
    params: query
  })
}

// 添加用户的接口
export function AddUser(data) {
  return fetch({
    url: '/user/add',
    method: 'post',
    data
  })
}

// 修改用户的接口
export function UpdateUser(data) {
  return fetch({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function DeleteUser(data) {
  return fetch({
    url: '/user/delete',
    method: 'post',
    data
  })
}
