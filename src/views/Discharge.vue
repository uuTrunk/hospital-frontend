<template>
  <div class="assessment-container">
    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" type="card" class="custom-tabs">
      <el-tab-pane name="assessment">
        <span slot="label" @click="goToAssessment">
          入院评估
          <el-badge :value="2" class="tab-badge" type="info"></el-badge>
        </span>
      </el-tab-pane>
      <el-tab-pane name="discharge">
        <span slot="label">
          离院办理
          <el-badge :value="pendingDischargeCount" class="tab-badge" type="primary"></el-badge>
        </span>
        <!-- 离院办理内容 -->
        <div class="search-section">
          <div class="search-form">
            <div class="form-item">
              <span class="label">离院日期</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy/MM/dd"
                value-format="yyyy-MM-dd"
                :default-time="['00:00:00', '23:59:59']"
                @change="handleDateChange">
              </el-date-picker>
            </div>
            <div class="form-item">
              <el-input
                v-model="searchQuery"
                placeholder="姓名/入院编号"
                class="search-input">
                <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
              </el-input>
            </div>
          </div>
        </div>

        <div class="notice">
          <p>提示：完成离院流程手续后，离院小结数据不可再修改</p>
        </div>

        <!-- 表格内容 -->
        <div class="content-section">
          <el-table
            v-loading="loading"
            :data="tableData"
            style="width: 100%"
            border>
            <el-table-column
              label="姓名/身份证"
              width="200">
              <template slot-scope="scope">
                <div>{{ scope.row.patientInfo.name }}</div>
                <div class="id-number">{{ scope.row.patientInfo.idNumber }}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="性别"
              width="80">
              <template slot-scope="scope">
                {{ scope.row.patientInfo.gender }}
              </template>
            </el-table-column>
            <el-table-column
              label="年龄"
              width="80">
              <template slot-scope="scope">
                {{ scope.row.patientInfo.age }}
              </template>
            </el-table-column>
            <el-table-column
              label="入院日期"
              width="120">
              <template slot-scope="scope">
                {{ formatDate(scope.row.patientInfo.registrationDate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="dischargeReason"
              label="离院原因"
              width="120">
            </el-table-column>
            <el-table-column
              prop="dischargeDate"
              label="离院日期"
              width="120">
              <template slot-scope="scope">
                {{ formatDate(scope.row.dischargeDate) }}
              </template>
            </el-table-column>
            <el-table-column
              label="离院小结"
              width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.summaryStatus)" size="medium">
                  {{ scope.row.summaryStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="离院交接"
              width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.handoverStatus)" size="medium">
                  {{ scope.row.handoverStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="120"
              fixed="right">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="getOperationButton(scope.row).type === 'edit' ? editDischarge(scope.row) : viewDischargeDetails(scope.row)">
                  <i :class="getOperationButton(scope.row).icon"></i>
                  {{ getOperationButton(scope.row).text }}
                </el-button>
                <el-button
                  v-if="scope.row.summaryStatus === 'completed'"
                  type="text"
                  size="small"
                  @click="printDischarge(scope.row)">
                  <i class="el-icon-printer"></i>
                  打印
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 打印模态框 -->
    <el-dialog
      title="离院小结"
      :visible.sync="showPrintModal"
      width="800px"
      class="print-dialog"
      :before-close="closePrintModal">
      <div class="print-content">
        <div class="print-header">
          <h2>上海XX机构</h2>
          <h3>出院小结</h3>
        </div>

        <div class="patient-info">
          <div class="info-row">
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ selectedPatient.name }}</span>
            </div>
            <div class="info-item">
              <label>性别：</label>
              <span>{{ selectedPatient.gender }}</span>
            </div>
            <div class="info-item">
              <label>年龄：</label>
              <span>{{ selectedPatient.age }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <label>入院日期：</label>
              <span>{{ selectedPatient.admissionDate }}</span>
            </div>
            <div class="info-item">
              <label>出院日期：</label>
              <span>{{ selectedPatient.dischargeDate }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">入院诊断</div>
          <div class="section-content">
            <div>1. 高血压病</div>
            <div>2. 美尼尔综合征</div>
            <div>3. 老年性精神障碍</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">入院情况</div>
          <div class="section-content">
            {{ selectedPatient.name }}，{{ selectedPatient.gender }}，{{ selectedPatient.age }}岁，因家中子女上班无人照料且生活无法自理入院。
          </div>
        </div>

        <div class="section">
          <div class="section-title">在院治疗情况</div>
          <div class="section-content">
            入院后给予对症支持治疗，病情稳定。
          </div>
        </div>

        <div class="section">
          <div class="section-title">出院医嘱</div>
          <div class="section-content">
            <div>1. 注意生活作息规律，清淡饮食</div>
            <div>2. 控制血压</div>
            <div>3. 定期检查，不适随诊</div>
          </div>
        </div>

        <div class="doctor-info">
          <div>医生签名：________________</div>
          <div>日期：{{ new Date().toLocaleDateString() }}</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closePrintModal">取 消</el-button>
        <el-button type="primary" @click="actualPrint">打 印</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getDischargeList } from '@/api/discharge'

export default {
  name: 'DischargeManagement',
  data() {
    return {
      activeTab: 'discharge',
      loading: false,
      tableData: [],
      dateRange: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      showPrintModal: false,
      selectedPatient: {}
    }
  },
  created() {
    this.fetchDischargeList()
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
    async fetchDischargeList() {
      try {
        this.loading = true
        const params = {
          page: this.currentPage - 1,
          size: this.pageSize
        }
        const response = await getDischargeList(params)
        if (response.data) {
          this.tableData = response.data.records.map(record => ({
            ...record,
            patientInfo: {
              ...record.patientInfo,
              age: this.calculateAge(record.patientInfo.idNumber)
            }
          }));
          this.total = response.data.total
        }
      } catch (error) {
        console.error('获取离院列表失败:', error)
        this.$message.error('获取离院列表失败')
      } finally {
        this.loading = false
      }
    },
    handleDateChange() {
      this.currentPage = 1
      this.fetchDischargeList()
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchDischargeList()
    },
    handleReset() {
      this.dateRange = []
      this.searchQuery = ''
      this.currentPage = 1
      this.fetchDischargeList()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchDischargeList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchDischargeList()
    },
    goToAssessment() {
      this.$router.push('/admission-assessment')
    },
    getStatusType(status) {
      return status === '待录入' || status === '待完成' || status === '草稿' ? 'warning' : 'success'
    },
    getOperationButton(row) {
      if (row.summaryStatus === '已提交' && row.handoverStatus === '已完成') {
        return {
          type: 'view',
          icon: 'el-icon-view',
          text: '查看'
        }
      } else {
        return {
          type: 'edit',
          icon: 'el-icon-edit',
          text: '编辑'
        }
      }
    },
    editDischarge(row) {
      this.$router.push({
        path: '/discharge-form',
        query: { id: row.id }
      })
    },
    viewDischargeDetails(row) {
      this.$router.push({
        path: '/discharge-form',
        query: { id: row.id, mode: 'view' }
      })
    },
    printDischarge(row) {
      this.selectedPatient = row
      this.showPrintModal = true
    },
    closePrintModal() {
      this.showPrintModal = false
    },
    actualPrint() {
      window.print()
      this.closePrintModal()
    },
    formatDate(date) {
      if (date) {
        const formattedDate = new Date(date).toLocaleDateString()
        return formattedDate.replace(/\//g, '-')
      }
      return ''
    }
  },
  computed: {
    pendingDischargeCount() {
      if (!this.tableData) return 0
      return this.tableData.filter(patient => 
        patient.summaryStatus === '待录入' || patient.summaryStatus === '草稿' || 
        patient.handoverStatus === '待完成'
      ).length
    }
  }
}
</script>

<style lang="less" scoped>
.assessment-container {
  background: #f0f4f7;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05);

  .custom-tabs {
    /deep/ .el-tabs__header {
      margin-bottom: 16px;
      border-bottom: none;
    }

    /deep/ .el-tabs__item {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      padding: 0 20px;
      transition: all 0.3s;
      
      &.is-active {
        color: #3a7d7c;
        font-weight: 600;
        background: rgba(58, 125, 124, 0.1);
        border-radius: 4px;
      }

      &:hover {
        color: #3a7d7c;
      }
    }
  }

  .tab-badge {
    margin-left: 6px;
    
    /deep/ .el-badge__content {
      height: 18px;
      line-height: 18px;
      padding: 0 6px;
      border: none;
      border-radius: 9px;
      font-weight: 600;
      font-size: 11px;
      background-color: #3a7d7c;
      color: #fff;
    }
  }

  .search-section {
    margin-bottom: 16px;
    background: #e8ecef;
    padding: 16px;
    border-radius: 6px;
    
    .search-form {
      display: flex;
      align-items: center;
      gap: 16px;

      .form-item {
        display: flex;
        align-items: center;

        .label {
          margin-right: 10px;
          color: #5a6e6c;
          font-weight: 500;
        }

        .search-input {
          width: 200px;

          /deep/ .el-input__inner {
            border-radius: 4px;
            height: 34px;
            line-height: 34px;
            border-color: #b0c4c3;
          }

          /deep/ .el-input-group__append {
            background: #3a7d7c;
            border-color: #3a7d7c;
            color: #fff;
            padding: 0 12px;
            
            &:hover {
              background: #5a9d9c;
              border-color: #5a9d9c;
            }
          }
        }
      }
    }
  }

  .notice {
    padding: 10px 16px;
    background: rgba(58, 125, 124, 0.1);
    border-radius: 4px;
    margin-bottom: 16px;

    p {
      color: #3a7d7c;
      font-size: 13px;
      margin: 0;
    }
  }

  .content-section {
    background: #fff;
    border-radius: 6px;
    padding: 16px;
    min-height: 400px;

    /deep/ .el-table {
      font-size: 13px;
      color: #3a4a49;
      
      th {
        background-color: #e8ecef;
        color: #3a4a49;
        font-weight: 600;
        padding: 12px 0;
      }

      td {
        padding: 12px;
      }

      .el-table__row:hover {
        background-color: #f5f7f8;
      }
    }

    .id-number {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }

    .el-tag {
      border-radius: 4px;
      padding: 0 12px;
      height: 24px;
      line-height: 24px;
    }

    .el-button--text {
      color: #3a7d7c;
      padding: 0 8px;
      
      &:hover {
        color: #5a9d9c;
      }

      i {
        margin-right: 4px;
      }
    }
  }

  .pagination-section {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

.print-dialog {
  /deep/ .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #f0f2f5;
  }

  .print-content {
    padding: 20px;

    .print-header {
      text-align: center;
      margin-bottom: 24px;

      h2 {
        font-size: 20px;
        margin-bottom: 8px;
      }

      h3 {
        font-size: 16px;
        font-weight: normal;
        color: #5a6e6c;
      }
    }

    .patient-info {
      margin-bottom: 24px;
      
      .info-row {
        display: flex;
        margin-bottom: 16px;
        
        .info-item {
          flex: 1;
          display: flex;
          align-items: center;
          
          label {
            color: #909399;
            width: 80px;
          }
        }
      }
    }

    .section {
      margin-bottom: 24px;

      .section-title {
        font-size: 15px;
        color: #3a4a49;
        font-weight: 600;
        margin-bottom: 12px;
        padding-left: 12px;
        border-left: 3px solid #3a7d7c;
      }

      .section-content {
        color: #5a6e6c;
        line-height: 1.8;
        padding: 0 12px;

        div {
          margin-bottom: 8px;
        }
      }
    }

    .doctor-info {
      display: flex;
      justify-content: flex-end;
      gap: 24px;
      margin-top: 32px;
      color: #5a6e6c;
    }
  }
}

@media print {
  .assessment-container {
    background: none;
    padding: 0;
    box-shadow: none;
  }

  .custom-tabs,
  .search-section,
  .notice,
  .pagination-section,
  .el-dialog__header,
  .el-dialog__footer {
    display: none !important;
  }

  .print-content {
    padding: 0 !important;
  }
}
</style> 