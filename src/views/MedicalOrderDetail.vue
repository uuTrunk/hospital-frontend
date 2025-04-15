<template>
    <div class="medical-order-detail-container">
      <!-- 顶部操作栏 -->
      <div class="top-bar">
        <el-button icon="el-icon-arrow-left" @click="goBack" size="small">返回</el-button>
        <span class="patient-id-tag">No. {{ patientInfo.admissionId || '0006589' }}</span>
      </div>
  
      <div class="main-content">
        <!-- 左侧患者信息 -->
        <div class="patient-info-panel">
          <div class="info-header">
            <div class="avatar">张</div> <!-- Placeholder -->
            <div class="name-details">
              <span class="name">{{ patientInfo.name || '王大爷' }}</span>
              <span class="gender">{{ patientInfo.gender || '男' }}</span>
              <span class="age">{{ patientInfo.age || '86' }}周岁</span>
            </div>
          </div>
          <div class="info-body">
            <p><strong>房间床位:</strong> {{ patientInfo.roomNumber || '2206-5' }}</p>
            <p><strong>入院编号:</strong> {{ patientInfo.admissionId || '20240506124' }}</p>
            <p><strong>费别:</strong> {{ patientInfo.chargeType || '医保' }}</p>
            <p><strong>医保卡号:</strong> {{ patientInfo.medicalCard || 'D053252131' }}</p>
            <p><strong>科别:</strong> {{ patientInfo.department || '' }}</p>
            <p><strong>就诊日期:</strong> {{ patientInfo.visitDate || '2024-05-12' }}</p>
            <p><strong>过敏史:</strong> <span class="allergy">{{ patientInfo.allergyHistory || '青霉素、头孢、先锋类' }}</span></p>
          </div>
        </div>
  
        <!-- 右侧医嘱编辑区 -->
        <div class="order-edit-panel">
          <el-tabs v-model="activeRightTab" type="card">
            <el-tab-pane :label="orderType === 'temp' ? '临时医嘱' : '长期医嘱'" :name="orderType">
              <div class="order-toolbar">
                <div class="diagnosis-section">
                  <span class="required">*</span><label>临床诊断:</label>
                  <el-tag closable @close="removeDiagnosis('头痛病')">头痛病</el-tag> <!-- Example -->
                  <el-input
                    placeholder="输入名称或助记码,按回车添加"
                    size="small"
                    style="width: 250px; margin-left: 10px;"
                    v-model="diagnosisInput"
                    @keyup.enter.native="addDiagnosis"
                  ></el-input>
                </div>
                <div class="actions">
                   <el-checkbox v-model="urgentExecution">需摆药</el-checkbox>
                   <el-button type="primary" size="small" @click="submitOrders">发送医嘱</el-button>
                </div>
              </div>
  
              <div class="order-type-buttons">
                 <el-button size="small" @click="addOrderItem('drug')">+ 药物</el-button>
                 <el-button size="small" @click="addOrderItem('treatment')">+ 诊疗</el-button>
                 <el-button size="small" @click="addOrderItem('care')" v-if="orderType === 'longTerm'">+ 护理</el-button>
                 <span style="margin-left: 20px;">
                   <el-button type="text" size="small" icon="el-icon-link" @click="groupSelected">同组</el-button>
                   <el-button type="text" size="small" icon="el-icon-scissors" @click="ungroupSelected">拆组</el-button>
                   <el-button type="text" size="small" icon="el-icon-delete" @click="deleteSelected" style="color: #F56C6C;">删除</el-button>
                 </span>
              </div>
  
              <!-- 医嘱编辑表格 -->
              <el-table
                :data="currentOrderList"
                style="width: 100%"
                row-key="id"
                ref="orderTable"
                 @selection-change="handleOrderSelectionChange"
              >
                <el-table-column type="selection" width="45"></el-table-column>
                <el-table-column label="组号" width="60" prop="group">
                  <template slot-scope="scope">
                     <!-- Logic for displaying group number or grouping icon -->
                     {{ scope.row.group || ''}}
                  </template>
                </el-table-column>
                <el-table-column label="*开始时间" width="160">
                   <template slot-scope="scope">
                      <el-date-picker
                        v-model="scope.row.startTime"
                        type="datetime"
                        size="mini"
                        placeholder="选择时间"
                         format="MM/dd HH:mm"
                         value-format="yyyy-MM-dd HH:mm:ss"
                      ></el-date-picker>
                   </template>
                </el-table-column>
                <el-table-column label="内容" width="250">
                   <template slot-scope="scope">
                       <!-- Different input based on order type (drug, treatment, care) -->
                      <el-input size="mini" v-model="scope.row.content" placeholder="医嘱内容"></el-input>
                   </template>
                </el-table-column>
                 <el-table-column label="规格" width="150">
                    <template slot-scope="scope">
                      <el-input size="mini" v-model="scope.row.specification" placeholder="规格"></el-input>
                    </template>
                </el-table-column>
                 <el-table-column label="*单次剂量" width="120">
                    <template slot-scope="scope">
                      <el-input size="mini" v-model="scope.row.dosage" placeholder="剂量">
                         <el-select v-model="scope.row.dosageUnit" slot="append" placeholder="单位" style="width: 60px;">
                            <el-option label="ml" value="ml"></el-option>
                            <el-option label="g" value="g"></el-option>
                            <el-option label="mg" value="mg"></el-option>
                            <!-- More units -->
                         </el-select>
                      </el-input>
                    </template>
                </el-table-column>
                 <el-table-column label="*用法" width="150">
                     <template slot-scope="scope">
                       <el-select v-model="scope.row.usage" placeholder="选择用法" size="mini">
                         <el-option label="口服(po)" value="po"></el-option>
                         <el-option label="静脉滴注(ivdrip)" value="ivdrip"></el-option>
                         <!-- More usages -->
                       </el-select>
                     </template>
                 </el-table-column>
                 <el-table-column label="*频率" width="150">
                    <template slot-scope="scope">
                       <el-select v-model="scope.row.frequency" placeholder="选择频率" size="mini">
                         <el-option label="每天1次(qd)" value="qd"></el-option>
                         <el-option label="每天2次(bid)" value="bid"></el-option>
                         <el-option label="每天3次(tid)" value="tid"></el-option>
                         <!-- More frequencies -->
                       </el-select>
                     </template>
                 </el-table-column>
                 <el-table-column label="给药时间" width="150">
                     <template slot-scope="scope">
                       <!-- Placeholder for administration time logic -->
                        <el-input size="mini" v-model="scope.row.adminTime" placeholder="时间点"></el-input>
                     </template>
                 </el-table-column>
                  <el-table-column label="备注" width="100">
                    <template slot-scope="scope">
                       <el-input size="mini" v-model="scope.row.remarks" placeholder="备注"></el-input>
                     </template>
                 </el-table-column>
                 <!-- Add more columns if needed -->
              </el-table>
               <el-button type="text" icon="el-icon-plus" @click="addEmptyOrderRow" style="margin-top: 10px;">添加</el-button>
  
            </el-tab-pane>
            <el-tab-pane label="电子病历" name="emr" class="emr-tab-pane">
              <div class="emr-toolbar">
                  <div>
                      <!-- START: Added Popover for Template Selection -->
                      <el-popover
                        placement="bottom-start"
                        width="300"
                        trigger="click"
                        v-model="showTemplatePopover"
                      >
                        <div class="template-popover">
                          <el-input
                            placeholder="搜索模板名称"
                            v-model="templateSearchKeyword"
                            size="mini"
                            clearable
                            @input="filterEmrTemplates"
                          >
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                          </el-input>
                          <ul class="template-list">
                            <li 
                              v-for="template in filteredEmrTemplates"
                              :key="template.id"
                              @click="applyEmrTemplate(template)"
                            >
                              {{ template.name }}
                            </li>
                            <li v-if="filteredEmrTemplates.length === 0" class="no-template">
                              无匹配模板
                            </li>
                          </ul>
                        </div>
                        <el-button slot="reference" size="small" icon="el-icon-document">选择模板</el-button>
                      </el-popover>
                      <!-- END: Added Popover -->
                      <el-button type="text" size="small" @click="saveAsEmrTemplate" style="margin-left: 10px;">另存为模板</el-button>
                  </div>
                  <el-button type="primary" size="small" @click="saveEmrData">保存病历</el-button>
              </div>

              <el-form ref="emrForm" :model="emrData" label-width="100px" class="emr-form">
                <el-form-item label="主诉:">
                  <el-input type="textarea" v-model="emrData.chiefComplaint" :rows="2"></el-input>
                </el-form-item>
                <el-form-item label="现病史:">
                  <el-input type="textarea" v-model="emrData.historyPresentIllness" :rows="3"></el-input>
                </el-form-item>
                <el-form-item label="既往史:">
                  <el-input type="textarea" v-model="emrData.pastMedicalHistory" :rows="3"></el-input>
                </el-form-item>
                <el-form-item label="体格检查:">
                  <div class="physical-exam-row">
                    <span>T</span> <el-input v-model="emrData.temperature" size="mini"><template slot="append">°C</template></el-input>
                    <span>P</span> <el-input v-model="emrData.pulse" size="mini"><template slot="append">次/分</template></el-input>
                    <span>R</span> <el-input v-model="emrData.respiration" size="mini"><template slot="append">次/分</template></el-input>
                    <span>BP</span> <el-input v-model="emrData.bpSystolic" size="mini"></el-input> / <el-input v-model="emrData.bpDiastolic" size="mini"><template slot="append">mmHg</template></el-input>
                  </div>
                  <el-input type="textarea" v-model="emrData.physicalExamNotes" placeholder="体检描述" :rows="3" style="margin-top: 10px;"></el-input>
                </el-form-item>
                <el-form-item label="辅助检查:">
                  <el-input type="textarea" v-model="emrData.auxiliaryExam" placeholder="辅助检查结果" :rows="3"></el-input>
                </el-form-item>
                <el-form-item label="*临床诊断:">
                  <!-- Reuse diagnosis logic/component or simple input for now -->
                   <el-input
                      v-model="emrData.clinicalDiagnosis"
                      placeholder="输入名称或助记码,按回车添加"
                      @keyup.enter.native="addEmrDiagnosis"
                   ></el-input>
                   <!-- Display added diagnoses as tags -->
                   <div style="margin-top: 5px;">
                       <el-tag 
                           v-for="tag in emrDiagnoses" 
                           :key="tag" 
                           closable 
                           @close="removeEmrDiagnosis(tag)"
                           style="margin-right: 5px;"
                       >{{ tag }}</el-tag>
                   </div>
                </el-form-item>
                <el-form-item label="处理意见:">
                  <el-input type="textarea" v-model="emrData.treatmentPlan" :rows="4"></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
           <div class="bottom-notes" v-if="activeRightTab !== 'emr'">
              <p>提示：</p>
              <ol>
                  <li>添加药物交互要求同病历处方</li>
                  <li>仅药物类医嘱可同组；选择非药物类医嘱后，点击同组提示：诊疗、护理类医嘱不能同组</li>
                  <li>护理类、诊疗类医嘱部分字段不设填写项，参照原型所示。</li>
                  <li>护理类医嘱，相同分类的只能选一个（同类不可重复，选择窗口提交时检测提示：不能同时选择多个相同类型的医嘱）</li>
              </ol>
          </div>
        </div>
      </div>

      <!-- START: Dialogs for Adding Items -->

      <!-- 添加药物 Dialog -->
      <el-dialog title="添加药物" :visible.sync="showDrugDialog" width="75%" top="8vh" class="item-select-dialog">
        <div class="dialog-toolbar">
          <el-select v-model="drugSearch.category" placeholder="全部分类" size="small" style="width: 150px;">
            <!-- Add categories if needed -->
            <el-option label="全部类型" value=""></el-option>
            <el-option label="西药" value="western"></el-option>
            <el-option label="中成药" value="chinese"></el-option>
          </el-select>
          <el-input
            placeholder="名称/条码/编码/助记码"
            v-model="drugSearch.keyword"
            size="small"
            style="width: 300px; margin-left: 10px;"
            clearable
            @input="filterAvailableDrugs"
            @keyup.enter.native="filterAvailableDrugs"
          >
             <el-button slot="append" icon="el-icon-search" @click="filterAvailableDrugs"></el-button>
          </el-input>
          <!-- Tabs for 药品库/长者药品 -->
          <el-tabs v-model="drugDialogTab" size="small" style="margin-left: auto;">
              <el-tab-pane label="药品库" name="stock"></el-tab-pane>
              <el-tab-pane label="长者药品()" name="patientSpecific" disabled></el-tab-pane> 
          </el-tabs>
        </div>
        <el-table 
          :data="pagedAvailableDrugs" 
          ref="drugSelectTable"
          @selection-change="handleDialogSelectionChange" 
          height="450px"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="药品名称"></el-table-column>
          <el-table-column prop="spec" label="规格" width="180"></el-table-column>
          <el-table-column prop="unit" label="包装单位" width="100"></el-table-column>
          <el-table-column prop="price" label="单价(元)" width="100"></el-table-column>
          <el-table-column prop="stock" label="可用库存" width="100"></el-table-column>
          <el-table-column prop="manufacturer" label="厂家"></el-table-column>
        </el-table>
         <el-pagination
           style="margin-top: 15px; text-align: right;"
           @size-change="handleDrugPageSizeChange"
           @current-change="handleDrugPageChange"
           :current-page="drugPagination.currentPage"
           :page-sizes="[10, 20, 50]"
           :page-size="drugPagination.pageSize"
           layout="total, sizes, prev, pager, next"
           :total="filteredAvailableDrugs.length"
         >
         </el-pagination>
        <div class="dialog-footer-notes">
          <p>西医处方，只展示西药+中成药</p>
          <p>需要提供分页，跨搜索条件多选能力</p>
          <p>【可选交互】本页面勾选时，一次最多选择5种药物（选第六个的时候，弹出提示：一次最多只能选择5种药物）</p>
        </div>
        <div slot="footer">
          <el-button @click="showDrugDialog = false" size="small">取 消</el-button>
          <el-button type="primary" @click="handleDialogSubmit('drug')" size="small">提 交</el-button>
        </div>
      </el-dialog>

      <!-- 添加诊疗 Dialog -->
       <el-dialog title="添加诊疗" :visible.sync="showTreatmentDialog" width="60%" top="10vh" class="item-select-dialog">
        <div class="dialog-toolbar">
          <el-select v-model="treatmentSearch.category" placeholder="全部分类" size="small" style="width: 150px;">
             <el-option label="全部类型" value=""></el-option>
             <el-option label="检查" value="check"></el-option>
             <el-option label="化验" value="lab"></el-option>
          </el-select>
          <el-input
            placeholder="名称/助记码"
            v-model="treatmentSearch.keyword"
            size="small"
            style="width: 300px; margin-left: 10px;"
            clearable
             @input="filterAvailableTreatments"
            @keyup.enter.native="filterAvailableTreatments"
          >
            <el-button slot="append" icon="el-icon-search" @click="filterAvailableTreatments"></el-button>
          </el-input>
        </div>
        <el-table 
          :data="pagedAvailableTreatments" 
          ref="treatmentSelectTable"
          @selection-change="handleDialogSelectionChange" 
          height="400px"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="项目名"></el-table-column>
          <el-table-column prop="type" label="类型" width="150"></el-table-column>
          <el-table-column prop="unit" label="单位" width="100"></el-table-column>
          <el-table-column prop="price" label="单价(元)" width="120"></el-table-column>
        </el-table>
         <el-pagination
           style="margin-top: 15px; text-align: right;"
           @size-change="handleTreatmentPageSizeChange"
           @current-change="handleTreatmentPageChange"
           :current-page="treatmentPagination.currentPage"
           :page-sizes="[10, 20, 50]"
           :page-size="treatmentPagination.pageSize"
           layout="total, sizes, prev, pager, next"
           :total="filteredAvailableTreatments.length"
         >
         </el-pagination>
        <div slot="footer">
          <el-button @click="showTreatmentDialog = false" size="small">取 消</el-button>
          <el-button type="primary" @click="handleDialogSubmit('treatment')" size="small">提 交</el-button>
        </div>
      </el-dialog>

      <!-- 添加护理 Dialog -->
       <el-dialog title="添加护理" :visible.sync="showCareDialog" width="60%" top="10vh" class="item-select-dialog">
         <div class="dialog-toolbar">
           <el-select v-model="careSearch.category" placeholder="全部分类" size="small" style="width: 150px;">
              <el-option label="全部类型" value=""></el-option>
              <el-option label="护理常规" value="routine"></el-option>
              <el-option label="饮食" value="diet"></el-option>
           </el-select>
           <el-input
             placeholder="名称/助记码"
             v-model="careSearch.keyword"
             size="small"
             style="width: 300px; margin-left: 10px;"
             clearable
              @input="filterAvailableCareItems"
             @keyup.enter.native="filterAvailableCareItems"
           >
             <el-button slot="append" icon="el-icon-search" @click="filterAvailableCareItems"></el-button>
           </el-input>
         </div>
         <el-table 
           :data="pagedAvailableCareItems" 
           ref="careSelectTable"
           @selection-change="handleDialogSelectionChange" 
           height="400px"
           style="width: 100%"
         >
           <el-table-column type="selection" width="55"></el-table-column>
           <el-table-column prop="name" label="项目名"></el-table-column>
           <el-table-column prop="type" label="类型" width="180"></el-table-column>
         </el-table>
          <el-pagination
            style="margin-top: 15px; text-align: right;"
            @size-change="handleCarePageSizeChange"
            @current-change="handleCarePageChange"
            :current-page="carePagination.currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="carePagination.pageSize"
            layout="total, sizes, prev, pager, next"
            :total="filteredAvailableCareItems.length"
          >
          </el-pagination>
         <div slot="footer">
           <el-button @click="showCareDialog = false" size="small">取 消</el-button>
           <el-button type="primary" @click="handleDialogSubmit('care')" size="small">提 交</el-button>
         </div>
       </el-dialog>

      <!-- END: Dialogs for Adding Items -->

    </div>
  </template>
  
  <script>
  export default {
    name: 'MedicalOrderDetail',
    props: {
      patientId: { // Received from router
        type: String,
        required: true
      }
    },
    data() {
      return {
        patientInfo: {}, // To store fetched patient data
        orderType: 'longTerm', // Default or determined from route query
        editOrderId: null, // ID of the order being edited, from route query
        activeRightTab: 'longTerm', // Will be set based on orderType
        diagnosisInput: '',
        urgentExecution: false,
        orderList: [], // Unified list for current order type
        selectedOrderIds: [],
        
        // EMR Data
        emrData: {
            chiefComplaint: '',
            historyPresentIllness: '',
            pastMedicalHistory: '',
            temperature: '',
            pulse: '',
            respiration: '',
            bpSystolic: '',
            bpDiastolic: '',
            physicalExamNotes: '',
            auxiliaryExam: '',
            clinicalDiagnosis: '', // Input field model
            treatmentPlan: ''
        },
        emrDiagnoses: [], // Array to store added diagnosis tags
        // Dialog Visibility
        showDrugDialog: false,
        showTreatmentDialog: false,
        showCareDialog: false,
        drugDialogTab: 'stock', // Active tab in drug dialog

        // Available Items (Mock Data - Replace with API calls)
        availableDrugs: [],
        availableTreatments: [],
        availableCareItems: [],

         // Filtered Lists for Tables
         filteredAvailableDrugs: [],
         filteredAvailableTreatments: [],
         filteredAvailableCareItems: [],

        // Search/Filter Models
        drugSearch: { category: '', keyword: '' },
        treatmentSearch: { category: '', keyword: '' },
        careSearch: { category: '', keyword: '' },

        // Dialog Selections
        selectedDialogItems: [], // Store selection from the currently open dialog

         // Pagination for Dialogs
         drugPagination: { currentPage: 1, pageSize: 10 },
         treatmentPagination: { currentPage: 1, pageSize: 10 },
         carePagination: { currentPage: 1, pageSize: 10 },

         // START: Template Selection Data
         showTemplatePopover: false,
         templateSearchKeyword: '',
         availableEmrTemplates: [], // Loaded in methods
         filteredEmrTemplates: [],
         // END: Template Selection Data
      };
    },
    computed: {
        // Use a computed property for the table data based on orderType
        currentOrderList() {
            // In a real app, this might be fetched or filtered based on orderType
            return this.orderList; 
        }
    },
    watch: {
        // Watch route changes to potentially reload data if navigating between patients
        '$route'(to, from) {
            if (to.params.patientId !== from.params.patientId || to.query.type !== from.query.type) {
                this.initializeComponent();
            }
        }
    },
    created() {
      this.initializeComponent();
      this.loadAvailableItems(); // Load items for dialogs
      this.loadAvailableEmrTemplates(); // Load templates
    },
    methods: {
      initializeComponent() {
          // Determine order type and edit ID from route query
          this.orderType = this.$route.query.type === 'temp' ? 'temp' : 'longTerm';
          this.editOrderId = this.$route.query.editOrderId || null;
          this.activeRightTab = this.orderType; // Set active tab based on type
          console.log(`Initializing for type: ${this.orderType}, editing order: ${this.editOrderId}`);

          this.fetchPatientDetails();
          this.loadInitialOrders(); // Load or initialize orders based on type/editId
      },
      goBack() {
        this.$router.go(-1); // Go back to the previous page
      },
      fetchPatientDetails() {
        console.log(`Fetching details for patient ID: ${this.patientId}`);
        // --- Simulate API call ---
        // In a real app, fetch patient info based on this.patientId
        this.patientInfo = {
           id: this.patientId, // Use the passed ID
           name: '王大爷',
           gender: '男',
           age: '86',
           roomNumber: '2206-5',
           admissionId: '20240506124',
           chargeType: '医保',
           medicalCard: 'D053252131',
           department: '内科', // Example
           visitDate: '2024-05-12',
           allergyHistory: '青霉素、头孢、先锋类'
        };
        // --- End Simulation ---
      },
       loadInitialOrders() {
           console.log(`Loading ${this.orderType} orders for patient: ${this.patientId}, edit ID: ${this.editOrderId}`);
           // TODO: Replace with API call based on patientId, orderType, and potentially editOrderId
           // Simulate loading data based on type
           if (this.orderType === 'temp') {
               this.orderList = [
                   { id: 'temp1', group: '', startTime: '2024-12-17 10:00:00', content: '体温监测', frequency: 'q4h' },
               ];
           } else { // longTerm
               this.orderList = [
                   { id: 'long1', group: '1', startTime: '2024-12-16 12:55:00', content: '按内科常规护理', specification: '', dosage: '', dosageUnit: '', usage: '', frequency: '', adminTime: '', remarks: '', stopTime: null},
                   { id: 'long2', group: '2', startTime: '2024-12-16 12:55:00', content: '(维他凯尔)维生素C', specification: '10ml*5支/盒', dosage: '适量', dosageUnit: '', usage: '', frequency: '', adminTime: '', remarks: '', stopTime: null},
                   // ... more long term orders
               ];
           }
           // If editing, potentially pre-select or highlight the order
           if (this.editOrderId) {
               console.log(`Need to handle editing for order ID: ${this.editOrderId}`);
               // Find the order in this.orderList and maybe open an edit state for it
           }
       },
      removeDiagnosis(tag) {
        console.log("Removing diagnosis:", tag);
        // Logic to remove diagnosis tag
      },
      addDiagnosis() {
        console.log("Adding diagnosis:", this.diagnosisInput);
        // Logic to add diagnosis tag
        this.diagnosisInput = '';
      },
      submitOrders() {
         console.log(`Submitting ${this.orderType} orders:`, this.orderList);
         this.$message.success('医嘱已发送（模拟）');
      },
      addOrderItem(type) {
         console.log("Request to add order item of type:", type);
         this.selectedDialogItems = []; // Clear previous selection
         switch (type) {
           case 'drug':
              this.drugPagination.currentPage = 1; // Reset pagination
              this.filterAvailableDrugs(); // Apply initial filter
              this.showDrugDialog = true;
              break;
           case 'treatment':
              this.treatmentPagination.currentPage = 1;
              this.filterAvailableTreatments();
              this.showTreatmentDialog = true;
              break;
           case 'care':
              if (this.orderType === 'longTerm') {
                 this.carePagination.currentPage = 1;
                 this.filterAvailableCareItems();
                 this.showCareDialog = true;
              } else {
                  console.warn("Cannot add care item for temporary orders.");
              }
              break;
           default:
              this.addEmptyOrderRow(); 
         }
      },
       addEmptyOrderRow() {
           const newId = `new_${Date.now()}`;
           const newOrder = {
                id: newId,
                group: '',
                startTime: '',
                content: '',
                specification: '',
                dosage: '',
                dosageUnit: '',
                usage: '',
                frequency: '',
                adminTime: '',
                remarks: ''
            };
            // Add type-specific fields
            if (this.orderType === 'temp') {
                newOrder.days = '';
                newOrder.total = '';
            } else {
                newOrder.stopTime = null;
            }
            this.orderList.push(newOrder);
        },
       handleOrderSelectionChange(selection) {
          this.selectedOrderIds = selection.map(item => item.id);
          console.log("Selected order IDs:", this.selectedOrderIds);
       },
      groupSelected() {
          console.log("Grouping selected orders:", this.selectedOrderIds);
          if (this.selectedOrderIds.length < 2) {
              this.$message.warning('请至少选择两个医嘱进行同组');
              return;
          }
          // TODO: Implement grouping logic (assign same group number, check rules)
          this.$message.info('同组功能待实现');
      },
      ungroupSelected() {
          console.log("Ungrouping selected orders:", this.selectedOrderIds);
           if (this.selectedOrderIds.length === 0) {
              this.$message.warning('请选择要拆组的医嘱');
              return;
          }
          // TODO: Implement ungrouping logic (clear group number)
           this.$message.info('拆组功能待实现');
      },
      deleteSelected() {
          console.log("Deleting selected orders:", this.selectedOrderIds);
          if (this.selectedOrderIds.length === 0) {
              this.$message.warning('请选择要删除的医嘱');
              return;
          }
          this.orderList = this.orderList.filter(order => !this.selectedOrderIds.includes(order.id));
          this.$message.success('选中的医嘱已删除（模拟）');
          this.selectedOrderIds = [];
      },

      // --- EMR Methods ---
      loadAvailableEmrTemplates() {
          console.log("Loading EMR templates...");
          // Simulate API call
          this.availableEmrTemplates = [
              { id: 'tpl1', name: '上呼吸道感染', data: { chiefComplaint: '发热、咳嗽、流涕3天', historyPresentIllness: '3天前无明显诱因出现上述症状，伴咽痛，无寒战... ', pastMedicalHistory: '否认高血压、糖尿病史', clinicalDiagnosis: '急性上呼吸道感染' } },
              { id: 'tpl2', name: '高血压、冠心病', data: { chiefComplaint: '头晕、胸闷1周', historyPresentIllness: '患者1周前劳累后出现头晕，伴胸闷、心悸，休息后稍缓解...', pastMedicalHistory: '高血压病史10年，冠心病史5年', clinicalDiagnosis: '高血压病3级（极高危）；冠心病' } },
              { id: 'tpl3', name: '老年痴呆', data: { chiefComplaint: '记忆力下降半年', historyPresentIllness: '半年前开始出现记忆力减退，近期加重，日常生活能力下降...', pastMedicalHistory: '否认特殊病史', clinicalDiagnosis: '阿尔茨海默病' } },
              { id: 'tpl4', name: '美尼尔综合征', data: { chiefComplaint: '反复眩晕、耳鸣2年', historyPresentIllness: '患者2年来反复出现发作性眩晕，伴恶心、呕吐及右耳耳鸣、听力下降...', pastMedicalHistory: '', clinicalDiagnosis: '美尼尔综合征' } },
              { id: 'tpl5', name: '精力旺盛', data: { chiefComplaint: '最近爱讲笑话', historyPresentIllness: '王大爷年纪大了，爱说笑话；拉着小王叨叨絮絮3天都没睡觉了。', pastMedicalHistory: '无', clinicalDiagnosis: '精力旺盛' } },
          ];
          this.filterEmrTemplates(); // Initial filter
      },
      filterEmrTemplates() {
          const keyword = this.templateSearchKeyword.trim().toLowerCase();
          if (!keyword) {
              this.filteredEmrTemplates = [...this.availableEmrTemplates];
          } else {
              this.filteredEmrTemplates = this.availableEmrTemplates.filter(
                  template => template.name.toLowerCase().includes(keyword)
              );
          }
      },
      applyEmrTemplate(template) {
          console.log("Applying EMR template:", template.name);
          if (template && template.data) {
              // Overwrite relevant fields in emrData
              // Use Object.assign or loop for safer merging if needed
              this.emrData.chiefComplaint = template.data.chiefComplaint || this.emrData.chiefComplaint;
              this.emrData.historyPresentIllness = template.data.historyPresentIllness || this.emrData.historyPresentIllness;
              this.emrData.pastMedicalHistory = template.data.pastMedicalHistory || this.emrData.pastMedicalHistory;
              this.emrData.physicalExamNotes = template.data.physicalExamNotes || this.emrData.physicalExamNotes;
              this.emrData.auxiliaryExam = template.data.auxiliaryExam || this.emrData.auxiliaryExam;
              this.emrData.treatmentPlan = template.data.treatmentPlan || this.emrData.treatmentPlan;
              
              // Handle clinical diagnosis separately (add as tag)
              const templateDiagnosis = template.data.clinicalDiagnosis;
              if (templateDiagnosis && !this.emrDiagnoses.includes(templateDiagnosis)) {
                  this.emrDiagnoses.push(templateDiagnosis);
              } // Maybe clear existing diagnosis input: this.emrData.clinicalDiagnosis = '';

               this.$message.success(`已应用模板: ${template.name}`);
          } else {
              this.$message.error('无法应用所选模板');
          }
          this.showTemplatePopover = false; // Close popover after applying
      },
      saveAsEmrTemplate() {
          console.log("Saving as EMR template:", this.emrData);
          this.$message.info("另存为模板功能待实现");
          // TODO: Implement save as template logic
      },
      saveEmrData() {
          console.log("Saving EMR data:", this.emrData, "Diagnoses:", this.emrDiagnoses);
           this.$message.success('电子病历已保存（模拟）');
          // TODO: Implement API call to save EMR data
      },
       addEmrDiagnosis() {
           const newDiagnosis = this.emrData.clinicalDiagnosis.trim();
           if (newDiagnosis && !this.emrDiagnoses.includes(newDiagnosis)) {
               this.emrDiagnoses.push(newDiagnosis);
           }
           this.emrData.clinicalDiagnosis = ''; // Clear input after adding
       },
       removeEmrDiagnosis(tag) {
           this.emrDiagnoses.splice(this.emrDiagnoses.indexOf(tag), 1);
       },
       loadAvailableItems() {
         // Simulate loading all available items for selection dialogs
         console.log("Loading available items for dialogs...");
         this.availableDrugs = [
            { id: 'd1', name: '阿司匹林肠溶片', spec: '100mg*30片/盒', unit: '盒', price: 15.50, stock: 500, manufacturer: '拜耳医药', type: 'western' },
            { id: 'd2', name: '布洛芬缓释胶囊', spec: '0.3g*10粒/盒', unit: '盒', price: 28.00, stock: 150, manufacturer: '西南药业', type: 'western' },
            { id: 'd3', name: '头孢克肟胶囊', spec: '0.1g*6粒/盒', unit: '盒', price: 45.80, stock: 80, manufacturer: '哈药集团', type: 'western' },
            { id: 'd4', name: '感冒清热颗粒', spec: '10g*10袋/盒', unit: '盒', price: 22.00, stock: 300, manufacturer: '同仁堂', type: 'chinese' },
            { id: 'd5', name: '维生素C片', spec: '100mg*100片/瓶', unit: '瓶', price: 9.90, stock: 1000, manufacturer: '国药集团', type: 'western' },
         ];
          this.availableTreatments = [
             { id: 't1', name: '血常规', type: '化验', unit: '次', price: 25.00 },
             { id: 't2', name: '尿常规', type: '化验', unit: '次', price: 15.00 },
             { id: 't3', name: '肝功能全套', type: '化验', unit: '次', price: 80.00 },
             { id: 't4', name: '胸部X光片', type: '检查', unit: '次', price: 120.00 },
             { id: 't5', name: '心电图', type: '检查', unit: '次', price: 50.00 },
             { id: 't6', name: '24小时尿蛋白定量', type: '化验', unit: '次', price: 38.00 },
             { id: 't7', name: '腹部B超', type: '检查', unit: '次', price: 100.00 },
          ];
           this.availableCareItems = [
              { id: 'c1', name: '按内科常规护理', type: '护理常规' },
              { id: 'c2', name: '一级护理', type: '护理常规' },
              { id: 'c3', name: '二级护理', type: '护理常规' },
              { id: 'c4', name: '半流质饮食', type: '饮食' },
              { id: 'c5', name: '糖尿病饮食', type: '饮食' },
              { id: 'c6', name: '测量血压 qid', type: '生命体征' },
              { id: 'c7', name: '血糖监测 tid', type: '生命体征' },
           ];

           // Initialize filtered lists
           this.filterAvailableDrugs();
           this.filterAvailableTreatments();
           this.filterAvailableCareItems();
       },

      // --- Dialog Specific Methods ---
      handleDialogSelectionChange(selection) {
          // Check selection limit (example for drugs)
          if (this.showDrugDialog && selection.length > 5) {
              this.$message.warning('一次最多只能选择5种药物');
              // Find the last selected item and deselect it
              // This requires knowing which item was just added to the selection,
              // which element-ui's selection-change doesn't directly provide.
              // A more robust approach might involve watching the selection or using the `select` event.
              // Simple rollback (may not be perfect UX):
               this.$nextTick(() => { 
                   const tableRef = this.$refs.drugSelectTable;
                   if (tableRef) { 
                       // Find items selected now that weren't selected before (tricky)
                       // Or just deselect the last one if selection length exceeds limit
                       const lastItem = selection[selection.length -1];
                       if (lastItem) tableRef.toggleRowSelection(lastItem, false);
                   }
               });
              return; // Prevent updating selectedDialogItems beyond limit
          }
          this.selectedDialogItems = selection;
          console.log("Dialog selection updated:", this.selectedDialogItems);
      },
      handleDialogSubmit(itemType) {
          console.log(`Submitting selected ${itemType}(s):`, this.selectedDialogItems);
          if (!this.selectedDialogItems || this.selectedDialogItems.length === 0) {
              this.$message.warning('请至少选择一个项目');
              return;
          }

          // Format selected items and add to the main order list
          this.selectedDialogItems.forEach(item => {
              const newOrder = {
                  id: `new_${Date.now()}_${Math.random().toString(16).slice(2)}`, // More unique ID
                  group: '', // Or logic to determine group
                  startTime: '', // Or default to now
                  content: item.name, // Basic mapping
                  specification: itemType === 'drug' ? item.spec : '',
                  dosage: '', // User needs to fill these in the main table
                  dosageUnit: itemType === 'drug' ? (item.unit ? item.unit.toLowerCase() : '') : '', // Attempt basic unit mapping
                  usage: '',
                  frequency: '',
                  adminTime: '',
                  remarks: ''
                  // Add other relevant fields based on itemType if available
              };
              if (this.orderType === 'temp') {
                  newOrder.days = '';
                  newOrder.total = '';
              } else {
                  newOrder.stopTime = null;
              }
              this.orderList.push(newOrder); 
          });

          // Close the corresponding dialog
          if (itemType === 'drug') this.showDrugDialog = false;
          if (itemType === 'treatment') this.showTreatmentDialog = false;
          if (itemType === 'care') this.showCareDialog = false;

          this.selectedDialogItems = []; // Clear selection
      },

      // --- Filtering Methods for Dialogs ---
       filterAvailableDrugs() {
           const keyword = this.drugSearch.keyword.toLowerCase();
           const category = this.drugSearch.category;
           this.filteredAvailableDrugs = this.availableDrugs.filter(drug => {
               const matchKeyword = !keyword || 
                                   drug.name.toLowerCase().includes(keyword) || 
                                   (drug.id && drug.id.toLowerCase().includes(keyword)) || // Search by ID if available
                                   (drug.manufacturer && drug.manufacturer.toLowerCase().includes(keyword));
               const matchCategory = !category || drug.type === category;
               return matchKeyword && matchCategory;
           });
            this.drugPagination.currentPage = 1; // Reset page on filter change
       },
       filterAvailableTreatments() {
           const keyword = this.treatmentSearch.keyword.toLowerCase();
           const category = this.treatmentSearch.category;
           this.filteredAvailableTreatments = this.availableTreatments.filter(item => {
               const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword);
               const matchCategory = !category || item.type.toLowerCase().includes(category.toLowerCase()); // Adjust category match if needed
               return matchKeyword && matchCategory;
           });
           this.treatmentPagination.currentPage = 1;
       },
        filterAvailableCareItems() {
           const keyword = this.careSearch.keyword.toLowerCase();
           const category = this.careSearch.category;
           this.filteredAvailableCareItems = this.availableCareItems.filter(item => {
               const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword);
               const matchCategory = !category || item.type.toLowerCase().includes(category.toLowerCase());
               return matchKeyword && matchCategory;
           });
           this.carePagination.currentPage = 1;
       },

      // --- Pagination Handlers for Dialogs ---
      handleDrugPageSizeChange(val) { this.drugPagination.pageSize = val; this.drugPagination.currentPage = 1; },
      handleDrugPageChange(val) { this.drugPagination.currentPage = val; },
      handleTreatmentPageSizeChange(val) { this.treatmentPagination.pageSize = val; this.treatmentPagination.currentPage = 1; },
      handleTreatmentPageChange(val) { this.treatmentPagination.currentPage = val; },
      handleCarePageSizeChange(val) { this.carePagination.pageSize = val; this.carePagination.currentPage = 1; },
      handleCarePageChange(val) { this.carePagination.currentPage = val; },
    }
  };
  </script>
  
  <style scoped>
  .medical-order-detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f5f6fa; /* Match background */
  }
  
  .top-bar {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .patient-id-tag {
    margin-left: 15px;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    background-color: #e6f7ff;
    padding: 3px 8px;
    border-radius: 4px;
  }
  
  .main-content {
    display: flex;
    flex-grow: 1;
    padding: 15px;
    gap: 15px; /* Gap between panels */
    overflow: hidden; /* Prevent content overflow */
  }
  
  /* 左侧患者信息 */
  .patient-info-panel {
    width: 280px; /* Fixed width */
    flex-shrink: 0; /* Prevent shrinking */
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px); /* Adjust based on layout */
  }
  
  .info-header {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #409eff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .name-details .name {
    font-size: 16px;
    font-weight: bold;
    margin-right: 8px;
  }
  .name-details .gender,
  .name-details .age {
    font-size: 14px;
    color: #666;
    margin-right: 5px;
  }
  
  .info-body {
    padding: 15px;
    font-size: 13px;
    line-height: 1.8;
    overflow-y: auto; /* Allow scrolling if content exceeds height */
    flex-grow: 1;
  }
  
  .info-body p {
    margin-bottom: 8px;
    color: #333;
  }
  .info-body strong {
    color: #666;
    display: inline-block;
    width: 70px; /* Align keys */
  }
  .allergy {
    color: #f56c6c;
    font-weight: 500;
  }
  
  
  /* 右侧编辑区 */
  .order-edit-panel {
    flex-grow: 1;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
     overflow: hidden; /* Prevent content overflow */
  }
  
  .order-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e8e8e8;
  }
  .diagnosis-section {
      display: flex;
      align-items: center;
      gap: 5px;
  }
  .diagnosis-section label {
      font-size: 14px;
      color: #606266;
  }
  .diagnosis-section .required {
      color: #F56C6C;
      margin-right: 4px;
  }
  .diagnosis-section .el-tag {
      margin-right: 5px;
  }
  
  .order-toolbar .actions {
      display: flex;
      align-items: center;
      gap: 15px;
  }
  
  .order-type-buttons {
    margin-bottom: 15px;
  }
  .order-type-buttons .el-button {
      margin-right: 10px;
  }
  
  /* Override default tab card style */
  .el-tabs--card > .el-tabs__header .el-tabs__nav {
      border-radius: 4px 4px 0 0;
      border-bottom: 1px solid #E4E7ED;
  }
  .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
      border-bottom-color: #FFF;
  }
  
  /* Table Styles */
  .el-table {
      font-size: 13px;
  }
  /* Ensure inputs/selects fit well in cells */
  .el-table .el-input--mini,
  .el-table .el-select--mini {
      width: 100%;
  }
  .el-table .el-input-group__append .el-select {
      margin: -1px -10px; /* Adjust select in append */
  }
  .el-table .el-date-editor.el-input,
  .el-table .el-date-editor.el-input__inner {
       width: 100%; /* Make date picker fill cell */
  }
  
  /* Adjustments for required markers if needed */
  .el-table th > .cell {
      /* position: relative; */
  }
  .el-table th.is-required > .cell::before {
      content: '*';
      color: #F56C6C;
      margin-right: 4px;
  }
  
  .bottom-notes {
      margin-top: 20px;
      padding: 15px;
      background-color: #fdf6ec;
      color: #E6A23C;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
  }
  .bottom-notes ol {
      padding-left: 20px; /* Indent list */
      margin-top: 5px;
  }

  /* EMR Tab Styles */
  .emr-tab-pane {
      padding: 15px 5px; /* Add some padding */
      height: calc(100% - 40px); /* Adjust height considering tab header */
      overflow-y: auto;
  }

  .emr-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
  }

  .emr-form .el-form-item {
      margin-bottom: 18px;
  }

  .physical-exam-row {
      display: flex;
      align-items: center;
      gap: 5px;
  }
  .physical-exam-row span {
      margin-right: 2px;
      color: #606266;
  }
  .physical-exam-row .el-input {
      width: 80px;
  }
  .physical-exam-row .el-input--mini {
       width: 70px; /* Smaller inputs for BP */
  }
  .physical-exam-row .el-input-group__append {
      padding: 0 8px;
  }

  /* Adjust Clinical Diagnosis input width if needed */
  .emr-form .el-form-item__content > .el-input {
      /* width: 50%; */ 
  }

  /* Dialog Specific Styles */
  .item-select-dialog .el-dialog__body {
      padding: 10px 20px;
  }
  .dialog-toolbar {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
  }

  .dialog-footer-notes {
      margin-top: 15px;
      padding: 10px;
      background-color: #fdf6ec;
      color: #E6A23C;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
  }
  .dialog-footer-notes p {
      margin: 2px 0;
  }

  /* Ensure table header doesn't wrap excessively */
  .item-select-dialog .el-table th > .cell {
      white-space: nowrap;
  }

  /* Template Popover Styles */
  .template-popover {
    /* Add styles if needed, e.g., padding */
  }

  .template-list {
    list-style: none;
    padding: 5px 0 0 0;
    margin: 10px 0 0 0;
    max-height: 250px; /* Limit height and enable scrolling */
    overflow-y: auto;
    border-top: 1px solid #eee; /* Separator */
  }

  .template-list li {
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;
    border-bottom: 1px solid #f5f5f5; /* Light separator */
  }

  .template-list li:hover {
    background-color: #f5f9ff;
    color: #409eff;
  }

  .template-list li:last-child {
      border-bottom: none;
  }

  .no-template {
      color: #999;
      padding: 10px;
      text-align: center;
      cursor: default;
  }
  .no-template:hover {
      background-color: transparent;
      color: #999;
  }
  </style>