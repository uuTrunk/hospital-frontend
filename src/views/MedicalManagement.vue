<template>
  <div class="medical-management-container">
    <!-- 左侧患者选择区域 -->
    <div class="left-panel">
      <div class="patient-search">
        <el-input placeholder="姓名/入院编号" v-model="patientSearchKeyword" clearable>
          <el-button slot="append" icon="el-icon-search" @click="filterPatientList"></el-button>
        </el-input>
      </div>
      <ul class="patient-list">
        <li
          v-for="patient in filteredPatientList"
          :key="patient.orderId"
          class="patient-item"
          :class="{ active: selectedPatient && selectedPatient.orderId === patient.orderId }"
          @click="selectPatient(patient)"
        >
          <div class="patient-name">患者姓名:{{ patient.patientName }}</div>
          <div class="doctor-name">医生姓名:{{ patient.doctorName }}</div>
          <div class="order-type">医嘱类型:{{ patient.orderType }}</div>
          <div class="content">医嘱内容:{{ patient.content }}</div>
          <div class="dosage">剂量:{{ patient.dosage }}</div>
          <div class="medicalUsage">用法:{{ patient.medicalUsage }}</div>
          <div class="frequency">频率:{{ patient.frequency }}</div>
          <div class="validityPeriod">有效期:{{ patient.validityPeriod }}</div>
          <div class="stop-time">停止时间:{{ patient.stopTime }}</div>
        </li>
        <li v-if="filteredPatientList.length === 0" class="no-patient">无匹配患者</li>
      </ul>

      <!-- 新增：AI交互区域 -->
      <div class="ai-section" v-if="smartManagementEnabled">
        <el-card class="ai-card" shadow="hover">
          <div slot="header">AI医嘱建议</div>
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入问题或医嘱内容"
            v-model="aiMessage"
            style="margin-bottom: 10px;"
          ></el-input>
          <el-button type="primary" @click="sendToAI" icon="el-icon-s-promotion">发送请求</el-button>
          <div v-if="aiResponse" class="ai-response" style="margin-top: 15px;">
            <strong>AI回复:</strong> {{ aiResponse }}
          </div>
        </el-card>
      </div>
    </div>

    <!-- 右侧医嘱管理区域 -->
    <div class="right-panel">
      <div v-if="selectedPatient">
        <!-- 顶部患者信息栏 -->
        <div class="patient-info-bar">
          <div class="avatar">
            <span>{{selectedPatient.name ? selectedPatient.name.substring(0,1) : ''}}</span>
          </div>
<!--          <div class="basic-info">-->
<!--            <div>{{selectedPatient.name}} {{selectedPatient.gender}} {{selectedPatient.age}}岁</div>-->
<!--            <div>{{selectedPatient.roomNumber}}</div>-->
<!--          </div>-->
          <div class="nursing-info">
            <div>医嘱状态 <span class="nursing-level">{{selectedPatient.orderStatus}}</span></div>
          </div>
        </div>

        <!-- 功能按钮区 -->
        <div class="action-bar">
<!--          <div class="left-actions">-->

<!--            <button class="tab-btn" :class="{active: activeTab === 'temp'}" @click="switchTab('temp')">-->
<!--              <i class="el-icon-document"></i> 临时医嘱-->
<!--            </button>-->
<!--            <button class="tab-btn" :class="{active: activeTab === 'long'}" @click="switchTab('long')">-->
<!--              <i class="el-icon-document-copy"></i> 长期医嘱-->
<!--            </button>-->
<!--          </div>-->
          <div class="right-actions">
            <el-button icon="el-icon-printer" @click="doPrintEmptyOrder">打印空白医嘱单</el-button>
            <el-button icon="el-icon-printer" @click="printCurrentOrderList">批量打印</el-button>
            <el-button type="primary" icon="el-icon-plus" @click="createNewOrder">新开</el-button>
          </div>
        </div>

        <!-- 智能管理开关 -->
        <div class="smart-management">
          <el-checkbox v-model="smartManagementEnabled">AI智能建议</el-checkbox>
          <!-- 智能管理提示 -->
          <div class="smart-tips" v-if="smartManagementEnabled">
            AI智能建议已开启...
          </div>
        </div>

        <!-- 医嘱列表 -->
        <div class="orders-table">
          <el-table :data="currentOrders" style="width: 100%" ref="ordersTable">
            <el-table-column prop="orderId" label="医嘱Id" width="150"></el-table-column>
<!--            <el-table-column prop="patientId" label="患者Id" ></el-table-column>-->
<!--            <el-table-column prop="doctorId" label="医生Id" ></el-table-column>-->
            <el-table-column prop="content" label="内容"></el-table-column>
            <el-table-column prop="dosage" label="单次剂量" width="120"></el-table-column>
            <el-table-column prop="medicalUsage" label="用法" width="150"></el-table-column>
            <el-table-column prop="frequency" label="频率" width="80" v-if="activeTab === 'temp'"></el-table-column>
<!--            <el-table-column prop="total" label="总量" width="80" v-if="activeTab === 'temp'"></el-table-column>-->
            <el-table-column prop="startingTime" label="开始时间" width="150" v-if="activeTab === 'long'"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-close"
                  @click="stopOrder(scope.row)"
                  style="color: #F56C6C;"
                >停止</el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-printer"
                  @click="printOrder(scope.row)"
                >打印</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-bar">
          <el-pagination
            style="width: 100%; text-align: right;"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          >
          </el-pagination>
        </div>
      </div>
      <div v-else class="no-patient-selected">
        请先在左侧选择患者
      </div>
    </div>
  </div>
</template>

<script>
// 假设 OrderDialog 组件已存在且功能完善
import OrderDialog from '@/components/OrderDialog.vue' 
// 修改说明：添加axios请求获取真实数据并处理分页
import axios from 'axios';

export default {
  name: 'MedicalManagement', // Keep the name consistent with routing
  components: {
    // eslint-disable-next-line vue/no-unused-components
    OrderDialog
  },
  data() {
    return {
      patientSearchKeyword: '', // 左侧患者搜索关键字
      allPatientList: [], // 所有患者列表（模拟）
      filteredPatientList: [], // 过滤后的患者列表
      selectedPatient: null, // 当前选中的患者对象

      activeTab: 'temp', // 右侧医嘱类型切换: temp or long
      smartManagementEnabled: false, // 智能管理开关

      temporaryOrders: [], // 选中患者的临时医嘱
      longTermOrders: [], // 选中患者的长期医嘱
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },

      // 对话框状态
      showOrderDialog: false,
      showStopDialog: false,
      showPrintDialog: false,
      isEdit: false,
      editingOrder: null, // 当前正在编辑或停止的医嘱
      stopTime: '', // 停止时间选择器
      printOrders: [], // 待打印的医嘱列表
      printOrderType: 'temp', // 打印预览时判断是临时还是长期
      showEmptyPrintDialog: false, // 控制空白打印对话框
      includePatientInfoOnEmpty: true, // 空白打印时是否包含患者信息
      startPrintRow: 1, // For the 'start printing from row' input

      aiMessage: '', // 新增：用户输入的AI请求内容
      aiResponse: ''  // 新增：AI返回的回复内容
    };
  },
  computed: {
    // 根据activeTab动态返回当前应显示的医嘱列表
    currentOrders() {
      const orders = this.activeTab === 'temp' ? this.temporaryOrders : this.longTermOrders;
      // 模拟分页
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return orders.slice(start, end);
    },
    // 计算当前医嘱列表的总数（用于分页）
    currentTotalOrders() {
      return this.activeTab === 'temp' ? this.temporaryOrders.length : this.longTermOrders.length;
    }
  },
  watch: {
    // 监听 currentTotalOrders 的变化，更新分页总数
    currentTotalOrders(newTotal) {
      this.pagination.total = newTotal;
    },
    // 当选中的患者变化时，如果之前没有患者，默认勾选包含信息
    selectedPatient(newPatient, oldPatient) {
      if (newPatient && !oldPatient) {
        this.includePatientInfoOnEmpty = true;
      } else if (!newPatient) {
        this.includePatientInfoOnEmpty = false; // 没有选中患者时禁用并取消勾选
      }
    },
  },
  created() {
    this.fetchAllPatients(); // 初始化时获取所有患者列表
  },
  methods: {
    // --- 左侧患者列表相关方法 ---
    async fetchAllPatients() {
      try {
        const res = await axios.get('/api/medical-order/list', { params: { page: 100, pageSize: 100 } });
        // console.log('res',res)
        // 确保返回的list存在，否则设为空数组
        this.allPatientList = res.data.data.list;
        console.log('allPatientList:', this.allPatientList)
        // for(let i = 0; i < this.allPatientList.length; i++) {
        //   console.log('Patient:', this.allPatientList[i])
        // }
      } catch (e) {
        this.$message.error(e);
        // 异常时也确保allPatientList是空数组
        this.allPatientList = [];
      }
      this.fetchAllPatients = this.allPatientList
    },
    filterPatientList() {
      const keyword = this.patientSearchKeyword.trim().toLowerCase();
      // console.log('Search keyword:', keyword);
      // console.log('All patients:', this.allPatientList)
      // 若allPatientList未初始化，直接返回空列表
      if (!Array.isArray(this.allPatientList)) {
        this.filteredPatientList = [];
        return;
      }
      if (!keyword) {
        this.filteredPatientList = this.allPatientList;
      } else {
        const res = axios.get('/api/medical-order/list', { params: { patientName: keyword, page: 100, pageSize: 100 } });
        console.log('res',res)
        this.filteredPatientList = res.data.data.list
      }
      console.log('Filtered patients:', this.filteredPatientList)
      for(let i = 0; i < this.filteredPatientList.length; i++)
        console.log('Patient:', this.filteredPatientList[i])
    },
    doPrint() {
      console.log('执行打印操作:', this.printOrders);
      // 实现打印逻辑（如调用打印API或生成PDF）
    },

    // 打印空白医嘱单
    doPrintEmptyOrder() {
      console.log('打印空白医嘱单');
      this.$message.success('打印空白医嘱单');
      // 实现空白单打印逻辑
    },
    // 处理医嘱表单提交
    handleOrderSubmit(orderData) {
      console.log('提交的医嘱数据:', orderData);
      if (this.isEdit) {
        this.updateOrder(orderData); // 调用更新方法
      } else {
        // 新增医嘱逻辑（可能需要调用createNewOrder）
      }
      this.showOrderDialog = false; // 关闭对话框
    },
    printCurrentOrderList() {
      this.$message.success('打印当前医嘱单');
      this.printOrders = this.currentOrders; // 填充打印数据
      this.printOrderType = this.activeTab;
      this.showPrintDialog = true;
    },
    selectPatient(patient) {
      // if (this.selectedPatient && this.selectedPatient.id === patient.id) return; // Avoid re-fetching if already selected
      console.log('Selected patient:', patient);
      this.selectedPatient = patient;
      this.activeTab = 'temp'; // 默认显示临时医嘱
      this.pagination.currentPage = 1; // 重置分页
      this.fetchOrdersForSelectedPatient(); // 获取选中患者的医嘱
    },

    // --- 右侧医嘱管理相关方法 ---
    async fetchOrdersForSelectedPatient() {
      if (!this.selectedPatient) return;
      const params = {
        patientId: this.selectedPatient.id,
        page: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        orderType: this.activeTab === 'temp' ? '临时' : '长期' // 根据标签类型传递参数
      };
      try {
        const res = await axios.get('/api/medical-order/list', { params });
        if (this.activeTab === 'temp') {
          this.temporaryOrders = res.data.data.list;
        } else {
          this.longTermOrders = res.data.data.list;
        }
        this.pagination.total = res.data.data.total;
      } catch (e) {
        this.$message.error('医嘱列表加载失败');
      }
    },
    // 新增分页事件处理
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.fetchOrdersForSelectedPatient();
    },
    handleCurrentChange(page) {
      this.pagination.currentPage = page;
      this.fetchOrdersForSelectedPatient();
    },
    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.pagination.currentPage = 1; // 切换tab时重置分页
      this.pagination.total = this.currentTotalOrders; // 更新分页总数
    },
    async createNewOrder() {
      if (!this.selectedPatient) {
        this.$message.warning('请先在左侧选择患者');
        return;
      }
      console.log(`Navigating to create new ${this.activeTab} order for patient: ${this.selectedPatient.patientId}`);
      // Navigate to the detail page, passing patientId and order type
      this.$router.push({
        name: 'MedicalOrderDetail',
        params: {patientId: this.selectedPatient.patientId, doctorId: this.selectedPatient.doctorId, orderType: this.selectedPatient.orderType},
        query: {type: this.activeTab} // Pass type as query parameter
      });
    },
    async updateOrder(order) {
      try {
        await axios.put('/api/medical-order/update', {
          orderId: order.orderId,
          content: order.content,
          dosage: order.dosage,
          usage: order.usage,
          frequency: order.frequency
        });
        this.$message.success('医嘱修改成功');
        this.fetchOrdersForSelectedPatient();
      } catch (e) {
        this.$message.error('修改失败');
      }
    },
    async stopOrder(order) {
      // console.log('停止医嘱:', order)
      this.editingOrder = {...order};
      this.stopTime = this.activeTab === 'long' ? (order.stopTime || '') : ''; // 初始化停止时间
      this.showStopDialog = true;
      this.confirmStopOrder();
    },
    async confirmStopOrder() {
      try {
        console.log('停止医嘱:', this.editingOrder)
        // let data = {orderId: this.editingOrder.orderId, doctorName: this.editingOrder.doctorName};
        // if (this.activeTab === 'long') {
        //   data.stopTime = this.stopTime;
        // }
        // console.log('停止医嘱数据:', data)
        await axios.delete('/api/medical-order/delete', {params: {orderId: this.editingOrder.orderId, doctorName: this.editingOrder.doctorName}});
        this.$message.success('医嘱作废成功');
        this.showStopDialog = false;
        this.fetchOrdersForSelectedPatient();
      } catch (e) {
        this.$message.error('作废失败');
      }
    },
    async fetchOrderDetail(orderId) {
      try {
        const res = await axios.get('/api/medical-order/detail', {params: {orderId}});
        return res.data;
      } catch (e) {
        this.$message.error('获取医嘱详情失败');
      }
    },
    async printOrder(order) {
      try {
        await axios.get('/api/medical-order/print', {params: {orderIds: order.orderId}});
        this.$message.success('打印任务已生成');
      } catch (e) {
        this.$message.error('打印失败');
      }
    },
    // 新增：调用AI接口的方法
    async sendToAI() {
      if (!this.aiMessage.trim()) {
        this.$message.warning('请输入需要咨询的内容');
        return;
      }
      try {
        const res = await axios.get('/api/medical-order/chat', {
          params: {
            message: this.aiMessage
          }
        });
        this.aiResponse = res.data.data; // 根据接口返回结构调整
      } catch (error) {
        this.$message.error('调用AI接口失败，请重试');
        console.error('AI接口调用失败:', error);
      }
    }
  }
}
    
</script>

<style scoped>
.medical-management-container {
  display: flex;
  height: calc(100vh - 100px); /* Adjust height based on your layout header/footer */
  background-color: #f5f6fa;
}

/* 左侧面板 */
.left-panel {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.patient-search {
  padding: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.patient-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.patient-item {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.patient-item:hover {
  background-color: #f5f9ff;
}

.patient-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
  padding-right: 12px; /* Adjust padding for border */
}

.patient-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.patient-details {
  font-size: 12px;
  color: #888;
}

.no-patient {
  padding: 20px;
  text-align: center;
  color: #999;
}

/* 右侧面板 */
.right-panel {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
  margin: 15px; /* Add some margin around the right panel */
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.no-patient-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

/* 顶部患者信息栏 (复用之前的样式) */
.patient-info-bar {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}
.avatar {
  width: 48px; height: 48px; border-radius: 50%; background-color: #409eff;
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-right: 15px; flex-shrink: 0;
}
.basic-info, .nursing-info { margin-right: 30px; line-height: 1.6; }
.nursing-level { background-color: #e6f7ff; color: #1890ff; padding: 2px 6px; border-radius: 2px; font-size: 12px; }

/* 功能按钮区 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.left-actions {
  display: flex;
  gap: 0; /* Remove gap if using buttons directly */
}
/* 使用 button 模拟 Tab */
.tab-btn {
  padding: 9px 15px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
  border-radius: 0; /* Remove individual radius */
}
.tab-btn:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.tab-btn:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-left-width: 0; /* Avoid double border */
}
.tab-btn.active {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
.tab-btn i {
  margin-right: 5px;
}
.right-actions {
  display: flex;
  gap: 10px;
}

/* 智能管理 */
.smart-management {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.smart-tips {
    background-color: #fdf6ec;
    color: #E6A23C;
    padding: 8px 15px;
    border-radius: 4px;
    font-size: 13px;
}

/* 医嘱表格 */
.orders-table {
  margin-bottom: 20px;
}

/* 分页和批量操作 */
.pagination-bar {
    margin-top: 20px;
    height: 32px; /* Ensure consistent height */
}

.pagination-bar .el-pagination {
    float: right;
}

/* 对话框样式微调 */
.stop-order-content {
  padding: 10px 20px;
}
.stop-order-content p {
    margin: 10px 0;
}

/* 打印预览样式 (复用之前的样式) */
.print-preview { padding: 20px; }
.preview-header { text-align: center; margin-bottom: 20px; }
.preview-header h2 { margin-bottom: 20px; }
.patient-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
.preview-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.preview-table th, .preview-table td { border: 1px solid #dcdfe6; padding: 8px; text-align: left; font-size: 12px; }
.preview-table th { background-color: #f5f7fa; text-align: center; }
.preview-footer { display: flex; justify-content: space-between; margin-top: 30px; }

/* 空白打印对话框特定样式 */
.empty-print-dialog .el-dialog__body {
  padding: 15px 25px; 
}

.empty-print-preview {
  border: 1px solid #ccc; /* 添加边框以便预览 */
  padding: 15px;
  background-color: #fff; /* 确保背景为白色 */
}

.empty-print-header {
  text-align: center;
  position: relative;
  margin-bottom: 15px;
  border-bottom: 2px solid #000; /* 加粗下划线 */
  padding-bottom: 10px;
}

.institution-name {
  font-size: 18px; 
  font-weight: bold;
}

.empty-print-header h1 {
  font-size: 24px;
  margin: 5px 0;
  font-weight: bold;
}

.page-number {
  position: absolute;
  top: 5px;
  right: 0;
  font-size: 14px;
}

.patient-info-print {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 5px;
  font-size: 14px;
}

.patient-info-print span {
  margin-right: 15px;
  min-width: 150px; /* 给定最小宽度 */
}

.empty-print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.empty-print-table th,
.empty-print-table td {
  border: 1px solid #666; /* 使用更深的边框 */
  height: 38px; /* 控制行高 */
  text-align: center;
  padding: 2px 4px;
}

.empty-print-table th {
  font-weight: bold;
}

.empty-print-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-options {
    display: flex;
    align-items: center;
}

/* 打印预览表格样式微调 */
.preview-table th, 
.preview-table td {
  border: 1px solid #666; /* 统一边框颜色 */
  padding: 8px; 
  font-size: 13px; /* 稍微调大字体 */
}

/* Styles for the filled print preview dialog */
.print-dialog .el-dialog__body {
    padding: 15px 25px;
}

.print-preview { /* Common preview styles */
  border: 1px solid #ccc; 
  padding: 15px;
  background-color: #fff; 
}

.preview-header { /* Common header styles */
  text-align: center;
  position: relative;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc; /* Lighter line than empty print */
  padding-bottom: 10px;
}

.institution-name { /* Common institution name style */
  font-size: 18px; 
  font-weight: bold;
}

.page-number { /* Common page number style */
  position: absolute;
  top: 5px;
  right: 0;
  font-size: 14px;
}

.patient-info-print { /* Common patient info style */
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 5px;
  font-size: 14px;
}

.patient-info-print span {
  margin-right: 15px;
  min-width: 150px;
}

/* Specific table styles for filled orders */
.print-filled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed; /* Helps with column width */
}

.print-filled-table th,
.print-filled-table td {
  border: 1px solid #666;
  padding: 8px 6px; /* Adjust padding */
  text-align: center; 
  vertical-align: top;
  word-wrap: break-word;
}

.print-filled-table th {
  font-weight: bold;
}
.print-filled-table td:nth-child(2) { /* Order content column */
    text-align: left;
    white-space: pre-wrap; /* Respect newlines in content */
}
.print-filled-table .empty-row td {
    height: 30px; /* Adjust height for empty rows */
    border: 1px dotted #eee; 
}

.print-filled-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-print-options {
    display: flex;
    align-items: center;
    gap: 5px; /* Add gap */
}

.footer-print-options span {
  font-size: 14px;
}

/* 新增样式：AI交互区域 */
.ai-section {
  margin: 20px 0;
}

.ai-card {
  border-radius: 4px;
}

.ai-response {
  background-color: #f0f9eb;
  padding: 10px;
  border-radius: 3px;
  color: #55a532;
  font-style: italic;
}
</style>