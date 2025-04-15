<template>
  <div class="assessment-container">
    <div class="search-section">
      <div class="search-form">
        <div class="form-item">
          <span class="label">建档日期</span>
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
            <el-button slot="append" icon="el-icon-search" @click="searchPatients"></el-button>
          </el-input>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-items">
        <el-tag size="medium">入住长者 {{ totalPatients }}</el-tag>
        <el-tag type="warning" size="medium">待建档 {{ pendingRecords }}</el-tag>
      </div>
      <el-button 
        type="text" 
        icon="el-icon-time"
        @click="viewHistory">
        历史档案
      </el-button>
    </div>

    <div class="content-section">
      <el-table
        v-loading="loading"
        :data="patients"
        style="width: 100%"
        border>
        <el-table-column
          label="姓名/身份证"
          width="200">
          <template slot-scope="scope">
            <div class="patient-info">
              <el-avatar size="small">{{ scope.row.name.charAt(0) }}</el-avatar>
              <div class="patient-detail">
                <div>{{ scope.row.name }}</div>
                <div class="id-number">{{ scope.row.idNumber }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="gender"
          label="性别"
          width="80">
        </el-table-column>
        <el-table-column
          prop="age"
          label="年龄"
          width="80">
        </el-table-column>
        <el-table-column
          prop="admissionNo"
          label="入院编号"
          width="120">
        </el-table-column>
        <el-table-column
          prop="admissionDate"
          label="入院日期"
          width="120">
        </el-table-column>
        <el-table-column
          prop="roomNumber"
          label="房间床位"
          width="120">
        </el-table-column>
        <el-table-column
          label="建档时间"
          width="140">
          <template slot-scope="scope">
            <el-tag :type="scope.row.hasRecord ? 'success' : 'warning'" size="medium">
              {{ scope.row.recordTime || '待完善' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="doctor"
          label="建档医生"
          width="120">
          <template slot-scope="scope">
            {{ scope.row.doctor || '-' }}
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
              @click="viewRecord(scope.row)">
              <i class="el-icon-view"></i>
              查看
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
  </div>
</template>

<script>
export default {
  name: 'HealthRecordView',
  data() {
    return {
      loading: false,
      searchText: '',
      dateRange: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      patients: [
        {
          id: 1,
          name: '李大哥',
          idNumber: '310106194805162428',
          gender: '男',
          age: 78,
          admissionNo: '210124',
          admissionDate: '2024-05-22',
          roomNumber: '2022-01',
          hasRecord: false,
          recordTime: null,
          doctor: null
        },
        {
          id: 2,
          name: '王大娘',
          idNumber: '310106194805162428',
          gender: '女',
          age: 98,
          admissionNo: '210124',
          admissionDate: '2024-05-18',
          roomNumber: '2024-02',
          hasRecord: true,
          recordTime: '2024-05-18 12:18',
          doctor: '张医生'
        },
        {
          id: 3,
          name: '宋老博',
          idNumber: '310106194805162428',
          gender: '男',
          age: 89,
          admissionNo: '210124',
          admissionDate: '2024-05-12',
          roomNumber: '3000-02',
          hasRecord: true,
          recordTime: '2024-05-18 12:18',
          doctor: 'XXXX'
        }
      ]
    }
  },
  computed: {
    totalPatients() {
      return this.patients.length;
    },
    pendingRecords() {
      return this.patients.filter(p => !p.hasRecord).length;
    }
  },
  methods: {
    handleDateChange() {
      this.currentPage = 1;
      this.searchPatients();
    },
    searchPatients() {
      // 实现搜索逻辑
      console.log('搜索长者:', this.searchText, this.dateRange);
    },
    viewHistory() {
      // 查看历史档案
      console.log('查看历史档案');
    },
    viewRecord(patient) {
      if (patient.hasRecord) {
        // 如果已有档案，跳转到查看页面，默认显示医嘱管理标签
        this.$router.push({
          path: `/health-record/create/${patient.id}`,
          query: { tab: 'medical' }
        });
      } else {
        // 如果未建档，跳转到创建页面
        this.$router.push(`/health-record/create/${patient.id}`);
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.searchPatients();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.searchPatients();
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

  .stats-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 16px;

    .stat-items {
      display: flex;
      gap: 16px;

      .el-tag {
        padding: 0 16px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
      }
    }

    .el-button {
      font-size: 14px;
      color: #3a7d7c;

      &:hover {
        color: #5a9d9c;
      }

      i {
        margin-right: 4px;
      }
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

    .patient-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .patient-detail {
        text-align: left;

        .id-number {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
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

@media print {
  .assessment-container {
    background: none;
    padding: 0;
    box-shadow: none;
  }

  .search-section,
  .stats-section,
  .pagination-section {
    display: none !important;
  }
}
</style> 