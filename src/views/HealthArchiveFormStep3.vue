<template>
  <div class="health-archive-form">
    <div class="patient-info-bar">
      <div class="avatar">
        <span>{{patient.name.substring(0,1)}}</span>
      </div>
      <div class="basic-info">
        <div>{{patient.name}}</div>
        <div>{{patient.gender}} {{patient.age}}岁</div>
      </div>
      <div class="room-info">
        <div>房间床位 {{patient.roomNumber}}</div>
        <div>护理等级 <span class="nursing-level">{{patient.nursingLevel}}</span></div>
      </div>
      <div class="admission-info">
        <div>入院日期 {{patient.admissionDate}}</div>
        <div>入院编号 {{patient.admissionNo}}</div>
      </div>
    </div>

    <div class="progress-steps">
      <div class="step completed">
        <div class="step-number">
          <i class="icon-check"></i>
        </div>
        <div class="step-name">基本信息</div>
        <div class="step-desc">完善长者基本信息</div>
      </div>
      <div class="step completed">
        <div class="step-number">
          <i class="icon-check"></i>
        </div>
        <div class="step-name">入院病史</div>
        <div class="step-desc">完善长者入院前的</div>
        <div class="step-desc">病史记录</div>
      </div>
      <div class="step active">
        <div class="step-number">3</div>
        <div class="step-name">诊断与计划</div>
        <div class="step-desc">完善初步诊断与后</div>
        <div class="step-desc">续治疗计划</div>
      </div>
    </div>

    <div class="diagnosis-container">
      <div class="diagnosis-section">
        <h2 class="section-title">初步诊断</h2>
        <div class="diagnosis-card">
          <div class="diagnosis-item" v-for="(diagnosis, index) in diagnoses" :key="diagnosis.id">
            <div class="diagnosis-name">
              <div class="diagnosis-term">{{diagnosis.term}}</div>
              <button class="btn-remove" @click="removeDiagnosis(index)">
                <i class="icon-remove"></i>
              </button>
            </div>
            <div class="diagnosis-desc">{{diagnosis.desc}}</div>
            <div :class="['diagnosis-tag', 'type-' + diagnosis.type]">{{index + 1}}</div>
          </div>

          <div class="diagnosis-add">
            <button class="btn-add" @click="addDiagnosis">
              <i class="icon-add"></i> 新增
            </button>
          </div>
        </div>
      </div>

      <div class="treatment-section">
        <h2 class="section-title">诊疗计划与建议</h2>
        <div class="treatment-card">
          <div class="treatment-item" v-for="(treatment, index) in treatments" :key="treatment.id">
            <div class="treatment-name">
              <div class="treatment-term">{{treatment.term}}</div>
              <button class="btn-remove" @click="removeTreatment(index)">
                <i class="icon-remove"></i>
              </button>
            </div>
            <div class="treatment-desc">{{treatment.desc}}</div>
          </div>

          <div class="treatment-add">
            <button class="btn-add" @click="addTreatment">
              <i class="icon-add"></i> 新增
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-previous" @click="goToPrevious">上一步</button>
      <button class="btn-complete" @click="completeArchive">完成</button>
    </div>

    <!-- 添加诊断弹窗 -->
    <div v-if="showAddDiagnosisModal" class="modal-overlay">
      <div class="diagnosis-modal">
        <div class="modal-header">
          <h3>添加诊断</h3>
          <button class="close-button" @click="showAddDiagnosisModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">疾病名称</label>
            <input type="text" v-model="newDiagnosis.term" class="form-input" placeholder="请输入疾病名称">
          </div>
          <div class="form-group">
            <label class="form-label">诊断描述</label>
            <textarea v-model="newDiagnosis.desc" class="form-textarea" placeholder="请输入诊断描述"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">诊断类型</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="newDiagnosis.type" value="1">
                <span>主要诊断</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="newDiagnosis.type" value="2">
                <span>次要诊断</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showAddDiagnosisModal = false">取 消</button>
          <button class="submit-button" @click="saveDiagnosis">确 认</button>
        </div>
      </div>
    </div>

    <!-- 添加诊疗计划弹窗 -->
    <div v-if="showAddTreatmentModal" class="modal-overlay">
      <div class="treatment-modal">
        <div class="modal-header">
          <h3>添加诊疗计划</h3>
          <button class="close-button" @click="showAddTreatmentModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">计划名称</label>
            <input type="text" v-model="newTreatment.term" class="form-input" placeholder="请输入计划名称">
          </div>
          <div class="form-group">
            <label class="form-label">计划描述</label>
            <textarea v-model="newTreatment.desc" class="form-textarea" placeholder="请输入计划描述"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showAddTreatmentModal = false">取 消</button>
          <button class="submit-button" @click="saveTreatment">确 认</button>
        </div>
      </div>
    </div>

    <div class="ai-suggestion">
      <div class="suggestion-icon">
        <i class="icon-ai">🤖</i>
      </div>
      <div class="suggestion-content">
        智能提醒
      </div>
      <div class="suggestion-number">3</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthArchiveFormStep3View',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      patient: {
        id: 0,
        name: '',
        gender: '',
        age: 0,
        roomNumber: '',
        nursingLevel: '',
        admissionDate: '',
        admissionNo: ''
      },
      diagnoses: [
        {
          id: 1,
          term: '高血压病：II级',
          desc: '高血压II级表现，可视为II级。心脏血管病是主要的危险因素，脑卒中、心肌梗死、心力衰竭及慢性肾脏病是其主要并发症。',
          type: '1'
        },
        {
          id: 2,
          term: '美尼尔综合征',
          desc: '',
          type: '2'
        }
      ],
      treatments: [
        {
          id: 1,
          term: '持续监测，控制血压',
          desc: '每周监测血压，根据血压变化合理调整饮食和用药'
        },
        {
          id: 2,
          term: '防跌倒',
          desc: ''
        }
      ],
      showAddDiagnosisModal: false,
      showAddTreatmentModal: false,
      newDiagnosis: {
        term: '',
        desc: '',
        type: '1'
      },
      newTreatment: {
        term: '',
        desc: ''
      }
    }
  },
  methods: {
    loadPatientData() {
      // 模拟从服务器获取患者数据
      const patients = [
        {
          id: 1,
          name: '李大哥',
          gender: '男',
          age: 78,
          roomNumber: '2206-5',
          nursingLevel: '二级护理',
          admissionDate: '2024-05-12',
          admissionNo: '2024050124'
        },
        {
          id: 2,
          name: '王大娘',
          gender: '女',
          age: 98,
          roomNumber: '2206-5',
          nursingLevel: '二级护理',
          admissionDate: '2024-05-12',
          admissionNo: '2024050124'
        },
        {
          id: 3,
          name: '宋老博',
          gender: '男',
          age: 89,
          roomNumber: '2206-5',
          nursingLevel: '二级护理',
          admissionDate: '2024-05-12',
          admissionNo: '2024050124'
        }
      ];
      
      const patientId = parseInt(this.id);
      const patient = patients.find(p => p.id === patientId);
      
      if (patient) {
        this.patient = patient;
      } else {
        // 如果找不到患者，返回列表页
        this.$router.push('/health-archive');
      }
    },
    addDiagnosis() {
      this.newDiagnosis = {
        term: '',
        desc: '',
        type: '1'
      };
      this.showAddDiagnosisModal = true;
    },
    saveDiagnosis() {
      if (!this.newDiagnosis.term.trim()) {
        alert('请输入疾病名称');
        return;
      }
      
      const diagnosis = {
        id: Date.now(),
        term: this.newDiagnosis.term,
        desc: this.newDiagnosis.desc,
        type: this.newDiagnosis.type
      };
      
      this.diagnoses.push(diagnosis);
      this.showAddDiagnosisModal = false;
    },
    removeDiagnosis(index) {
      if (confirm('确定要删除该诊断吗？')) {
        this.diagnoses.splice(index, 1);
      }
    },
    addTreatment() {
      this.newTreatment = {
        term: '',
        desc: ''
      };
      this.showAddTreatmentModal = true;
    },
    saveTreatment() {
      if (!this.newTreatment.term.trim()) {
        alert('请输入计划名称');
        return;
      }
      
      const treatment = {
        id: Date.now(),
        term: this.newTreatment.term,
        desc: this.newTreatment.desc
      };
      
      this.treatments.push(treatment);
      this.showAddTreatmentModal = false;
    },
    removeTreatment(index) {
      if (confirm('确定要删除该诊疗计划吗？')) {
        this.treatments.splice(index, 1);
      }
    },
    goToPrevious() {
      this.$router.push(`/health-archive/form/step2/${this.id}`);
    },
    completeArchive() {
      console.log('完成健康档案创建');
      
      // 通常这里会向服务器提交所有表单数据
      // 模拟成功后，导航回列表页
      alert('健康档案创建完成！');
      this.$router.push('/health-archive');
    }
  },
  created() {
    this.loadPatientData();
  }
}
</script>

<style scoped>
.health-archive-form {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: relative;
}

.patient-info-bar {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #bbb;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 15px;
}

.basic-info, .room-info, .admission-info {
  margin-right: 30px;
  font-size: 14px;
  line-height: 1.5;
}

.nursing-level {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.progress-steps {
  display: flex;
  margin: 30px 0;
  position: relative;
}

.progress-steps:before {
  content: '';
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e8e8e8;
  z-index: 1;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #d9d9d9;
  color: #999;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin: 0 auto 8px;
}

.step.active .step-number {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.step.completed .step-number {
  background-color: #52c41a;
  color: white;
  border-color: #52c41a;
}

.icon-check:before {
  content: "✓";
  font-size: 20px;
}

.step-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.step.active .step-name {
  color: #1890ff;
}

.step.completed .step-name {
  color: #52c41a;
}

.step-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.2;
}

.diagnosis-container {
  display: flex;
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

.diagnosis-section, .treatment-section {
  flex: 1;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.diagnosis-card, .treatment-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.diagnosis-item, .treatment-item {
  position: relative;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.diagnosis-name, .treatment-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.diagnosis-term, .treatment-term {
  font-weight: bold;
  font-size: 16px;
}

.btn-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
}

.diagnosis-desc, .treatment-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.diagnosis-add, .treatment-add {
  text-align: center;
  padding: 10px 0;
}

.btn-add {
  background: none;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 8px 16px;
  color: #1890ff;
  cursor: pointer;
}

.icon-add:before {
  content: "+";
}

.icon-remove:before {
  content: "×";
}

.diagnosis-tag {
  position: absolute;
  top: 0;
  left: -30px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}

.type-1 {
  background-color: #f5222d;
}

.type-2 {
  background-color: #faad14;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  gap: 20px;
}

.btn-previous {
  padding: 8px 20px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.btn-complete {
  padding: 8px 20px;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.ai-suggestion {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  cursor: pointer;
}

.suggestion-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e6f7ff;
  color: #1890ff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.suggestion-content {
  font-weight: bold;
  margin-right: 5px;
}

.suggestion-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f5222d;
  color: white;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 新增模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.diagnosis-modal, .treatment-modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.close-button {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
}

.close-button:hover {
  color: #409eff;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
}

.radio-label {
  margin-right: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: 5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.cancel-button, .submit-button {
  padding: 9px 15px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  margin-left: 10px;
}

.cancel-button {
  background-color: white;
  color: #606266;
}

.cancel-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.submit-button {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.submit-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style> 