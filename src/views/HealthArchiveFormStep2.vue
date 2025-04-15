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
      <div class="step active">
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

    <div class="history-container">
      <div class="content-columns">
        <div class="left-column">
          <div class="section-card">
            <div class="card-icon">
              <i class="icon-disease"></i>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h2>病史情况</h2>
                <button class="btn-fill" @click="goToFill">去完善</button>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="card-icon">
              <i class="icon-physical"></i>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h2>体格检查</h2>
                <button class="btn-fill" @click="goToPhysical">去完善</button>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="card-icon">
              <i class="icon-lab"></i>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h2>实验室及器械检查</h2>
                <button class="btn-fill" @click="goToLab">去完善</button>
              </div>
              <div class="badge-number">1</div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="arrow-container">
            <div class="arrow-down"></div>
          </div>

          <div class="summary-card">
            <div class="card-icon">
              <i class="icon-summary"></i>
            </div>
            <div class="card-content">
              <h2>小结</h2>
              <div class="summary-text">请尽完善所有体检项目</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-previous" @click="goToPrevious">上一步</button>
      <button class="btn-next" @click="goToNext">下一步</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthArchiveFormStep2View',
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
    goToFill() {
      console.log('前往完善病史情况');
    },
    goToPhysical() {
      console.log('前往完善体格检查');
    },
    goToLab() {
      console.log('前往完善实验室及器械检查');
    },
    goToPrevious() {
      this.$router.push(`/health-archive/form/step1/${this.id}`);
    },
    goToNext() {
      this.$router.push(`/health-archive/form/step3/${this.id}`);
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

.history-container {
  max-width: 900px;
  margin: 40px auto;
}

.content-columns {
  display: flex;
  align-items: flex-start;
  gap: 60px;
}

.left-column {
  flex: 1;
}

.right-column {
  width: 300px;
  position: relative;
}

.section-card {
  display: flex;
  align-items: flex-start;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 28px;
}

.icon-disease {
  background-color: #4f7df7;
  color: white;
  padding: 14px;
  border-radius: 8px;
}

.icon-physical {
  background-color: #3cc2c6;
  color: white;
  padding: 14px;
  border-radius: 8px;
}

.icon-lab {
  background-color: #a36ff7;
  color: white;
  padding: 14px;
  border-radius: 8px;
}

.icon-disease:before {
  content: "➕";
}

.icon-physical:before {
  content: "💪";
}

.icon-lab:before {
  content: "🔬";
}

.card-content {
  flex: 1;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.btn-fill {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.arrow-container {
  height: 60px;
  display: flex;
  justify-content: center;
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 20px solid #e8e8e8;
}

.summary-card {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  text-align: center;
}

.icon-summary {
  background-color: #52c41a;
  color: white;
  padding: 14px;
  border-radius: 8px;
}

.icon-summary:before {
  content: "📝";
}

.summary-text {
  color: #999;
  font-size: 14px;
  margin-top: 5px;
}

.badge-number {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f5222d;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
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

.btn-next {
  padding: 8px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style> 