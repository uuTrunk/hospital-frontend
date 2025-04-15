<template>
  <div class="discharge-form" :class="{ 'view-mode': isViewMode }">
    <div class="patient-info-bar">
      <div class="avatar">
        <span>{{patient.name.substring(0,1)}}</span>
      </div>
      <div class="basic-info">
        <div>{{patient.name}}</div>
        <div>{{patient.gender}} {{patient.age}}岁</div>
      </div>
      <div class="room-info">
        <div>房间床位 {{roomNumber}}</div>
        <div>护理等级 <span class="nursing-level">{{nursingLevel}}</span></div>
      </div>
      <div class="admission-info">
        <div>入院日期 {{patient.admissionDate}}</div>
        <div>入院编号 {{admissionNo}}</div>
      </div>
      <div class="discharge-info">
        <div>离院原因 {{patient.dischargeReason}}</div>
      </div>
    </div>

    <div class="tabs">
      <div :class="['tab', { active: activeTab === 'summary' }]" @click="activeTab = 'summary'">
        离院小结
      </div>
      <div :class="['tab', { active: activeTab === 'handover' }]" @click="activeTab = 'handover'">
        离院交接
      </div>
    </div>

    <div v-if="activeTab === 'summary'" class="summary-form">
      <h2 class="page-title">{{isDeath ? '长者死亡小结' : '长者出院小结'}}</h2>

      <div v-if="isViewMode && isDeath" class="view-mode-badge">
        死亡小结查看界面
      </div>

      <div class="form-block">
        <div class="discharge-date">
          <label>{{isDeath ? '死亡日期' : '出院日期'}}</label>
          <input type="date" v-model="dischargeDate" :disabled="isViewMode" />
        </div>
      </div>

      <div class="form-block">
        <div class="form-label">入院诊断</div>
        <div class="diagnosis-list">
          <div>1. 高血压病</div>
          <div>2. 美尼尔综合征</div>
          <div>3. 老年性精神障碍</div>
        </div>
      </div>

      <div class="form-block">
        <div class="form-label">入院情况</div>
        <textarea class="text-area" placeholder="请输入入院情况" v-model="admissionStatus" :disabled="isViewMode"></textarea>
      </div>

      <div class="form-block">
        <div class="form-label">在院治疗情况</div>
        <textarea class="text-area" placeholder="请输入在院治疗情况及与治疗情况说明" v-model="treatmentStatus" :disabled="isViewMode"></textarea>
      </div>

      <template v-if="isDeath">
        <div class="form-block">
          <div class="form-label">抢救经过</div>
          <textarea class="text-area" placeholder="请输入出院情况" v-model="rescueProcess" :disabled="isViewMode"></textarea>
        </div>

        <div class="form-block">
          <div class="form-label">死亡诊断</div>
          <div class="diagnosis-list">
            <div>1. 高血压病</div>
            <div>2. 美尼尔综合征</div>
            <div>3. 老年性精神障碍</div>
            <div>4. 阻塞性肺炎</div>
          </div>
        </div>

        <div class="form-block">
          <div class="form-label">死亡原因</div>
          <textarea class="text-area" placeholder="请输入死亡原因" v-model="deathReason" :disabled="isViewMode"></textarea>
        </div>
      </template>
      
      <template v-else>
        <div class="form-block">
          <div class="form-label">出院情况</div>
          <textarea class="text-area" placeholder="请输入出院情况" v-model="dischargeStatus" :disabled="isViewMode"></textarea>
        </div>

        <div class="form-block">
          <div class="form-label">出院诊断</div>
          <div class="diagnosis-list">
            <div>1. 高血压病</div>
            <div>2. 美尼尔综合征</div>
            <div>3. 老年性精神障碍</div>
          </div>
        </div>

        <div class="form-block">
          <div class="form-label">出院医嘱</div>
          <div class="advice-list">
            <div>1. 注意生活作息规律，清淡饮食</div>
            <div>2. 控制血压</div>
            <div>3. 定期检查，不适随诊</div>
          </div>
        </div>
      </template>

      <div class="form-actions">
        <button v-if="!isViewMode" class="btn-save" @click="save">保存</button>
        <button class="btn-cancel" @click="cancel">{{ isViewMode ? '返回' : '取消' }}</button>
      </div>
    </div>

    <div v-if="activeTab === 'handover'" class="handover-form">
      <h2 class="page-title">长者离院交接</h2>
      
      <div v-if="isViewMode" class="view-mode-badge">
        离院交接提示已不可修改<br/>
        建议：宽度固定720px，居中展示
      </div>
      
      <div v-if="isViewMode" class="completed-view">
        <div class="checklist-container">
          <div class="checklist-item">
            <div class="checklist-icon completed">
              <i class="icon-folder"></i>
            </div>
            <div class="checklist-content">
              <div class="checklist-title">停止医嘱</div>
              <div class="checklist-desc">自动停止或作废所有未终止的医嘱（系统自动处理）</div>
            </div>
            <div class="checklist-status">
              <span class="status-icon completed"></span>
            </div>
          </div>

          <div class="checklist-item">
            <div class="checklist-icon completed">
              <i class="icon-files"></i>
            </div>
            <div class="checklist-content">
              <div class="checklist-title">医疗费结算</div>
              <div class="checklist-desc">请确认所有医疗费用单都已提交财务结算</div>
              <div class="checklist-note">系统中存在2条未结算的处方费用单</div>
            </div>
            <div class="checklist-status">
              <span class="status-icon completed"></span>
            </div>
          </div>

          <div class="checklist-item">
            <div class="checklist-icon completed">
              <i class="icon-card"></i>
            </div>
            <div class="checklist-content">
              <div class="checklist-title">医保卡交接</div>
              <div class="checklist-desc">请确认医保卡已交还给长者或家属</div>
            </div>
            <div class="checklist-status">
              <span class="status-icon completed"></span>
            </div>
          </div>

          <div class="checklist-item">
            <div class="checklist-icon completed">
              <i class="icon-medicine"></i>
            </div>
            <div class="checklist-content">
              <div class="checklist-title">药品交接</div>
              <div class="checklist-desc">请确认长者药品已经交还给长者或家属</div>
            </div>
            <div class="checklist-status">
              <span class="status-icon completed"></span>
            </div>
          </div>
        </div>
        
        <div class="completion-message">
          <i class="icon-success"></i>
          <span>离院交接已完成，王医生，2024-06-19 14:12</span>
        </div>
        
        <div class="completion-details">
          <div class="detail-item">
            <div class="item-num">1、</div>
            <div class="item-text">自动作废本次住院的临时医嘱以及未执对的长期医嘱；</div>
          </div>
          <div class="detail-item">
            <div class="item-num">2、</div>
            <div class="item-text">自动停止未确认停止的长期医嘱；</div>
          </div>
          <div class="detail-item">
            <div class="item-num">3、</div>
            <div class="item-text">自动作废未审核以及未出库的处方单；</div>
          </div>
          <div class="detail-item">
            <div class="item-num">4、</div>
            <div class="item-text">自动提交未结算的处方费用单；</div>
          </div>
          <div class="detail-item">
            <div class="item-num">5、</div>
            <div class="item-text">自动清空长者药箱</div>
          </div>
        </div>
      </div>
      
      <div v-else class="checklist-container">
        <div class="checklist-item">
          <div class="checklist-icon completed">
            <i class="icon-folder"></i>
          </div>
          <div class="checklist-content">
            <div class="checklist-title">停止医嘱</div>
            <div class="checklist-desc">已自动停止所有医生所有未结束的医嘱（系统自动处理）</div>
          </div>
          <div class="checklist-status">
            <span class="status-icon completed"></span>
          </div>
        </div>

        <div class="checklist-item">
          <div class="checklist-icon">
            <i class="icon-files"></i>
          </div>
          <div class="checklist-content">
            <div class="checklist-title">医疗费结算</div>
            <div class="checklist-desc">请确认所有医疗费用均已结算对账结算</div>
            <div class="checklist-note">费用中存在未结算的项目，请联系</div>
          </div>
          <div class="checklist-status">
            <span class="status-icon"></span>
          </div>
        </div>

        <div class="checklist-item">
          <div class="checklist-icon">
            <i class="icon-card"></i>
          </div>
          <div class="checklist-content">
            <div class="checklist-title">医保卡交接</div>
            <div class="checklist-desc">请确认医保卡已交还给长者或家属</div>
          </div>
          <div class="checklist-status">
            <span class="status-icon"></span>
          </div>
        </div>

        <div class="checklist-item">
          <div class="checklist-icon">
            <i class="icon-medicine"></i>
          </div>
          <div class="checklist-content">
            <div class="checklist-title">药品交接</div>
            <div class="checklist-desc">请确认长者药品已经交还给长者或家属</div>
          </div>
          <div class="checklist-status">
            <span class="status-icon"></span>
          </div>
        </div>
      </div>

      <div class="reminder-box">
        <div class="reminder-title">提示：确认以下系统自动完成了下述处理，若有遗漏请手动处理后再确认交接</div>
        <ol class="reminder-list">
          <li>自动停止本次住院的所有医嘱及未执行的长期医嘱；</li>
          <li>自动停止未用/已用的长期医嘱和临时医嘱；</li>
          <li>自动清本次住院以来本出院的处方；</li>
          <li>自动终止本住院的费用统计；</li>
          <li>自动清空床卡信息</li>
        </ol>
      </div>

      <div class="tips-panel">
        <div class="tips-item">1. 默认自动处理为第一步，不可取消勾选</div>
        <div class="tips-item">2. 2-4项，需全部勾选后方可申请交接</div>
        <div class="tips-item">3. 2-4项勾选的内容为手工确认项，不会生成相关的系统交互</div>
        <div class="tips-item">4. 确认交接，自动完成图形项中流程的电子签章及系统交互</div>
        <div class="tips-item">5. 若确认后上述项后，若在确定离院后仍有流程未处理，也强制同步</div>
      </div>

      <div class="form-actions">
        <button v-if="!isViewMode" class="btn-handover">申请交接</button>
        <button class="btn-cancel" @click="cancel">{{ isViewMode ? '返回' : '取消' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DischargeFormView',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      activeTab: 'summary',
      dischargeDate: new Date().toISOString().substr(0, 10),
      admissionStatus: '',
      treatmentStatus: '',
      dischargeStatus: '',
      rescueProcess: '',
      deathReason: '',
      roomNumber: '2206-5',
      nursingLevel: '二级护理',
      admissionNo: '202405081724',
      patient: {
        id: 0,
        name: '',
        gender: '',
        idNumber: '',
        age: 0,
        admissionDate: '',
        dischargeReason: ''
      },
      mode: 'edit',
      isViewMode: false
    };
  },
  computed: {
    isDeath() {
      return this.patient.dischargeReason === '本院死亡' || this.patient.dischargeReason === '外院死亡';
    }
  },
  methods: {
    calculateAge(idNumber) {
      if (!idNumber || idNumber.length !== 18) {
        return '';
      }
      const birthYear = idNumber.substring(6, 10);
      const birthMonth = idNumber.substring(10, 12);
      const birthDay = idNumber.substring(12, 14);
      
      const birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    },
    
    loadPatientData() {
      // 检查查询参数中是否有mode
      if (this.$route.query.mode === 'view') {
        this.mode = 'view';
        this.isViewMode = true;
      }
      
      // 模拟从store或API获取患者数据
      // 实际项目中这里应该调用API或从Vuex获取
      const patients = [
        {
          id: 1,
          name: '李大哥',
          idNumber: '310106194805162428',
          gender: '男',
          admissionDate: '2024-05-22',
          dischargeReason: '自动出院',
          dischargeDate: '2025-01-22'
        },
        {
          id: 2,
          name: '王大娘',
          idNumber: '310106192505162428',
          gender: '女',
          admissionDate: '2023-05-18',
          dischargeReason: '本院死亡',
          dischargeDate: '2024-01-18'
        },
        {
          id: 3,
          name: '宋老博',
          idNumber: '310106193505162428',
          gender: '男',
          admissionDate: '2024-05-12',
          dischargeReason: '外院死亡',
          dischargeDate: '2024-09-12'
        }
      ];
      
      const patientId = parseInt(this.id);
      const patient = patients.find(p => p.id === patientId);
      
      if (patient) {
        // 计算年龄
        const age = this.calculateAge(patient.idNumber);
        this.patient = {
          ...patient,
          age: age
        };
        this.dischargeDate = patient.dischargeDate;
        
        // 默认填充一些示例内容
        this.admissionStatus = `对象 ${patient.name}，${patient.gender}，${age}岁 2024年2月12日，因家中子女上班无人照料且生活无法自理入院。老人于十年前每到春季季节及天气变化受凉后便开始出现咳嗽、咳痰、气促、嗜睡不适，痰大量黄白色粘痰，剧烈咳嗽及活动后胸闷、气促加重，每次发作时间持续三个月以上，曾多次住院就诊治疗（具体用药不详）。近十天来，患者上述症状再次发作，呈进行性加重趋势，无发热、呕血、咯血、腹胀、腹泻等不适。既往体质一般，曾患疾病："肛门脱垂"病史两年余，具体不详。有高血压、糖尿病，预防接种史不详。`;
        
        this.treatmentStatus = `家中子女上班无人照料且生活无法自理入院。老人于十年前每到春季季节及天气变化受凉后便开始出现咳嗽、咳痰、气促、嗜睡不适，痰大量黄白色粘痰，剧烈咳嗽及活动后胸闷、气促加重，每次发作时间持续三个月以上，曾多次住院就诊治疗（具体用药不详）。`;
        
        if (this.isDeath) {
          this.rescueProcess = `2023-10-21 15：10突然出现呼吸、心跳停止，立即徒手心肺复苏，开放呼吸道，吸氧5Lmin/h，立即联系院外心肺复苏抢救，人工呼吸，胸外心脏按压60-80次/分，卡培他滨肠溶片50mg，静脉注射阿托品3mg，呼吸兴奋剂尼可刺激375mg，肌肉山梨醇氟比洛芬酯40mg；每隔5分钟肾上腺素2mg，未出现自主呼吸心跳，急查心电图显示：全心停搏，持续抢救30分钟，抢救无效。手术：30般过世亡`;
          this.deathReason = `中枢性呼吸循环衰竭死亡`;
        } else {
          this.dischargeStatus = `近十天来，患者上述症状再次发作，呈进行性加重趋势，无发热、呕血、咯血、腹胀、腹泻等不适。既往体质一般，曾患疾病："肛门脱垂"病史两年余，具体不详。有高血压、糖尿病，预防接种史不详。`;
        }
      }
    },
    save() {
      // 实现保存逻辑
      alert('保存成功！');
      this.$router.push('/discharge');
    },
    cancel() {
      // 实现取消逻辑
      this.$router.push('/discharge');
    }
  },
  created() {
    this.loadPatientData();
  }
}
</script>

<style scoped>
.discharge-form {
  padding: 20px;
  background-color: #f5f6fa;
  min-height: 100vh;
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

.basic-info, .room-info, .admission-info, .discharge-info {
  margin-right: 20px;
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

.tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: bold;
}

.page-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 30px;
  font-weight: normal;
}

.form-block {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.discharge-date {
  display: flex;
  align-items: center;
}

.discharge-date label {
  width: 100px;
}

.discharge-date input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-label {
  font-weight: bold;
  margin-bottom: 10px;
}

.text-area {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.diagnosis-list div, .advice-list div {
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}

.btn-save, .btn-handover {
  padding: 8px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  padding: 8px 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

/* 交接表单样式 */
.checklist-container {
  margin-bottom: 20px;
}

.checklist-item {
  display: flex;
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.checklist-icon {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: #999;
}

.checklist-icon.completed {
  background-color: #e6f7ff;
  color: #1890ff;
}

.checklist-content {
  flex: 1;
}

.checklist-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.checklist-desc {
  color: #666;
  font-size: 13px;
}

.checklist-note {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.checklist-status {
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-icon {
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 50%;
}

.status-icon.completed {
  background-color: #52c41a;
  border-color: #52c41a;
  position: relative;
}

.status-icon.completed:after {
  content: "✓";
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
}

.reminder-box {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.reminder-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #d48806;
}

.reminder-list {
  padding-left: 20px;
  margin: 0;
}

.reminder-list li {
  margin-bottom: 5px;
}

.tips-panel {
  background-color: #fff9c4;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.tips-item {
  margin-bottom: 8px;
  font-size: 13px;
}

/* 图标 */
.icon-folder:before {
  content: "📁";
}

.icon-files:before {
  content: "📑";
}

.icon-card:before {
  content: "💳";
}

.icon-medicine:before {
  content: "💊";
}

/* 查看模式样式 */
.discharge-form.view-mode .text-area,
.discharge-form.view-mode input {
  border-color: transparent;
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.discharge-form.view-mode .form-block {
  background-color: #fafafa;
}

.discharge-form.view-mode .tips-panel {
  opacity: 0.8;
}

.discharge-form.view-mode .checklist-item {
  opacity: 0.9;
}

.view-mode-badge {
  position: absolute;
  top: 120px;
  right: 40px;
  background-color: #ffeb3b;
  color: #333;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  line-height: 1.5;
}

/* 已完成交接的视图样式 */
.completed-view {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  margin: 20px 0;
}

.completed-view .checklist-item {
  margin-bottom: 15px;
  opacity: 1;
}

.completion-message {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 15px;
  border-radius: 4px;
  color: #52c41a;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.icon-success {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: #52c41a;
  border-radius: 50%;
  margin-right: 10px;
  position: relative;
}

.icon-success:after {
  content: "✓";
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
}

.completion-details {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
}

.item-num {
  width: 30px;
  font-weight: bold;
}

.item-text {
  flex: 1;
}
</style> 