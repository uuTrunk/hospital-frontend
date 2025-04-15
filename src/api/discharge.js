import request from '../utils/request'

const baseURL = '/discharge'

// 获取离院记录列表
export const getDischargeList = (params) => {
    return request({
        url: `${baseURL}/list`,
        method: 'get',
        params
    })
}

// 获取离院记录详情
export const getDischargeById = (id) => {
    return request({
        url: `${baseURL}/${id}`,
        method: 'get'
    })
}

// 获取患者离院记录
export const getDischargeByPatientId = (patientId) => {
    return request({
        url: `${baseURL}/patient/${patientId}`,
        method: 'get'
    })
} 