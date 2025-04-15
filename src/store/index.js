import Vue from 'vue'
import Vuex from 'vuex'
import {
  getAdmissionList,
  submitHealthAssessment,
  submitCareAssessment,
  getHealthAssessmentDetail,
  getCareAssessmentDetail,
  uploadMedicalReport
} from '../api/admission'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    patients: []
  },
  getters: {
    pendingAdmissionCount: ({ patients }) => {
      return patients.filter(p =>
        p.healthStatus === '待评估' || p.careStatus === '待评估'
      ).length
    },
    pendingDischargeCount: () => {
      return 0 // 暂时返回0，后续实现离院功能时再修改
    }
  },
  mutations: {
    SET_PATIENTS(state, patients) {
      state.patients = patients
    },
    updatePatientHealthAssessment(state, { patient_id, status, time, operator }) {
      const patient = state.patients.find(p => p.patient_id === patient_id);
      if (patient) {
        patient.healthStatus = status;
        patient.healthTime = time;
        patient.healthOperator = operator;
      }
    },
    updatePatientCareAssessment(state, { patient_id, status, time, operator }) {
      const patient = state.patients.find(p => p.patient_id === patient_id);
      if (patient) {
        patient.careStatus = status;
        patient.careTime = time;
        patient.careOperator = operator;
      }
    },
    completeAdmission(state, patient_id) {
      const patient = state.patients.find(p => p.id === patient_id);
      if (patient) {
        patient.admissionCompleted = true;
      }
    }
  },
  actions: {
    async fetchPatients({ commit }, params) {
      try {
        const response = await getAdmissionList(params)
        commit('SET_PATIENTS', response.data.records)
        return response
      } catch (error) {
        console.error('获取患者列表失败:', error)
        throw error
      }
    },
    async updateHealthAssessment({ commit }, payload) {
      try {
        await submitHealthAssessment(payload);
        commit('updatePatientHealthAssessment', {
          patient_id: payload.patient_id,
          status: payload.status === 'completed' ? '完成' :
            payload.status === 'rejected' ? '不同意入院' : '待评估',
          time: payload.time,
          operator: payload.operator
        });
      } catch (error) {
        console.error('更新健康评估失败:', error);
        throw error;
      }
    },
    async updateCareAssessment({ commit }, payload) {
      try {
        await submitCareAssessment(payload);
        commit('updatePatientCareAssessment', {
          patient_id: payload.patient_id,
          status: payload.status === 'completed' ? '完成' :
            payload.status === 'rejected' ? '不同意入院' : '待评估',
          time: payload.time,
          operator: payload.operator
        });
      } catch (error) {
        console.error('更新照护评估失败:', error);
        throw error;
      }
    },
    async fetchHealthAssessmentDetail(commit, id) {
      const response = await getHealthAssessmentDetail(id);
      return response;
    },
    async fetchCareAssessmentDetail(commit, id) {
      const response = await getCareAssessmentDetail(id);
      return response;
    },
    async uploadMedicalReport(commit, payload) {
      const response = await uploadMedicalReport(payload);
      return response;
    },
    async finishAdmission({ commit }, patient_id) {
      try {
        // 这里可以添加完成入院的 API 调用
        commit('completeAdmission', patient_id);
      } catch (error) {
        console.error('完成入院失败:', error);
        throw error;
      }
    }
  },
  modules: {
  }
}) 