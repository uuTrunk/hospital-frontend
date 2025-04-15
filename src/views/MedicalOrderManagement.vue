<template>
  <div class="medical-management-container">
    <div class="left-panel">
      <div class="search-header">
        <h3>选择就诊人</h3>
        <div class="search-box">
          <div class="search-input">
            <input type="text" placeholder="姓名/入院编号" />
            <button class="search-btn">
              <i class="el-icon-search"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="patient-list">
        <table class="patient-table">
          <thead>
            <tr>
              <th>姓名/性别</th>
              <th>床位</th>
              <th>入院编号</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(patient, index) in patients" :key="index" @click="selectPatient(patient)" :class="{ active: selectedPatient && selectedPatient.id === patient.id }">
              <td>
                <div class="patient-name">{{ patient.name }}</div>
                <div class="patient-gender">{{ patient.gender }}</div>
              </td>
              <td>{{ patient.bed }}</td>
              <td>{{ patient.admissionNo }}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <button class="page-btn"><i class="el-icon-arrow-left"></i></button>
          <div class="page-numbers">
            <span class="page-number active">1</span>
            <span class="page-number">2</span>
            <span class="page-number">3</span>
            <span class="page-number">4</span>
            <span class="page-number">5</span>
          </div>
          <button class="page-btn"><i class="el-icon-arrow-right"></i></button>
        </div>
      </div>
    </div>
    
    <div class="right-panel">
      <!-- 未选择病人状态 -->
      <div v-if="!selectedPatient" class="empty-state">
        <div class="tab-header">
          <div class="tab-item active">
            <i class="el-icon-document-checked"></i> 病历处方
          </div>
          <div class="tab-item">
            <i class="el-icon-document"></i> 病程记录
          </div>
        </div>
        
        <div class="empty-content">
          <div class="stethoscope-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dcdfe6">
              <path d="M19 9.5c-1.4 0-2.5 1.1-2.5 2.5v3c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-1c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3.2.5.5.5s.5-.2.5-.5v-3c0-2.2 1.8-4 4-4s4 1.8 4 4v3c0 2.9-2.1 5.4-5 5.9V21c0 .6-.4 1-1 1s-1-.4-1-1v-.1c-2.9-.5-5-3-5-5.9v-1c0-.3.2-.5.5-.5s.5.2.5.5v1c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5v-3c0-1.4-1.1-2.5-2.5-2.5zm-11 0c-1.4 0-2.5 1.1-2.5 2.5v.8c0 1.7-1.3 3.2-3 3.5V21c0 .6-.4 1-1 1s-1-.4-1-1v-4.7c-1.7-.3-3-1.7-3-3.5v-.8c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v.8c0 .3.2.5.5.5s.5-.2.5-.5v-.8c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v.8c0 .3.2.5.5.5s.5-.2.5-.5v-.8c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v.8c0 1.7-1.3 3.2-3 3.5V21c0 .6-.4 1-1 1s-1-.4-1-1v-4.7c-1.7-.3-3-1.7-3-3.5v-.8c0-1.4-1.1-2.5-2.5-2.5z"/>
            </svg>
          </div>
          <p class="empty-text">← 点击左侧列表选择就诊人</p>
        </div>
      </div>
      
      <!-- 选择病人后状态 -->
      <div v-else class="patient-details">
        <div class="patient-header">
          <div class="patient-avatar">
            <div class="avatar-text">{{ selectedPatient.name.charAt(0) }}</div>
          </div>
          <div class="patient-info">
            <div class="patient-name-row">
              <span class="patient-name">{{ selectedPatient.name }}</span>
              <span class="patient-gender">{{ selectedPatient.gender }}</span>
              <span class="patient-age">{{ selectedPatient.age }}岁</span>
            </div>
            <div class="patient-room">
              <span>床位: {{ selectedPatient.bed }}</span>
              <span class="nursing-level">
                <i class="el-icon-star-on"></i> {{ selectedPatient.nursingLevel }}
              </span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="header-btn">
              <i class="el-icon-document-checked"></i> 医嘱管理
            </button>
            <button class="header-btn">
              <i class="el-icon-tickets"></i> 病程记录
            </button>
          </div>
        </div>
        
        <div class="tab-header">
          <div class="tab-item active">
            <i class="el-icon-document-checked"></i> 病历处方
          </div>
          <div class="tab-item">
            <i class="el-icon-document"></i> 病程记录
          </div>
        </div>
        
        <div class="medical-orders">
          <div class="order-header">
            <div class="order-icon">
              <i class="el-icon-document-checked"></i> 病历处方
            </div>
            <button class="new-order-btn">
              + 新开
            </button>
          </div>
          
          <div class="order-list">
            <table class="order-table">
              <thead>
                <tr>
                  <th>就诊号</th>
                  <th>就诊日期</th>
                  <th>诊断</th>
                  <th>处置</th>
                  <th>医生</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in medicalOrders" :key="index" :class="{ 'disabled-row': order.disabled }">
                  <td>{{ order.id }}</td>
                  <td>{{ order.date }}</td>
                  <td>{{ order.diagnosis }}</td>
                  <td>{{ order.treatment }}</td>
                  <td>{{ order.doctor }}</td>
                  <td class="operation-cell">
                    <button v-if="!order.disabled" class="action-pill-btn view-btn" title="查看" @click="viewOrderDetail(order)">查看</button>
                    <button v-if="!order.disabled" class="action-pill-btn print-btn" title="打印" @click="printOrder(order)">打印</button>
                    <button v-if="!order.disabled" class="action-pill-btn delete-btn" title="作废" @click="invalidateOrder(order)">作废</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination">
            <button class="page-btn"><i class="el-icon-arrow-left"></i></button>
            <div class="page-numbers">
              <span class="page-number active">1</span>
              <span class="page-number">2</span>
              <span class="page-number">3</span>
              <span class="page-number">4</span>
              <span class="page-number">5</span>
              <span class="page-number">6</span>
              <span class="page-number">7</span>
              <span class="page-number">8</span>
              <span class="page-number">9</span>
            </div>
            <button class="page-btn"><i class="el-icon-arrow-right"></i></button>
            <select class="page-size-select">
              <option>10条/页</option>
              <option>20条/页</option>
              <option>50条/页</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div class="guide-tips">
      <ol>
        <li>在操作前请先选择（建议360~400）</li>
        <li>干顶部特设高度</li>
        <li>未列包括医生需立刻执行的办法，以及本面单独开具的医嘱</li>
        <li>一份就诊记录（病历/处方）包含柳体与处方两部分，PC 开跨此时处方为病历科常用的方</li>
        <li>一旦片上医嘱参与，都不可能重新生成处方；一旦写方完成，都不可再更抱内容</li>
        <li>一旦打开病历，则不可再共享病历内容</li>
        <li>========================</li>
        <li>功能说明：点击生成处方的新能，便后PC端打印处方单，医生PAD端无手写样本</li>
      </ol>
    </div>
    
    <!-- 打印预览模态框 -->
    <div v-if="showPrintModal" class="print-modal-backdrop" @click="closePrintModal">
      <div class="print-modal" @click.stop>
        <div class="print-modal-header">
          <h3>打印病历与处方</h3>
          <button class="close-btn" @click="closePrintModal">×</button>
        </div>
        <div class="print-modal-content" id="print-area">
          <!-- 左右非对称打印预览区域 -->
          <div class="print-preview-asymmetric-container">
            <!-- 左侧病历 -->
            <div class="print-column medical-record-column">
                <div class="record-header">
                    <span class="record-date">2024年 6月 18日</span>
                    <span class="record-institution">XX机构</span>
                </div>
                <div class="record-section">
                    <span class="record-label">主诉:</span>
                    <span class="record-content">头晕1个月，加重3天</span>
                </div>
                <div class="record-section">
                    <span class="record-label">现病史:</span>
                    <span class="record-content">患者1个月前无明显诱因出现头晕头痛，休息后自行缓解，近3天头晕加重，视物旋转，无法正常行走。</span>
                </div>
                <div class="record-section">
                    <span class="record-label">既往史:</span>
                    <span class="record-content">既往体质一般，否认"肝炎""结核"等传染病史，无外伤史。</span>
                </div>
                 <div class="record-section">
                    <span class="record-label">体检:</span>
                    <span class="record-content">T 36.8℃ P 88次/分 R 24次/分 BP 158/106mmHg 神清合作,唇不发绀,双肺呼吸音清晰无罗音。心率齐,心音可,无杂音。腹部平软无压痛反跳痛，肝脾未及。</span>
                </div>
                 <div class="record-section">
                    <span class="record-label">辅助检查:</span>
                    <span class="record-content">空腹血糖：5.5mmol/L，心电图：正常</span>
                </div>
                 <div class="record-section">
                    <span class="record-label">诊断:</span>
                    <span class="record-content">原发性高血压病 III 级</span>
                </div>
                 <div class="record-section">
                    <span class="record-label">处理:</span>
                    <div class="record-treatment-content">
                        <div>① 阿莫西林胶囊 0.25g*24粒/盒 共2盒，0.5g 口服 每天3次</div>
                        <div>② 0.9%葡萄糖注射液 5%×250ml/袋 共2袋， 250ml</div>
                        <div style="padding-left: 20px;">头孢硫脒 2ml:0.1g*10支/盒 共2支， 0.2g</div>
                        <div style="padding-left: 20px;">胞磷胆碱钠注射液 250mg/2ml×5支/盒 共2支， 250mg</div>
                        <div style="padding-left: 20px;">sig: 静脉滴注 每天1次</div>
                        <div>③ (兴元君) 盐酸曲美胶囊 0.25g*24粒/盒 共2盒， 0.5g 口服 每天3次</div>
                    </div>
                </div>
                <div class="record-signature">
                    <span>医师签名:</span>
                    <span>张医生</span>
                </div>
            </div>

            <!-- 右侧处方笺 -->
            <div class="print-column prescription-column">
              <div class="print-header-unified">
                <div class="hospital-name">上海XX机构处方笺</div>
                <div class="prescription-number">No. {{ selectedOrder ? selectedOrder.id : '0051258' }}</div>
                <button class="sound-btn-print" title="语音"><i class="el-icon-microphone"></i></button>
              </div>
              <div class="patient-info-print">
                  <span>姓名: 尹小二</span>
                  <span>性别: 男</span>
                  <span>年龄: 88</span>
                  <span>入院号: F10245</span>
                  <span>床位: 2203-3</span>
                  <span>科别:</span>
                  <span>费别: 医保</span>
                  <span>医保号: 310652122342</span>
                  <span>日期: 2024-05-16</span>
              </div>
              <div class="diagnosis-print">
                <span>诊断: 高血压病 III级，上呼吸道感染</span>
              </div>
              <div class="prescription-content-print">
                <div class="rx-title-print">R<span class="rx-sub">x:</span></div>
                <div class="medication-list-print">
                  <!-- 药品列表 -->
                 <div class="medication-item-print">
                    <span class="med-number">①</span> 
                    <span class="med-name">0.9%氯化钠注射液</span>
                    <span class="med-spec">250ml*1瓶/盒</span>
                    <span class="med-dose">250ml</span>
                    <span class="med-qty">x 2瓶</span>
                  </div>
                  <div class="medication-item-print">
                      <span class="med-number"></span>
                      <span class="med-name">0.15g青霉素</span>
                      <span class="med-spec">0.15g*6支/盒</span>
                      <span class="med-dose">0.3g</span>
                      <span class="med-qty">x 2盒</span>
                   </div>
                   <div class="medication-item-print">
                      <span class="med-number"></span>
                      <span class="med-name">10%葡萄糖注射液</span>
                      <span class="med-spec">0.25g*2支/盒</span>
                      <span class="med-dose">0.5g</span>
                      <span class="med-qty">x 2盒</span>
                  </div>
                   <div class="medication-sig-print"><span>Sig:</span> 静脉滴注 每天1次 40滴/分 x2天</div>
                  <div class="medication-item-print">
                    <span class="med-number">②</span> 
                    <span class="med-name">(阿莫仙)阿莫西林胶囊</span>
                    <span class="med-spec">0.25mg*20粒/盒</span>
                    <span class="med-dose"><span class="tag-self">自备</span></span>
                    <span class="med-qty">x 2盒</span>
                  </div>
                  <div class="medication-sig-print"><span>Sig:</span> 0.5g 口服 每天2次 上午 空腹服 X7天</div>
                  <div class="medication-item-print">
                    <span class="med-number">③</span> 
                    <span class="med-name">复方葡萄糖酸钙口服溶液</span>
                    <span class="med-spec">10ml*20支/盒</span>
                    <span class="med-dose"></span>
                    <span class="med-qty">x 2瓶</span>
                  </div>
                   <div class="medication-sig-print"><span>Sig:</span> 2支 口服 每天2次 X3天</div>
                  <!-- 药品列表结束 -->
                </div>
                <div class="page-footer-print">以下空白</div>
              </div>
              <div class="print-footer-fields">
                <span>审核/调配:</span>
                <span>核对/发药:</span>
                <span>医师:</span>
                <span>金额:</span>
              </div>
            </div>
          </div>
        </div>
        <div class="print-modal-footer">
          <button class="print-btn-large" @click="doPrint('record')"><i class="el-icon-printer"></i> 打印病历</button>
          <button class="print-btn-large" @click="doPrint('prescription')"><i class="el-icon-printer"></i> 打印处方</button>
        </div>
      </div>
    </div>
    
    <!-- 查看详情对话框 -->
    <div v-if="showDetailModal" class="detail-modal-backdrop" @click="closeDetailModal">
      <div class="detail-modal" @click.stop>
        <div class="detail-modal-header">
          <div class="tabs">
            <span class="tab active">电子处方</span>
            <span class="tab">电子病历</span>
          </div>
          <button class="close-btn" @click="closeDetailModal" title="关闭">×</button>
        </div>
        <div class="detail-modal-content">
          <div class="detail-patient-info">
            <div class="info-header">
              <span class="patient-name-detail">王大爷</span>
              <span class="patient-gender-detail">男</span>
              <span class="patient-age-detail">86周岁</span>
              <span class="patient-bed-detail">床位 <span class="value">2206-5</span></span>
              <span class="patient-admission-detail">入院编号 <span class="value">20240506124</span></span>
              <span class="patient-category-detail">类别 <span class="value">医保</span></span>
              <span class="patient-card-detail">医保卡号 <span class="value">D053252131</span></span>
              <span class="patient-department-detail">科别</span>
              <span class="patient-visit-date-detail">就诊日期 <span class="value">2024-05-12</span></span>
            </div>
            <div class="info-diagnosis">
              <span class="label">临床诊断:</span>
              <span class="value">头晕痛，颈椎病</span>
            </div>
            <div class="info-allergies">
              <span class="label">过敏史:</span>
              <span class="value allergies">青霉素、头孢、先锋类</span>
            </div>
            <div class="action-buttons-detail">
              <button class="btn-modify">修改</button>
              <button class="btn-print-detail">打印处方</button>
            </div>
          </div>
          <div class="prescription-table-detail">
            <table>
              <thead>
                <tr>
                  <th>组号</th>
                  <th>内容</th>
                  <th>规格</th>
                  <th>单次剂量</th>
                  <th>用法</th>
                  <th>频率</th>
                  <th>给药时间</th>
                  <th>天数</th>
                  <th>总量</th>
                  <th>来源</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>阿司匹林肠溶片</td>
                  <td>0.25g*20粒/盒</td>
                  <td>0.25g</td>
                  <td>口服(po)</td>
                  <td>每天1次(qd)</td>
                  <td>睡前(hs)</td>
                  <td>4</td>
                  <td>3盒</td>
                  <td>内服</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>(维他命c)维生素C</td>
                  <td>10ml*5支/盒</td>
                  <td>10ml</td>
                  <td>外用</td>
                  <td>每天3次(tid)</td>
                  <td></td>
                  <td>7</td>
                  <td>3瓶</td>
                  <td>自开</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>0.9%氯化钠注射液</td>
                  <td>500ml*1瓶/盒</td>
                  <td>0.25g</td>
                  <td>静脉滴注(ivdrip)</td>
                  <td>每天1次(qd)</td>
                  <td></td>
                  <td>3</td>
                  <td>1盒</td>
                  <td>内服</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicalOrderManagement',
  data() {
    return {
      selectedPatient: null,
      showPrintModal: false,
      showDetailModal: false,
      selectedOrder: null,
      patients: [
        { id: 1, name: '李大爷', gender: '男', bed: '2201-01', admissionNo: '122455478', age: 86, nursingLevel: '二级护理' },
        { id: 2, name: '李大爷', gender: '男', bed: '2021-02', admissionNo: '122455478', age: 76, nursingLevel: '二级护理' },
        { id: 3, name: '史娥', gender: '女', bed: '2201-01', admissionNo: '122455478', age: 82, nursingLevel: '一级护理' },
        { id: 4, name: '李大爷', gender: '男', bed: '2021-02', admissionNo: '122455478', age: 69, nursingLevel: '二级护理' },
        { id: 5, name: '张三', gender: '男', bed: '2201-01', admissionNo: '122455478', age: 78, nursingLevel: '二级护理' },
        { id: 6, name: '李大爷', gender: '男', bed: '2021-02', admissionNo: '122455478', age: 90, nursingLevel: '二级护理' },
        { id: 7, name: '刘继斌', gender: '男', bed: '2201-01', admissionNo: '122455478', age: 81, nursingLevel: '二级护理' },
        { id: 8, name: '李大爷', gender: '男', bed: '2021-02', admissionNo: '122455478', age: 73, nursingLevel: '二级护理' },
        { id: 9, name: '李四', gender: '男', bed: '2201-01', admissionNo: '122455478', age: 81, nursingLevel: '二级护理' },
        { id: 10, name: '李大爷', gender: '男', bed: '2021-02', admissionNo: '122455478', age: 65, nursingLevel: '二级护理' }
      ],
      medicalOrders: [
        { id: '0002658', date: '2024-05-16 12:56', diagnosis: '高血压脑、冠心病', treatment: '处方开药3种', doctor: '王医生' },
        { id: '0023566', date: '2024-05-16 12:56', diagnosis: '细菌性上呼吸道感染', treatment: '处方开药3种', doctor: '张医生' },
        { id: '0002365', date: '2024-05-16 12:56', diagnosis: '甲型流感', treatment: '其他', doctor: 'XXXX' },
        { id: '0050052', date: '2024-05-16 12:56', diagnosis: '糖尿病', treatment: '其他', doctor: 'XXXX', disabled: true }
      ]
    };
  },
  methods: {
    selectPatient(patient) {
      this.selectedPatient = patient;
    },
    invalidateOrder(order) {
      if (confirm('确认作废此条记录？')) {
        const index = this.medicalOrders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.$set(this.medicalOrders[index], 'disabled', true);
        }
      }
    },
    printOrder(order) {
      this.selectedOrder = order;
      this.showPrintModal = true;
    },
    closePrintModal() {
      this.showPrintModal = false;
    },
    doPrint(section) {
      alert(`打印${section === 'left' ? '病历' : '处方'}功能已触发`);
      this.closePrintModal();
    },
    viewOrderDetail(order) {
      // 跳转到新的详情页面路由，传递订单 ID
      this.$router.push({ name: 'PrescriptionDetail', params: { id: order.id } });
    },
    closeDetailModal() {
      this.showDetailModal = false;
    }
  },
  mounted() {
    // 页面加载时不自动选择患者
    this.selectedPatient = null;
  }
};
</script>

<style scoped>
.medical-management-container {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.left-panel {
  width: 300px;
  margin-right: 20px;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-header {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.search-header h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.search-box {
  display: flex;
  margin-bottom: 10px;
}

.area-select {
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 10px;
  flex: 1;
}

.search-input {
  display: flex;
  flex: 2;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.search-input input {
  flex: 1;
  border: none;
  padding: 8px;
  outline: none;
}

.search-btn {
  width: 34px;
  background-color: white;
  border: none;
  border-left: 1px solid #dcdfe6;
  cursor: pointer;
}

.patient-list {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.patient-table {
  width: 100%;
  border-collapse: collapse;
}

.patient-table th {
  padding: 12px 8px;
  background-color: #f5f7fa;
  font-weight: normal;
  text-align: left;
  color: #909399;
}

.patient-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #ebeef5;
}

.patient-table tr:hover {
  background-color: #f5f7fa;
  cursor: pointer;
}

.patient-table tr.active {
  background-color: #ecf5ff;
}

.patient-name {
  font-weight: 500;
  color: #303133;
}

.patient-gender {
  color: #909399;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 15px 0;
  align-items: center;
}

.page-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
}

.page-numbers {
  display: flex;
  margin: 0 5px;
}

.page-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  cursor: pointer;
  border-radius: 4px;
}

.page-number:hover {
  background-color: #f5f5f5;
}

.page-number.active {
  background-color: #409eff;
  color: white;
}

.page-size-select {
  margin-left: 10px;
  padding: 5px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.right-panel {
  flex: 1;
  min-width: 500px;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.tab-item {
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.tab-item i {
  margin-right: 5px;
}

.tab-item.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
}

.stethoscope-icon {
  margin-bottom: 20px;
  width: 100px;
  height: 100px;
}

.stethoscope-icon svg {
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.empty-text {
  color: #909399;
  font-size: 16px;
}

.patient-details {
  height: 100%;
}

.patient-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.patient-avatar {
  width: 50px;
  height: 50px;
  background-color: #409eff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.avatar-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.patient-info {
  flex: 1;
}

.patient-name-row {
  margin-bottom: 5px;
}

.patient-name {
  font-size: 16px;
  font-weight: 500;
  margin-right: 10px;
}

.patient-gender, .patient-age {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
}

.patient-room {
  font-size: 14px;
  color: #606266;
}

.nursing-level {
  margin-left: 15px;
  color: #e6a23c;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
}

.header-btn {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  margin-left: 10px;
}

.medical-orders {
  padding: 15px 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-icon {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.order-icon i {
  margin-right: 5px;
  color: #409eff;
}

.new-order-btn {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
}

.order-list {
  margin-bottom: 15px;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
}

.order-table th {
  padding: 12px 8px;
  background-color: #f5f7fa;
  text-align: left;
  font-weight: normal;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
}

.order-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #ebeef5;
}

.order-table tr.disabled-row {
  color: #c0c4cc;
  text-decoration: line-through;
}

.operation-cell {
  white-space: nowrap;
  padding: 0 8px;
  min-width: 120px;
  text-align: center;
}

.action-pill-btn {
  display: inline-block;
  border: none;
  border-radius: 20px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  margin: 0 2px;
  min-width: 36px;
  line-height: 1.5;
}

.action-pill-btn.view-btn {
  background-color: #409eff;
  color: white;
}

.action-pill-btn.print-btn {
  background-color: #67c23a;
  color: white;
}

.action-pill-btn.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.guide-tips {
  width: 100%;
  margin-top: 20px;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 15px 20px;
  border-radius: 4px;
}

.guide-tips ol {
  padding-left: 20px;
  margin: 0;
}

.guide-tips li {
  color: #8c6e2d;
  margin-bottom: 5px;
  font-size: 14px;
}

.print-modal-backdrop, .detail-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.print-modal, .detail-modal {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
}

.print-modal-header, .detail-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.print-modal-header h3, .detail-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  line-height: 1;
}

.close-btn:hover {
  color: #f56c6c;
}

.print-modal-content, .detail-modal-content {
  padding: 20px;
}

.print-modal-footer {
  display: flex;
  justify-content: center;
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.print-btn-large {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 0 10px;
  font-size: 14px;
}

.print-btn-large:hover {
  opacity: 0.8;
}

.detail-modal-header .tabs {
  display: flex;
  gap: 10px;
}

.detail-modal-header .tab {
  padding: 8px 15px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 16px;
}

.detail-modal-header .tab.active {
  border-bottom-color: #409eff;
  color: #409eff;
  font-weight: bold;
}

.detail-patient-info {
  background-color: #f5f7fa;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.info-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.info-header span {
  font-size: 14px;
  color: #606266;
}

.info-header .value {
  color: #303133;
  font-weight: bold;
}

.patient-name-detail {
  font-size: 18px !important;
  font-weight: bold;
  color: #303133 !important;
}

.info-diagnosis, .info-allergies {
  margin-bottom: 10px;
}

.info-diagnosis .label, .info-allergies .label {
  font-weight: bold;
  margin-right: 5px;
}

.info-allergies .allergies {
  color: red;
}

.action-buttons-detail {
  margin-top: 15px;
  text-align: right;
}

.action-buttons-detail button {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
}

.btn-modify {
  background-color: #e6a23c;
  color: white;
}

.btn-print-detail {
  background-color: #409eff;
  color: white;
}

.prescription-table-detail table {
  width: 100%;
  border-collapse: collapse;
}

.prescription-table-detail th,
.prescription-table-detail td {
  border: 1px solid #ebeef5;
  padding: 10px 8px;
  text-align: left;
  font-size: 13px;
}

.prescription-table-detail th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: normal;
}

.print-preview-asymmetric-container {
  display: flex;
  gap: 30px;
}

.print-column {
  flex: 1;
  border: 1px solid #ccc;
  padding: 20px;
  position: relative;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  font-family: 'SimSun', '宋体', serif;
  color: #000;
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
}

.record-section {
  margin-bottom: 15px;
}

.record-label {
  font-weight: bold;
  margin-right: 5px;
}

.record-treatment-content {
    padding-left: 1.5em;
}

.record-signature {
  margin-top: auto;
  padding-top: 20px;
  text-align: right;
  font-size: 14px;
}

.print-preview-symmetric-container {
    display: none !important;
}

.print-footer-fields {
  position: relative;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #000;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px 20px;
  font-size: 13px;
  color: #000;
}

.print-preview-unified,
.medical-record-section {
    display: none !important;
}

.prescription-content-print {
  margin-top: 10px;
  position: relative;
  flex-grow: 1;
  padding-bottom: 60px;
}

.print-header-unified {
  text-align: center;
  position: relative;
  margin-bottom: 15px;
}

.hospital-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.prescription-number {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;
}

.sound-btn-print {
  position: absolute;
  top: 0;
  right: 80px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.sound-btn-print:hover {
  background: #ddd;
}

.patient-info-print {
  display: grid;
  grid-template-columns: repeat(5, auto);
  gap: 5px 15px;
  font-size: 13px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #000;
}

.diagnosis-print {
  font-size: 13px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #000;
}

.rx-title-print {
  font-family: 'Times New Roman', Times, serif;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.rx-sub {
  font-size: 20px;
  vertical-align: baseline;
}

.medication-list-print {
  margin-top: 5px;
}

.medication-item-print {
  display: grid;
  grid-template-columns: 30px 2fr 1fr 1fr 1fr;
  gap: 5px 10px;
  margin-bottom: 5px;
  font-size: 14px;
}

.med-number {
  font-weight: bold;
}

.tag-self {
  border: 1px solid #000;
  padding: 1px 3px;
  font-size: 10px;
  border-radius: 2px;
}

.medication-sig-print {
  margin-left: 30px;
  font-size: 14px;
  margin-bottom: 15px;
}

.medication-sig-print span {
    font-weight: bold;
    margin-right: 5px;
}

.page-footer-print {
  text-align: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
  color: #666;
  font-size: 13px;
}

.print-btn-large i {
    margin-right: 5px;
}
</style> 