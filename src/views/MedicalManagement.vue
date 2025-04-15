<template>
  <div class="medical-management-container">
    <!-- 左侧患者选择区域 -->
    <div class="left-panel">
      <div class="patient-search">
        <el-input placeholder="姓名/入院编号" v-model="patientSearchKeyword" clearable @input="filterPatientList">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </div>
      <ul class="patient-list">
        <li
          v-for="patient in filteredPatientList"
          :key="patient.id"
          class="patient-item"
          :class="{ active: selectedPatient && selectedPatient.id === patient.id }"
          @click="selectPatient(patient)"
        >
          <div class="patient-name">{{ patient.name }}</div>
          <div class="patient-details">{{ patient.roomNumber }} | {{ patient.admissionId }}</div>
        </li>
        <li v-if="filteredPatientList.length === 0" class="no-patient">无匹配患者</li>
      </ul>
    </div>

    <!-- 右侧医嘱管理区域 -->
    <div class="right-panel">
      <div v-if="selectedPatient">
        <!-- 顶部患者信息栏 -->
        <div class="patient-info-bar">
          <div class="avatar">
            <span>{{selectedPatient.name ? selectedPatient.name.substring(0,1) : ''}}</span>
          </div>
          <div class="basic-info">
            <div>{{selectedPatient.name}} {{selectedPatient.gender}} {{selectedPatient.age}}岁</div>
            <div>{{selectedPatient.roomNumber}}</div>
          </div>
          <div class="nursing-info">
            <div>入院日期 {{selectedPatient.admissionDate}}</div>
            <div>护理等级 <span class="nursing-level">{{selectedPatient.nursingLevel}}</span></div>
          </div>
        </div>

        <!-- 功能按钮区 -->
        <div class="action-bar">
          <div class="left-actions">
            <button class="tab-btn" :class="{active: activeTab === 'temp'}" @click="switchTab('temp')">
              <i class="el-icon-document"></i> 临时医嘱
            </button>
            <button class="tab-btn" :class="{active: activeTab === 'long'}" @click="switchTab('long')">
              <i class="el-icon-document-copy"></i> 长期医嘱
            </button>
          </div>
          <div class="right-actions">
            <el-button icon="el-icon-printer" @click="printEmptyOrder">打印空白医嘱单</el-button>
            <el-button icon="el-icon-printer" @click="printCurrentOrderList">批量打印</el-button>
            <el-button type="primary" icon="el-icon-plus" @click="createNewOrder">新开</el-button>
          </div>
        </div>

        <!-- 智能管理开关 -->
        <div class="smart-management">
          <el-checkbox v-model="smartManagementEnabled">智能管理</el-checkbox>
          <!-- 智能管理提示 -->
          <div class="smart-tips" v-if="smartManagementEnabled">
            智能管理模式已开启...
          </div>
        </div>

        <!-- 医嘱列表 -->
        <div class="orders-table">
          <el-table :data="currentOrders" style="width: 100%" ref="ordersTable">
            <el-table-column prop="time" label="时间" width="150"></el-table-column>
            <el-table-column prop="group" label="组" width="80"></el-table-column>
            <el-table-column prop="content" label="内容"></el-table-column>
            <el-table-column prop="dosage" label="单次剂量" width="120"></el-table-column>
            <el-table-column prop="usage" label="用法/频次/嘱托" width="200"></el-table-column>
            <el-table-column prop="days" label="天数" width="80" v-if="activeTab === 'temp'"></el-table-column>
            <el-table-column prop="total" label="总量" width="80" v-if="activeTab === 'temp'"></el-table-column>
            <el-table-column prop="stopTime" label="停止时间" width="150" v-if="activeTab === 'long'"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="editOrder(scope.row)"
                >编辑</el-button>
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

      <!-- 对话框 -->
      <order-dialog
        :visible.sync="showOrderDialog"
        :is-edit="isEdit"
        :order-data="editingOrder"
        :order-type="activeTab"  
        @submit="handleOrderSubmit"
      />

      <el-dialog title="停止医嘱" :visible.sync="showStopDialog" width="400px" v-if="editingOrder">
        <div class="stop-order-content">
          <p>确定要停止以下医嘱吗？</p>
          <p><strong>医嘱内容:</strong> {{ editingOrder.content || '' }}</p>
          <div class="stop-time" v-if="activeTab === 'long'">
            <span style="margin-right: 10px;">停止时间:</span>
            <el-date-picker
              v-model="stopTime"
              type="datetime"
              placeholder="选择停止时间"
              size="small"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm">
            </el-date-picker>
          </div>
          <div v-else>
            <p style="color: #E6A23C; margin-top: 10px;">临时医嘱将被直接删除。</p>
          </div>
        </div>
        <div slot="footer">
          <el-button @click="showStopDialog = false" size="small">取 消</el-button>
          <el-button type="primary" @click="confirmStopOrder" size="small">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog
        :title="printOrderType === 'temp' ? '临时医嘱单' : '长期医嘱单'" 
        :visible.sync="showPrintDialog"
        width="85%" 
        top="5vh"
        class="print-dialog">
         <div class="print-preview" ref="regularPrintPreviewArea">
            <div class="preview-header">
                <div class="institution-name">上海 XX 机构</div>
                <div class="page-number">第 ___ 页</div>
            </div>
            <div class="patient-info-print" v-if="selectedPatient">
                <span>姓名: {{ selectedPatient.name }}</span>
                <span>区域: {{ selectedPatient.area || '生活区' }}</span> 
                <span>房间床位: {{ selectedPatient.roomNumber }}</span>
                <span>入院号: {{ selectedPatient.admissionId }}</span>
            </div>
            <table class="preview-table print-filled-table">
            <thead>
                <tr>
                    <th style="width: 15%;">日期时间</th>
                    <th style="width: 40%;">{{ printOrderType === 'temp' ? '临时医嘱' : '长期医嘱' }}</th>
                    <th style="width: 10%;">医生签名</th>
                    <th style="width: 15%;">执行时间</th>
                    <th style="width: 10%;">护士签名</th>
                    <th style="width: 10%;">备注</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(order, index) in printOrders" :key="index">
                    <td>{{ order.time || '' }}</td>
                    <td style="text-align: left; white-space: pre-wrap;">{{ order.content || '' }} {{ order.dosage || '' }} {{ order.usage || '' }}</td> 
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                 <tr v-for="i in Math.max(0, 10 - printOrders.length)" :key="'empty-'+i" class="empty-row">
                     <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td>
                 </tr>
            </tbody>
            </table>
        </div>
        <div slot="footer" class="dialog-footer print-filled-footer">
           <el-button @click="showPrintDialog = false" size="small">关 闭</el-button>
            <div class="footer-print-options">
                <span>从纸张第</span>
                <el-input-number v-model="startPrintRow" controls-position="right" :min="1" size="mini" style="width: 70px; margin: 0 5px;"></el-input-number>
                <span>行开始打印</span>
                <el-button type="primary" @click="doPrint" size="small" style="margin-left: 15px;">打 印</el-button>
            </div>
        </div>
      </el-dialog>

      <!-- 新增：打印空白医嘱单对话框 -->
      <el-dialog
        title="打印空白医嘱单预览"
        :visible.sync="showEmptyPrintDialog"
        width="85%"
        top="5vh" 
        class="empty-print-dialog"
      >
        <div class="empty-print-preview" ref="emptyPrintPreviewArea">
          <div class="empty-print-header">
            <div class="institution-name">上海 XX 机构</div>
            <h1>长期医嘱单</h1> 
            <div class="page-number">第 ___ 页</div>
          </div>
          <div class="patient-info-print" v-if="includePatientInfoOnEmpty && selectedPatient">
            <span>姓名: {{ selectedPatient.name }}</span>
            <span>区域: {{ selectedPatient.area || '生活区' }}</span> 
            <span>房间床位: {{ selectedPatient.roomNumber }}</span>
            <span>入院号: {{ selectedPatient.admissionId }}</span>
          </div><div class="patient-info-print placeholder" v-else>
             <!-- 占位符或者提示 -->
             <span>姓名: _________</span>
             <span>区域: _________</span> 
             <span>房间床位: _________</span>
             <span>入院号: _________</span>
          </div>
          <table class="empty-print-table">
            <thead>
              <tr>
                <th style="width: 10%;">开始时间</th>
                <th style="width: 10%;">医生签名</th>
                <th style="width: 10%;">护士签名</th>
                <th style="width: 35%;">长期医嘱</th>
                <th style="width: 10%;">停止时间</th>
                <th style="width: 10%;">医生签名</th>
                <th style="width: 10%;">护士签名</th>
              </tr>
            </thead>
            <tbody>
              <!-- 生成多行空行 -->
              <tr v-for="i in 12" :key="i">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div slot="footer" class="dialog-footer empty-print-footer">
          <el-button @click="showEmptyPrintDialog = false" size="small">关 闭</el-button>
          <div class="footer-options">
            <el-checkbox v-model="includePatientInfoOnEmpty" :disabled="!selectedPatient">
              包含当前长者信息
            </el-checkbox>
            <el-button type="primary" @click="doPrintEmptyOrder" size="small" style="margin-left: 15px;">
              打 印
            </el-button>
          </div>
        </div>
      </el-dialog>

    </div>
  </div>
</template>

<script>
// 假设 OrderDialog 组件已存在且功能完善
import OrderDialog from '@/components/OrderDialog.vue' 

export default {
  name: 'MedicalManagement', // Keep the name consistent with routing
  components: {
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
    fetchAllPatients() {
      console.log('Fetching all patients...');
      // 模拟API获取所有患者基础信息
      this.allPatientList = [
        { id: '1', name: '李大爷', roomNumber: '2201-01', admissionId: '122455478', gender: '男', age: 86, admissionDate: '2021-02', nursingLevel: '二级护理' },
        { id: '2', name: '王阿姨', roomNumber: '2201-02', admissionId: '122455479', gender: '女', age: 75, admissionDate: '2021-03', nursingLevel: '一级护理' },
        { id: '3', name: '张三', roomNumber: '2202-01', admissionId: '122455480', gender: '男', age: 68, admissionDate: '2021-04', nursingLevel: '三级护理' },
        { id: '4', name: '刘能', roomNumber: '2202-02', admissionId: '122455481', gender: '男', age: 72, admissionDate: '2021-05', nursingLevel: '特级护理' }
      ];
      this.filterPatientList(); // 初始化显示过滤后的列表
    },
    filterPatientList() {
      const keyword = this.patientSearchKeyword.trim().toLowerCase();
      if (!keyword) {
        this.filteredPatientList = [...this.allPatientList];
      } else {
        this.filteredPatientList = this.allPatientList.filter(p => 
          p.name.toLowerCase().includes(keyword) || p.admissionId.includes(keyword)
        );
      }
    },
    selectPatient(patient) {
      if (this.selectedPatient && this.selectedPatient.id === patient.id) return; // Avoid re-fetching if already selected
      console.log('Selected patient:', patient);
      this.selectedPatient = patient;
      this.activeTab = 'temp'; // 默认显示临时医嘱
      this.pagination.currentPage = 1; // 重置分页
      this.fetchOrdersForSelectedPatient(); // 获取选中患者的医嘱
    },

    // --- 右侧医嘱管理相关方法 ---
    fetchOrdersForSelectedPatient() {
      if (!this.selectedPatient) return;
      console.log(`Fetching orders for patient ID: ${this.selectedPatient.id}`);
      // 模拟API获取选中患者的医嘱
      // --- Temp Orders Example ---
      const temp = [
        { time: '05-12 09:10', group: '1', content: '阿莫西林胶囊\n0.25g*20粒/盒', dosage: '0.5g', usage: '口服(po), 餐前(ac), 禁止饮酒', days: '2', total: '2盒' },
        { time: '05-12 09:15', group: '', content: '行总管置换术一次', dosage: '', usage: '', days: '', total: '' },
        { time: '05-13 10:00', group: '2', content: '0.9%葡萄糖注射液\n500ml*1瓶/盒', dosage: '500ml', usage: '静脉滴注(ivdrip), 每天2次(bid)', days: '3', total: '6瓶' },
      ];
      // --- Long Term Orders Example ---
      const long = [
         { time: '05-10 08:00', group: '', content: '胰岛素注射液', dosage: '10U', usage: '皮下注射(sc), 餐前30分钟', stopTime: '' },
         { time: '05-10 08:05', group: '', content: '二甲双胍片', dosage: '0.5g', usage: '口服(po), 每天2次(bid)', stopTime: '07-14 09:10' },
      ];
      // 实际应用中根据 this.selectedPatient.id 调用API
      this.temporaryOrders = temp; 
      this.longTermOrders = long;
      // 更新分页总数 (需要在获取数据后更新)
      this.pagination.total = this.currentTotalOrders; 
    },
    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.pagination.currentPage = 1; // 切换tab时重置分页
      this.pagination.total = this.currentTotalOrders; // 更新分页总数
    },
    createNewOrder() {
      if (!this.selectedPatient) {
        this.$message.warning('请先在左侧选择患者');
        return;
      }
      console.log(`Navigating to create new ${this.activeTab} order for patient: ${this.selectedPatient.id}`);
      // Navigate to the detail page, passing patientId and order type
      this.$router.push({ 
        name: 'MedicalOrderDetail', 
        params: { patientId: this.selectedPatient.id },
        query: { type: this.activeTab } // Pass type as query parameter
      });
    },
    editOrder(order) {
       if (!this.selectedPatient) {
        this.$message.warning('请先在左侧选择患者');
        return;
      }
       if (!order || !order.id) { // Assuming orders have a unique ID
           this.$message.error('无法编辑无效的医嘱记录');
           return;
       }
      console.log(`Navigating to edit ${this.activeTab} order ${order.id} for patient: ${this.selectedPatient.id}`);
       // Navigate to the detail page for editing
       this.$router.push({ 
        name: 'MedicalOrderDetail', 
        params: { patientId: this.selectedPatient.id },
        // Pass type and the ID of the order being edited
        query: { type: this.activeTab, editOrderId: order.id } 
      });

      // Remove old logic that opened a dialog
      // this.isEdit = true;
      // this.editingOrder = { ...order, type: this.activeTab }; 
      // this.showOrderDialog = true;
    },
    handleOrderSubmit(data) {
      console.log('Order submitted:', data);
      if (!this.selectedPatient) return;
      
      // TODO: 调用API保存医嘱 (data 中应包含患者ID)
      // 模拟保存成功后的逻辑
      const targetList = data.type === 'temp' ? this.temporaryOrders : this.longTermOrders;
      if (this.isEdit) {
        const index = targetList.findIndex(o => o.time === this.editingOrder.time); // 假设time是唯一标识
        if (index > -1) {
          this.$set(targetList, index, data);
          this.$message.success('医嘱更新成功');
        } else {
           this.$message.error('未找到要更新的医嘱');
        }
      } else {
        targetList.unshift(data); // 添加到列表开头
        this.$message.success('新医嘱添加成功');
      }
      this.pagination.total = this.currentTotalOrders; // 更新总数
      this.showOrderDialog = false;
      this.editingOrder = null;
    },
    stopOrder(order) {
      this.editingOrder = { ...order };
      this.stopTime = this.activeTab === 'long' ? (order.stopTime || '') : ''; // 初始化停止时间
      this.showStopDialog = true;
    },
    confirmStopOrder() {
      if (!this.editingOrder) return;
      console.log('Confirming stop order:', this.editingOrder, 'Stop time:', this.stopTime);
      // TODO: 调用API停止医嘱
      // 模拟成功后的逻辑
      const targetList = this.activeTab === 'temp' ? this.temporaryOrders : this.longTermOrders;
      const index = targetList.findIndex(o => o.time === this.editingOrder.time); // 假设time是唯一标识
      
      if (index > -1) {
        if (this.activeTab === 'long') {
          if (!this.stopTime) {
            this.$message.warning('请选择长期医嘱的停止时间');
            return;
          }
          this.$set(targetList[index], 'stopTime', this.stopTime);
          this.$message.success('长期医嘱已标记停止时间');
        } else {
          targetList.splice(index, 1);
          this.$message.success('临时医嘱已删除');
        }
        this.pagination.total = this.currentTotalOrders; // 更新总数
      } else {
         this.$message.error('未找到要停止的医嘱');
      }
      this.showStopDialog = false;
      this.editingOrder = null;
    },
    printOrder(order) {
      this.printOrders = [order];
      this.printOrderType = this.activeTab; // 记录打印类型
      this.showPrintDialog = true;
    },
    printEmptyOrder() {
      console.log('Opening empty order print dialog');
      // 如果没有选中患者，默认不勾选包含信息
      if (!this.selectedPatient) {
          this.includePatientInfoOnEmpty = false;
      }
      this.showEmptyPrintDialog = true; 
    },
    printCurrentOrderList() {
      if (!this.selectedPatient) {
        this.$message.warning('请先选择患者');
        return;
      }
      const ordersToPrint = this.activeTab === 'temp' ? this.temporaryOrders : this.longTermOrders;
      
      if (!ordersToPrint || ordersToPrint.length === 0) {
        this.$message.warning('当前列表没有可打印的医嘱');
        return;
      }

      this.printOrders = [...ordersToPrint]; 
      this.printOrderType = this.activeTab;
      this.startPrintRow = 1; // Reset start row when opening dialog
      this.showPrintDialog = true;
      console.log(`Printing all ${this.activeTab} orders for patient ${this.selectedPatient.id}`);
    },
    doPrintEmptyOrder() {
        console.log('Printing empty order sheet...');
        const printWindow = window.open('', '_blank');
        const printContentEl = this.$refs.emptyPrintPreviewArea;
        if (!printContentEl) {
            console.error('Empty print preview element not found!');
            this.$message.error('打印预览元素未找到');
            return;
        }
        const printContent = printContentEl.innerHTML;
        
        // 使用与常规打印类似的样式，但可以按需调整
        const emptyPrintStyles = `
            body { font-family: SimSun, serif; margin: 20px; }
            .empty-print-header { text-align: center; position: relative; margin-bottom: 15px; }
            .institution-name { font-size: 18px; font-weight: bold; }
            h1 { font-size: 22px; margin: 5px 0; }
            .page-number { position: absolute; top: 5px; right: 10px; font-size: 14px; }
            .patient-info-print { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ccc; font-size: 14px; }
            .patient-info-print span { margin-right: 15px; }
            .patient-info-print.placeholder span { color: #999; }
            .empty-print-table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .empty-print-table th, .empty-print-table td { border: 1px solid #333; height: 35px; /* 控制行高 */ text-align: center; padding: 2px 4px; vertical-align: top; }
            .empty-print-table th { font-weight: bold; background-color: #f2f2f2; }
            /* 可以在此添加更多打印特定样式 */
            @media print {
                /* 隐藏对话框页脚等非打印元素 */
                .dialog-footer { display: none; }
            }
        `;

        const html = this.createPrintHtml('空白医嘱单', emptyPrintStyles, printContent);
        printWindow.document.write(html);
        printWindow.document.close();
        // this.showEmptyPrintDialog = false; // 打印后通常不需要立即关闭预览
    },
    // 创建一个通用的 HTML 生成函数
    createPrintHtml(title, styles, content) {
      const printDoc = document.implementation.createHTMLDocument(title);
      
      const styleEl = printDoc.createElement('style');
      styleEl.textContent = styles;
      printDoc.head.appendChild(styleEl);
      
      const container = printDoc.createElement('div');
      container.innerHTML = content;
      printDoc.body.appendChild(container);
      
      const scriptEl = printDoc.createElement('script');
      scriptEl.textContent = `window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 300); };`; // 增加关闭延迟
      printDoc.body.appendChild(scriptEl);
      
      return printDoc.documentElement.outerHTML;
    },
    doPrint() {
      console.log(`Attempting to print starting from row: ${this.startPrintRow}`);
      // Note: Actually starting print from a specific physical row on paper via browser's print 
      // is not directly possible. This UI element is informational or for manual handling.
      const printWindow = window.open('', '_blank');
      // Use a specific ref for the regular print preview area
      const printContentEl = this.$refs.regularPrintPreviewArea; 
      if (!printContentEl) {
        console.error('Print preview element (.print-preview) not found!');
        this.$message.error('打印预览元素未找到');
        return;
      }
      const printContent = printContentEl.innerHTML;
      const regularPrintStyles = `
        body { font-family: SimSun, serif; margin: 20px; }
        .institution-name { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .page-number { position: absolute; top: 5px; right: 10px; font-size: 14px; }
        .patient-info-print { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ccc; font-size: 14px; }
        .patient-info-print span { margin-right: 15px; }
        .print-filled-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        .print-filled-table th, .print-filled-table td { border: 1px solid #666; padding: 6px 8px; text-align: center; vertical-align: top; word-break: break-all; }
        .print-filled-table th { background-color: #f2f2f2; font-weight: bold; }
        .print-filled-table td:nth-child(2) { text-align: left; } /* Align order content left */
        .print-filled-table .empty-row td { height: 25px; border: 1px dotted #ccc; } /* Style empty rows */
        @media print { 
            .dialog-footer { display: none; } 
            @page { size: A4; margin: 15mm; } /* Example print settings */
        }
      `;
      const title = this.printOrderType === 'temp' ? '临时医嘱单' : '长期医嘱单';
      const html = this.createPrintHtml(title, regularPrintStyles, printContent);
      printWindow.document.write(html);
      printWindow.document.close();
      this.showPrintDialog = false;
    },
  }
};
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

</style> 