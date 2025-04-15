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
      <div class="step active">
        <div class="step-number">1</div>
        <div class="step-name">基本信息</div>
        <div class="step-desc">完善长者基本信息</div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-name">入院病史</div>
        <div class="step-desc">完善长者入院前的</div>
        <div class="step-desc">病史记录</div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-name">诊断与计划</div>
        <div class="step-desc">完善初步诊断与后</div>
        <div class="step-desc">续治疗计划</div>
      </div>
    </div>

    <div class="form-container">
      <div class="form-group">
        <div class="form-label required">职业</div>
        <div class="form-content">
          <label class="radio-label">
            <input type="radio" v-model="formData.occupation" value="退休" checked />
            <span>退休</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="formData.occupation" value="无" />
            <span>无</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">工作单位</div>
        <div class="form-content">
          <input type="text" class="form-input" v-model="formData.workplace" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label required">医保情况</div>
        <div class="form-content">
          <label class="radio-label">
            <input type="radio" v-model="formData.insurance" value="有医保" checked />
            <span>有医保</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="formData.insurance" value="无医保" />
            <span>无医保</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">过敏药物</div>
        <div class="form-content">
          <input type="text" class="form-input" v-model="formData.allergies" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label required">供史人</div>
        <div class="form-content supplier-container">
          <div class="dropdown-group">
            <select class="form-select" v-model="formData.primarySupplier">
              <option value="选择第一供史人">选择第一供史人</option>
              <option value="子女">子女</option>
              <option value="配偶">配偶</option>
              <option value="兄弟姐妹">兄弟姐妹</option>
            </select>
          </div>
          <div class="dropdown-group">
            <select class="form-select" v-model="formData.secondarySupplier">
              <option value="选择第二供史人">选择第二供史人</option>
              <option value="子女">子女</option>
              <option value="配偶">配偶</option>
              <option value="兄弟姐妹">兄弟姐妹</option>
            </select>
          </div>
          <input type="text" class="form-input supplier-input" placeholder="输入其他供史人" v-model="formData.otherSupplier" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label required">可靠程度</div>
        <div class="form-content">
          <label class="radio-label">
            <input type="radio" v-model="formData.reliability" value="可靠" checked />
            <span>可靠</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="formData.reliability" value="欠可靠" />
            <span>欠可靠</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">住院号</div>
        <div class="form-content">
          <input type="text" class="form-input" v-model="formData.hospitalNumber" />
          <div class="form-hint">如长者健康档案号与入院编号不一致，可在此填写</div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button class="btn-save" @click="saveAndNext">保存，下一步</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthArchiveFormStep1View',
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
      formData: {
        occupation: '退休',
        workplace: '',
        insurance: '有医保',
        allergies: '',
        primarySupplier: '选择第一供史人',
        secondarySupplier: '选择第二供史人',
        otherSupplier: '',
        reliability: '可靠',
        hospitalNumber: ''
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
    cancel() {
      this.$router.push(`/health-archive/create/${this.id}`);
    },
    saveAndNext() {
      // 保存数据并导航到下一步
      console.log('保存第一步数据:', this.formData);
      this.$router.push(`/health-archive/form/step2/${this.id}`);
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

.step-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.step.active .step-name {
  color: #1890ff;
}

.step-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.2;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  margin-bottom: 20px;
}

.form-label {
  width: 100px;
  text-align: right;
  padding-top: 8px;
  padding-right: 12px;
  position: relative;
}

.form-label.required:before {
  content: '*';
  color: #f5222d;
  position: absolute;
  left: -10px;
  top: 8px;
}

.form-content {
  flex: 1;
}

.form-input {
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.radio-label {
  margin-right: 24px;
  cursor: pointer;
  user-select: none;
}

.radio-label input {
  margin-right: 4px;
}

.supplier-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dropdown-group {
  position: relative;
}

.dropdown-group:after {
  content: '';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #666;
  pointer-events: none;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  width: 150px;
  appearance: none;
}

.supplier-input {
  max-width: 200px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  gap: 20px;
}

.btn-cancel {
  padding: 8px 20px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style> 