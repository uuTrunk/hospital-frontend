import request from '../utils/request'

const baseURL = '/admission-assessment'

// 获取入院评估列表
export const getAdmissionList = (params) => {
    return request.get(`${baseURL}/list`, { params })
}

// 创建入院评估
export const createAssessment = (data) => {
    return request.post(`${baseURL}/create`, data)
}

// 获取评估详情
export const getAssessmentById = (assessmentId) => {
    return request.get(`${baseURL}/${assessmentId}`)
}

// 获取患者的所有评估
export const getAssessmentsByPatientId = (patientId) => {
    return request.get(`${baseURL}/patient/${patientId}`)
}

// 获取健康评估列表
export const getHealthAssessments = (assessmentId) => {
    return request.get(`${baseURL}/${assessmentId}/health-assessments`)
}

// 更新评估状态
export const updateAssessmentStatus = (assessmentId, status) => {
    return request.put(`${baseURL}/${assessmentId}/status`, { status })
}

// 获取待评估数量
export const getPendingAssessmentCount = () => {
    return request.get(`${baseURL}/pending-count`)
}

// 提交健康评估
export const submitHealthAssessment = (data) => {
    return request.post(`${baseURL}/health-assessment/submit`, data)
}

// 提交照护评估
export const submitCareAssessment = (data) => {
    return request.post(`${baseURL}/care-assessment/submit`, data)
}

// 获取健康评估详情
export const getHealthAssessmentDetail = (assessmentId) => {
    return request.get(`${baseURL}/health-assessment/${assessmentId}`)
}

// 获取照护评估详情
export const getCareAssessmentDetail = (assessmentId) => {
    return request.get(`${baseURL}/care-assessment/${assessmentId}`)
}

// 上传医疗报告
export const uploadMedicalReport = (data) => {
    return request.post(`${baseURL}/upload-report`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}