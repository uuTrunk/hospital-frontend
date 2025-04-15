import request from '../utils/request'

const baseURL = '/patient-info'

// 获取患者信息
export const getPatientInfoByAssessmentId = (assessmentId) => {
    return request.get(`${baseURL}/detail`, {
        params: {
            assessment_id: assessmentId
        }
    })
} 