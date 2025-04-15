<template>
  <div class="prescription-records-container">
    <div class="search-header">
      <div class="search-controls">
        <div class="date-range">
          <label>开方日期</label>
          <input type="date" v-model="searchParams.startDate">
          <span>~</span>
          <input type="date" v-model="searchParams.endDate">
        </div>
        <div class="status-select">
          <select v-model="searchParams.status">
            <option value="all">全部</option>
            <option value="pending">未发药</option>
            <option value="completed">已发药</option>
          </select>
        </div>
        <div class="search-input">
          <input type="text" v-model="searchParams.keyword" placeholder="姓名/入院编号">
          <button class="search-btn"><i class="el-icon-search"></i> 搜索</button>
        </div>
      </div>
    </div>

    <div class="records-table-wrapper">
      <table class="records-table">
        <thead>
          <tr>
            <th>处方编号</th>
            <th>长者</th>
            <th>房间床位</th>
            <th>入院编号</th>
            <th>费别</th>
            <th>药物种数</th>
            <th>发药状态</th>
            <th>处方日期</th>
            <th>开方医生</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in prescriptionRecords" :key="record.id">
            <td>{{ record.prescriptionNo }}</td>
            <td>{{ record.patientName }}</td>
            <td>{{ record.roomBed }}</td>
            <td>{{ record.admissionNo }}</td>
            <td>{{ record.insuranceType }}</td>
            <td>{{ record.drugCount }}</td>
            <td>
              <span :class="['status-tag', record.status === 'pending' ? 'pending' : 'completed']">
                {{ record.status === 'pending' ? '未发药' : '已发药' }}
              </span>
            </td>
            <td>{{ record.prescriptionDate }}</td>
            <td>{{ record.doctor }}</td>
            <td class="action-buttons">
              <button class="btn-print" @click="openPrintPreview(record)">
                <i class="el-icon-printer"></i> 打印
              </button>
              <button class="btn-view" @click="openPrescriptionDetail(record)">
                <i class="el-icon-document"></i> 查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="records-pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
      <button 
        v-for="page in pageNumbers" 
        :key="page" 
        :class="{ active: currentPage === page }"
        @click="changePage(page)">
        {{ page }}
      </button>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">&gt;</button>
      <select v-model="pageSize">
        <option value="10">10条/页</option>
        <option value="20">20条/页</option>
        <option value="50">50条/页</option>
      </select>
    </div>
    
    <!-- 处方打印预览弹窗 -->
    <div v-if="showPrintPreview" class="print-preview-modal">
      <div class="print-preview-content">
        <div class="print-preview-header">
          <h2>上海XX机构处方笺</h2>
          <button class="close-btn" @click="closePrintPreview">&times;</button>
        </div>
        <div class="print-preview-body">
          <div class="patient-info">
            <div class="info-row">
              <span>姓名: {{ selectedRecord.patientName }}</span>
              <span>性别: {{ selectedRecord.gender || '男' }}</span>
              <span>年龄: {{ selectedRecord.age || '86' }}</span>
              <span>入院号: {{ selectedRecord.admissionNo }}</span>
              <span>床位: {{ selectedRecord.roomBed }}</span>
            </div>
            <div class="info-row">
              <span>科别: {{ selectedRecord.department || '内科' }}</span>
              <span>费别: {{ selectedRecord.insuranceType }}</span>
              <span>医保号: {{ selectedRecord.insuranceNo || '310652122342' }}</span>
              <span>日期: {{ selectedRecord.prescriptionDate }}</span>
            </div>
          </div>
          <div class="diagnosis">
            <span>诊断: {{ selectedRecord.diagnosis || '高血压、上呼吸道感染' }}</span>
          </div>
          <div class="prescription-content">
            <div class="rx-symbol">Rx:</div>
            <div class="drug-list">
              <div v-for="(drug, index) in selectedRecord.drugs" :key="index" class="drug-item">
                <div class="drug-number">{{ index + 1 }}</div>
                <div class="drug-info">
                  <div class="drug-name">{{ drug.name }} {{ drug.spec }}</div>
                  <div class="drug-usage">
                    Sig: {{ drug.usage }} {{ drug.frequency }} {{ drug.duration }}
                  </div>
                </div>
                <div class="drug-quantity">x {{ drug.quantity }}</div>
              </div>
            </div>
          </div>
          <div class="prescription-footer">
            <div class="signature-row">
              <span>审核/调配:</span>
              <span>核对/发药:</span>
              <span>医师:</span>
            </div>
            <div class="amount-row">
              <span>金额:</span>
            </div>
          </div>
        </div>
        <div class="print-preview-footer">
          <button class="btn-close" @click="closePrintPreview">关闭</button>
          <button class="btn-print" @click="printPrescription">
            <i class="el-icon-printer"></i> 打印
          </button>
        </div>
      </div>
    </div>

    <!-- 处方详情弹窗 -->
    <div v-if="showPrescriptionDetail" class="prescription-detail-modal">
      <div class="detail-modal-content">
        <div class="detail-modal-header">
          <div class="prescription-info">
            <span class="prescription-no">No. {{ selectedRecord.prescriptionNo }}</span>
            <span class="prescription-type">类型: 普通药品处方</span>
          </div>
          <button class="close-btn" @click="closePrescriptionDetail">&times;</button>
        </div>
        <div class="detail-modal-body">
          <div class="patient-basic-info">
            <div class="info-item">
              <span>姓名</span>
              <span>{{ selectedRecord.patientName }}</span>
            </div>
            <div class="info-item">
              <span>性别</span>
              <span>{{ selectedRecord.gender || '男' }}</span>
            </div>
            <div class="info-item">
              <span>年龄</span>
              <span>{{ selectedRecord.age || '86' }}</span>
            </div>
            <div class="info-item">
              <span>入院编号</span>
              <span>{{ selectedRecord.admissionNo }}</span>
            </div>
            <div class="info-item">
              <span>科别</span>
              <span>{{ selectedRecord.department || '内科' }}</span>
            </div>
            <div class="info-item">
              <span>房间床位</span>
              <span>{{ selectedRecord.roomBed }}</span>
            </div>
            <div class="info-item">
              <span>费别</span>
              <span>{{ selectedRecord.insuranceType }}</span>
            </div>
            <div class="info-item">
              <span>医保号</span>
              <span>{{ selectedRecord.insuranceNo || '310652122342' }}</span>
            </div>
            <div class="info-item">
              <span>处方日期</span>
              <span>{{ selectedRecord.prescriptionDate }}</span>
            </div>
          </div>
          <div class="clinical-diagnosis">
            <span>临床诊断：</span>
            <span>{{ selectedRecord.diagnosis || '高血压、上呼吸道感染' }}</span>
          </div>
          <div class="prescription-drugs">
            <table class="drugs-table">
              <thead>
                <tr>
                  <th>内容/规格</th>
                  <th>单次剂量</th>
                  <th>用法/频次</th>
                  <th>总量</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(drug, idx) in selectedRecord.drugs" :key="idx">
                  <td>
                    {{ drug.name }}
                    <div class="spec">{{ drug.spec }}</div>
                  </td>
                  <td>{{ drug.dosage || '默认剂量' }}</td>
                  <td>
                    {{ drug.usage }}
                    <div class="frequency">{{ drug.frequency }}</div>
                  </td>
                  <td>{{ drug.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="prescription-footer-info">
            <div class="staff-info">
              <span>医师：{{ selectedRecord.doctor }}</span>
              <span>审核/发药：{{ selectedRecord.pharmacist || '刘护士' }}</span>
            </div>
            <div class="amount-info">
              <span>金额：¥{{ selectedRecord.amount || '68.90' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrescriptionRecords',
  data() {
    return {
      searchParams: {
        startDate: '',
        endDate: '',
        status: 'all',
        keyword: ''
      },
      currentPage: 1,
      pageSize: 10,
      totalPages: 10,
      showPrintPreview: false,
      showPrescriptionDetail: false,
      selectedRecord: null,
      prescriptionRecords: [
        {
          id: '22452',
          prescriptionNo: '22452',
          patientName: '李大爷',
          roomBed: '2022-01',
          admissionNo: '122455478',
          insuranceType: '医保',
          drugCount: 3,
          status: 'pending',
          prescriptionDate: '2024-05-16 12:56',
          doctor: '王医生',
          gender: '男',
          age: '86',
          department: '内科',
          insuranceNo: '310652122342',
          diagnosis: '高血压、上呼吸道感染',
          drugs: [
            {
              name: '0.9%氯化钠注射液',
              spec: '250ml*1瓶/盒',
              dosage: '250ml',
              usage: '静脉滴注',
              frequency: '每天1次 40滴/分',
              duration: 'x2天',
              quantity: '2瓶'
            },
            {
              name: '(国大1号)0.15g青霉素',
              spec: '0.15g*6支/盒',
              dosage: '0.3g',
              usage: '口服',
              frequency: '每天2次',
              duration: 'x7天',
              quantity: '2盒'
            }
          ],
          pharmacist: '刘护士',
          amount: 68.90
        },
        {
          id: '22453',
          prescriptionNo: '22453',
          patientName: '张奶奶',
          roomBed: '2022-03',
          admissionNo: '0023566',
          insuranceType: '自费',
          drugCount: 2,
          status: 'completed',
          prescriptionDate: '2024-05-15 09:30',
          doctor: '赵医生',
          gender: '女',
          age: '78',
          department: '内科',
          insuranceNo: '310123456789',
          diagnosis: '细菌性上呼吸道感染',
          drugs: [
            {
              name: '阿司匹林肠溶片',
              spec: '0.25g*20粒/盒',
              dosage: '0.25g',
              usage: '口服',
              frequency: '每天1次',
              duration: 'x4天',
              quantity: '3盒'
            },
            {
              name: '维生素C',
              spec: '10ml*5支/盒',
              dosage: '适量',
              usage: '外用',
              frequency: '每天3次',
              duration: 'x7天',
              quantity: '3瓶'
            }
          ],
          pharmacist: '张护士',
          amount: 127.50
        },
        {
          id: '22454',
          prescriptionNo: '22454',
          patientName: '王先生',
          roomBed: '2023-05',
          admissionNo: '0002365',
          insuranceType: '医保',
          drugCount: 1,
          status: 'pending',
          prescriptionDate: '2024-05-14 15:45',
          doctor: '张医生',
          gender: '男',
          age: '92',
          department: '内科',
          insuranceNo: '310987654321',
          diagnosis: '甲型流感',
          drugs: [
            {
              name: '奥司他韦胶囊',
              spec: '75mg*10粒/盒',
              dosage: '75mg',
              usage: '口服',
              frequency: '每天2次',
              duration: 'x5天',
              quantity: '1盒'
            }
          ],
          pharmacist: '李护士',
          amount: 86.40
        }
      ]
    }
  },
  computed: {
    pageNumbers() {
      const pages = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    printPrescription() {
      // 实现打印功能
      window.print();
    },
    viewPrescription(record) {
      // 跳转到处方详情页面
      this.$router.push(`/prescription-detail/${record.admissionNo}`);
    },
    openPrintPreview(record) {
      this.selectedRecord = record;
      this.showPrintPreview = true;
    },
    closePrintPreview() {
      this.showPrintPreview = false;
      this.selectedRecord = null;
    },
    openPrescriptionDetail(record) {
      this.selectedRecord = record;
      this.showPrescriptionDetail = true;
    },
    closePrescriptionDetail() {
      this.showPrescriptionDetail = false;
      this.selectedRecord = null;
    }
  }
}
</script>

<style scoped>
.prescription-records-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.search-header {
  background: white;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.search-controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range input[type="date"] {
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.status-select select {
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 120px;
}

.search-input {
  display: flex;
  align-items: center;
}

.search-input input {
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  padding: 8px 15px;
  background: #409eff;
  border: none;
  border-radius: 4px;
  color: white;
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.search-btn:hover {
  background: #66b1ff;
}

.search-btn i {
  font-size: 16px;
}

.records-table-wrapper {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.records-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
}

.status-tag.pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-tag.completed {
  background-color: #f0f9eb;
  color: #67c23a;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.action-buttons button {
  padding: 7px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 13px;
}

.action-buttons .btn-print {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.action-buttons .btn-print:hover {
  color: white;
  background-color: #409eff;
  border-color: #409eff;
}

.action-buttons .btn-view {
  color: #67c23a;
  border-color: #e1f3d8;
  background-color: #f0f9eb;
}

.action-buttons .btn-view:hover {
  color: white;
  background-color: #67c23a;
  border-color: #67c23a;
}

.action-buttons button i {
  font-size: 14px;
}

.records-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  background: white;
  border-radius: 4px;
  padding: 15px 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.records-pagination button {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.records-pagination button.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.records-pagination select {
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 打印预览弹窗样式 */
.print-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.print-preview-content {
  background: white;
  width: 800px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.print-preview-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.print-preview-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
}

.print-preview-body {
  padding: 20px;
  min-height: 500px;
}

.patient-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.diagnosis {
  margin-bottom: 20px;
}

.prescription-content {
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 20px;
}

.rx-symbol {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.drug-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.drug-item {
  display: flex;
  gap: 10px;
}

.drug-number {
  width: 20px;
}

.drug-info {
  flex: 1;
}

.drug-quantity {
  width: 80px;
  text-align: right;
}

.prescription-footer {
  margin-top: 40px;
}

.signature-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.amount-row {
  margin-top: 10px;
}

.print-preview-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-close, .btn-print {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.btn-close {
  background-color: white;
  color: #606266;
}

.btn-print {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

/* 处方详情弹窗样式 */
.prescription-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.detail-modal-content {
  background: white;
  width: 800px;
  border-radius: 4px;
  max-height: 90vh;
  overflow-y: auto;
}

.detail-modal-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.prescription-info {
  display: flex;
  gap: 20px;
}

.prescription-no {
  font-weight: bold;
}

.detail-modal-body {
  padding: 20px;
}

.patient-basic-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item span:first-child {
  color: #909399;
  font-size: 13px;
}

.clinical-diagnosis {
  margin-bottom: 20px;
}

.drugs-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.drugs-table th,
.drugs-table td {
  padding: 12px;
  border: 1px solid #ebeef5;
}

.spec,
.frequency {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.prescription-footer-info {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.staff-info {
  display: flex;
  gap: 20px;
}
</style> 