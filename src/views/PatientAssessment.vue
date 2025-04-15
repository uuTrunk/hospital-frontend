<template>
  <div class="assessment-container">
    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" type="card" class="custom-tabs">
      <el-tab-pane name="assessment">
        <span slot="label">
          入院评估
          <el-badge :value="pendingAssessmentCount" class="tab-badge" type="primary"></el-badge>
        </span>
        <!-- 入院评估内容 -->
        <div class="search-section">
          <div class="search-form">
            <div class="form-item">
              <span class="label">登记日期</span>
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
                v-model="searchText"
                placeholder="姓名/入院编号"
                class="search-input">
                <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
              </el-input>
            </div>
          </div>
        </div>
        <!-- 评估列表内容 -->
        <div class="content-section">
          <el-table
            v-loading="loading"
            :data="patientList"
            style="width: 100%"
            border>
            <el-table-column
              label="评估编号"
              width="80">
              <template slot-scope="scope">
                <div>{{ scope.row.assessmentId }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="patientName"
              label="患者姓名"
              width="120">
            </el-table-column>
            <el-table-column
              prop="patientGender"
              label="性别"
              width="80">
            </el-table-column>
            <el-table-column
              prop="idNumber"
              label="身份证号"
              width="200">
            </el-table-column>
            <el-table-column
              prop="registrationDate"
              label="登记时间"
              width="120">
            </el-table-column>
            <el-table-column
              prop="assessmentDate"
              label="评估日期"
              width="120">
            </el-table-column>
            <el-table-column
              prop="healthAssessmentStatus"
              label="健康评估状态"
              width="140">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.healthAssessmentStatus)">
                  {{ scope.row.healthAssessmentStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="careAssessmentStatus"
              label="照护评估状态"
              width="140">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.careAssessmentStatus)">
                  {{ scope.row.careAssessmentStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="100"
              fixed="right">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="getOperationButton(scope.row).type === 'edit' ? editAssessment(scope.row) : viewDetails(scope.row)">
                  <i :class="getOperationButton(scope.row).icon"></i>
                  {{ getOperationButton(scope.row).text }}
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
      
      <el-tab-pane name="discharge">
        <span slot="label" @click="goToDischarge">
          离院办理
          <el-badge :value="0" class="tab-badge" type="info"></el-badge>
        </span>
        <!-- 离院办理内容 -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getAdmissionList } from '@/api/admission'

export default {
  name: 'PatientAssessment',
  data() {
    return {
      activeTab: 'assessment',
      dateRange: [],
      searchText: '',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      patientList: [],
      total: 0
    }
  },
  methods: {
    async fetchPatientList() {
      try {
        this.loading = true
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          keyword: this.searchText,
          startDate: this.dateRange?.[0],
          endDate: this.dateRange?.[1]
        }
        const response = await getAdmissionList(params)
        
        console.log('完整响应:', response)
        
        // 检查响应格式
        if (response && response.data) {
          console.log('API返回数据:', response.data)
          // 如果后端直接返回数据数组
          if (Array.isArray(response.data)) {
            this.patientList = response.data
            this.total = response.data.length
          } 
          // 如果后端返回带有分页信息的对象
          else if (response.data.records) {
            this.patientList = response.data.records
            this.total = response.data.total
          }
          // 如果后端直接返回数据
          else {
            this.patientList = [response.data]
            this.total = 1
          }

          // 打印第一条记录的数据结构
          if (this.patientList.length > 0) {
            console.log('第一条记录数据结构:', this.patientList[0])
          }
        } else {
          console.error('响应数据格式不正确:', response)
          this.$message.error('获取数据失败：响应格式不正确')
          this.patientList = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取患者列表失败:', error)
        this.$message.error('获取患者列表失败，请稍后重试')
        this.patientList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    handleDateChange() {
      this.currentPage = 1
      this.fetchPatientList()
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchPatientList()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchPatientList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchPatientList()
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    getOperationButton(row) {
      if (row.healthAssessmentStatus === '完成' && row.careAssessmentStatus === '完成') {
        return {
          type: 'view',
          icon: 'el-icon-view',
          text: '查看'
        };
      } else {
        return {
          type: 'edit',
          icon: 'el-icon-edit',
          text: '编辑'
        };
      }
    },
    editAssessment(row) {
      this.$router.push({
        path: '/health-assessment',
        query: { assessmentId: row.assessmentId }
      });
    },
    viewDetails(row) {
      this.$router.push({
        path: '/admission-details',
        query: { id: row.assessmentId }
      })
    },
    getStatusType(status) {
      switch (status) {
        case '待评估':
          return 'warning'
        case '未完成':
          return 'info'
        case '完成':
          return 'success'
        default:
          return 'info'
      }
    },
    goToDischarge() {
      this.$router.push('/discharge');
    }
  },
  computed: {
    pendingAssessmentCount() {
      return this.patientList.filter(patient => 
        patient.healthAssessmentStatus === '待评估' || 
        patient.healthAssessmentStatus === '未完成' ||
        patient.careAssessmentStatus === '待评估' ||
        patient.careAssessmentStatus === '未完成'
      ).length
    }
  },
  created() {
    this.fetchPatientList()
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

        .el-date-editor {
          /deep/ .el-range-input {
            font-size: 13px;
            border-color: #b0c4c3;
          }
        }
      }
    }
  }

  .content-section {
    min-height: 400px;

    /deep/ .el-table {
      font-size: 13px;
      color: #3a4a49;
      border-radius: 6px;
      overflow: hidden;
      
      &::before {
        display: none;
      }
      
      th {
        background-color: #e8ecef;
        color: #3a4a49;
        font-weight: 600;
        text-align: center !important;
        height: 48px;
        padding: 6px 0;
      }

      td {
        color: #3a4a49;
        padding: 10px 0;
      }

      .cell {
        text-align: center;
      }

      .el-table__row {
        transition: all 0.3s;
        
        &:hover {
          background-color: #e8ecef;
          td {
            background-color: transparent;
          }
        }
      }
    }

    .status-cell {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;

      .el-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 5px 10px;
        min-width: 90px;
        border-radius: 4px;
        font-weight: 500;
        transition: all 0.3s;
        
        i {
          margin-right: 5px;
          font-size: 13px;
        }

        &.el-tag--warning {
          background: rgba(230, 162, 60, 0.1);
          border-color: rgba(230, 162, 60, 0.2);
          color: #e6a23c;
        }

        &.el-tag--danger {
          background: rgba(245, 108, 108, 0.1);
          border-color: rgba(245, 108, 108, 0.2);
          color: #f56c6c;
        }

        &.el-tag--success {
          background: rgba(103, 194, 58, 0.1);
          border-color: rgba(103, 194, 58, 0.2);
          color: #67c23a;
        }

        &.el-tag--info {
          background: rgba(144, 147, 153, 0.1);
          border-color: rgba(144, 147, 153, 0.2);
          color: #909399;
        }
      }
    }

    .el-button--text {
      font-size: 13px;
      padding: 0 6px;
      font-weight: 500;
      
      i {
        margin-right: 3px;
        font-size: 15px;
      }

      &:hover {
        color: #5a9d9c;
      }
    }
  }

  .pagination-section {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #f0f2f5;

    /deep/ .el-pagination {
      .btn-prev, .btn-next {
        border-radius: 4px;
        padding: 0 6px;
      }

      .el-pager li {
        border-radius: 4px;
        font-weight: 500;
        
        &.active {
          background-color: #3a7d7c;
          color: #fff;
        }
      }
    }
  }
}
</style> 