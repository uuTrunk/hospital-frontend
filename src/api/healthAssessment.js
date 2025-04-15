import request from '../utils/request'

const baseURL = '/health-assessment'

// 创建健康评估
export const createHealthAssessment = (data) => {
    return request.post(`${baseURL}/create`, data)
}

// 获取健康评估详情
export const getHealthAssessmentDetail = (assessmentId) => {
    return request.get(`${baseURL}/detail`, {
        params: {
            assessment_id: assessmentId
        }
    })
}

// 更新健康评估
export const updateHealthAssessment = (id, data) => {
    return request.put(`${baseURL}/${id}`, data)
}

// 上传检查报告
export const uploadMedicalReport = (data) => {
    return request.post(`${baseURL}/upload-report`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 获取检查报告列表
export const getMedicalReports = (assessmentId) => {
    return request.get(`${baseURL}/${assessmentId}/reports`)
}

// 删除检查报告
export const deleteMedicalReport = (reportId) => {
    return request.delete(`${baseURL}/report/${reportId}`)
}

// 添加现病史
export const addCurrentIllness = (assessmentId, illnessName) => {
    return request.post(`${baseURL}/${assessmentId}/current-illness`, { illnessName })
}

// 添加既往病史
export const addPastIllness = (assessmentId, illnessName) => {
    return request.post(`${baseURL}/${assessmentId}/past-illness`, { illnessName })
}

// 删除病史
export const deleteIllness = (assessmentId, illnessId, type) => {
    return request.delete(`${baseURL}/${assessmentId}/illness/${type}/${illnessId}`)
}

// 提交健康评估
export const submitHealthAssessment = (data) => {
    return request.post(`${baseURL}/submit`, data)
} 