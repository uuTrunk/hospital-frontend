<template>
  <div class="prescription-detail-container">
    <div class="back-button-container">
        <button @click="goBack" class="back-btn">&lt; 返回</button>
        <span class="detail-no">No.0006589 <span class="tag-a1">A1</span></span>
    </div>
    <div class="detail-content-wrapper">
        <div class="patient-info-sidebar">
            <div class="info-item"><span class="label">姓名</span> <span class="value name">王大勇</span></div>
            <div class="info-item"><span class="label">性别</span> <span class="value">男</span></div>
            <div class="info-item"><span class="label">年龄</span> <span class="value">86周岁</span></div>
            <div class="info-item"><span class="label">房间床位</span> <span class="value">2206-5</span></div>
            <div class="info-item"><span class="label">入院编号</span> <span class="value">20240506124</span></div>
            <div class="info-item"><span class="label">费别</span> <span class="value">医保</span></div>
            <div class="info-item"><span class="label">医保卡号</span> <span class="value">D053252131</span></div>
            <div class="info-item"><span class="label">科别</span> <span class="value"></span></div>
            <div class="info-item"><span class="label">就诊日期</span> <span class="value">2024-05-12</span></div>
            <div class="info-item allergies-item">
                <span class="label">过敏史</span> 
                <span class="value allergies">青霉素、头孢、先锋类</span>
            </div>
        </div>
        <div class="prescription-main-content">
            <div class="detail-header">
                <div class="tabs-detail">
                    <span class="tab" :class="{active: activeTab === 'prescription'}" @click="switchTab('prescription')"> <i class="el-icon-document"></i> 电子处方 </span>
                    <span class="tab" :class="{active: activeTab === 'record'}" @click="switchTab('record')"> <i class="el-icon-document-copy"></i> 电子病历 </span>
                </div>
                <div v-if="activeTab === 'prescription'" class="prescription-header-content">
                    <div class="diagnosis-edit">
                        <span class="label">临床诊断</span> 
                        <!-- TODO: Make this an editable input/search -->
                         <span class="tag-diagnosis">头痛</span> 
                         <input type="text" placeholder="输入名称或助记码,按回车添加">
                    </div>
                    <button v-if="isEditingPrescription" class="btn-send-prescription" @click="savePrescription">
                        <i class="el-icon-s-promotion"></i> 发送处方
                    </button>
                    <template v-else>
                        <div class="action-buttons-main">
                            <button class="btn-modify-main" @click="editPrescription">
                                <i class="el-icon-edit"></i> 修改
                            </button>
                            <button class="btn-print-main" @click="printPrescription">
                                <i class="el-icon-printer"></i> 打印处方
                            </button>
                        </div>
                    </template>
                </div>
                 <div v-if="activeTab === 'record' && medicalRecordContent && !isEditingRecord" class="action-buttons-main">
                    <button class="btn-modify-main" @click="editRecord">
                        <i class="el-icon-edit"></i> 修改
                    </button>
                    <button class="btn-print-main" @click="printMedicalRecord">
                        <i class="el-icon-printer"></i> 打印病历
                    </button>
                </div>
                 <div v-if="activeTab === 'record' && (!medicalRecordContent || isEditingRecord)" class="action-buttons-main">
                     <button class="btn-save-record" @click="saveRecord">
                         <i class="el-icon-check"></i> 保存病历
                     </button>
                </div>
            </div>
            <div v-show="activeTab === 'prescription'">
                <!-- EDIT MODE Prescription Table (Fig 2) -->
                <div v-if="isEditingPrescription" class="prescription-edit-content">
                    <div class="prescription-actions">
                        <button @click="openDrugModal"><i class="el-icon-plus"></i> 药物</button>
                        <button disabled><i class="el-icon-copy-document"></i> 同组</button>
                        <button disabled><i class="el-icon-scissors"></i> 拆组</button>
                        <button @click="deleteSelectedRows"><i class="el-icon-delete"></i> 删除</button>
                    </div>
                    <div class="prescription-table-wrapper editable">
                        <table class="prescription-table-main editable">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" title="全选"></th>
                                    <th>组号</th>
                                    <th>内容</th>
                                    <th>规格</th>
                                    <th>*单次剂量</th>
                                    <th></th> <!-- Unit -->
                                    <th>*用法</th>
                                    <th>*频率</th>
                                    <th>给药时间</th>
                                    <th>天数</th>
                                    <th>*总量</th>
                                    <th></th> <!-- Unit -->
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in prescriptionItems" :key="item.id">
                                    <td><input type="checkbox" v-model="item.selected"></td>
                                    <td>{{ index + 1 }}</td> 
                                    <td><input type="text" v-model="item.content"></td>
                                    <td><input type="text" v-model="item.spec"></td>
                                    <td><input type="number" v-model="item.dose"></td>
                                    <td><input type="text" v-model="item.doseUnit" placeholder="单位"></td>
                                    <td>
                                        <select v-model="item.usage">
                                            <option value="">选择用法</option>
                                            <option value="口服(po)">口服(po)</option>
                                            <option value="静脉滴注(ivdrip)">静脉滴注(ivdrip)</option>
                                            <option value="外用">外用</option>
                                            <!-- Add more options -->
                                        </select>
                                    </td>
                                     <td>
                                        <select v-model="item.frequency">
                                            <option value="">选择频率</option>
                                             <option value="每天1次(qd)">每天1次(qd)</option>
                                             <option value="每天2次(bid)">每天2次(bid)</option>
                                             <option value="每天3次(tid)">每天3次(tid)</option>
                                             <!-- Add more options -->
                                        </select>
                                    </td>
                                    <td>
                                         <select v-model="item.timing">
                                             <option value="">选择时间</option>
                                             <option value=""></option>
                                             <option value="睡前(hs)">睡前(hs)</option>
                                              <!-- Add more options -->
                                         </select>
                                    </td>
                                    <td><input type="number" v-model="item.days"></td>
                                    <td><input type="number" v-model="item.total"></td>
                                    <td><input type="text" v-model="item.totalUnit" placeholder="单位"></td>
                                </tr>
                                <!-- Add Row Button -->
                                <tr>
                                    <td colspan="12" class="add-row-cell">
                                        <button @click="addRow" class="btn-add-row">+ 添加</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="prescription-instructions">
                        <ol>
                            <li>1, 无分组</li>
                            <li>2, 多选同组操作：A, 如所选药品中无组，则自动成为一组；B, 如所选药品中有一个组，则将单独的药品加入到此组末尾；C, 如所选药品中有不同组，则提示"不可将多个组合并"</li>
                            <li>3, 多选拆组操作：自动将所选药品中有组的全部分开</li>
                            <li>4, 同组后，次药行展示置顶图标，点击后自动将此药设为本组的主药</li>
                            <li>5, 左侧栏的长者个人信息的内容，全部快捷存储</li>
                        </ol>
                    </div>
                </div>

                 <!-- READ-ONLY MODE Prescription Table -->
                <div v-else class="prescription-table-wrapper">
                    <table class="prescription-table-main read-only">
                         <thead>
                            <tr>
                                <!-- Adjust headers for read-only view if needed -->
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
                             <!-- Iterate through prescription items -->
                            <tr v-for="item in prescriptionData?.items" 
                                :key="item.id"
                                :class="{'group-start': item.isGroupLead}">
                                <td>{{ item.group }}</td>
                                <td>
                                    <span v-if="item.isGroupLead" class="tag-item">{{ item.subItems ? item.subItems.length + 1 : 1 }}</span> 
                                    {{ item.content }}
                                </td>
                                <td>{{ item.spec }}</td>
                                <td>{{ item.dose }}{{ item.doseUnit }}</td>
                                <td>{{ item.usage }}</td>
                                <td>{{ item.frequency }}</td>
                                <td>{{ item.timing }}</td>
                                <td>{{ item.days }}</td>
                                <td>{{ item.total }}{{ item.totalUnit }}</td>
                                <td>{{ item.source }}</td>
                            </tr>
                            <!-- Render sub-items -->
                            <tr v-for="subItem in allSubItems" 
                                :key="subItem.uniqueId"
                                class="group-item" 
                                :class="{'last-item': subItem.isLast}">
                                <td></td>
                                <td>
                                    <span class="sub-item-indent" :class="{'last-indent': subItem.isLast}">
                                        {{ subItem.isLast ? '└' : '|' }}
                                    </span> 
                                    {{ subItem.content }}
                                </td>
                                <td>{{ subItem.spec }}</td>
                                <td>{{ subItem.dose }}{{ subItem.doseUnit }}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>{{ subItem.total }}{{ subItem.totalUnit }}</td>
                                <td>{{ subItem.source }}</td>
                            </tr>
                            <tr v-if="!prescriptionData || !prescriptionData.items || prescriptionData.items.length === 0">
                                <td colspan="10" class="no-data-row">暂无分组处方数据</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Electronic Medical Record Content -->
            <div v-show="activeTab === 'record'">
                <!-- View Mode (Fig. 1) -->
                <div v-if="medicalRecordContent && !isEditingRecord" class="record-view-content">
                    <div class="record-view-section">
                        <span class="label">主诉</span>
                        <p>{{ medicalRecordContent.chiefComplaint }}</p>
                    </div>
                    <div class="record-view-section">
                        <span class="label">现病</span>
                        <p>{{ medicalRecordContent.presentHistory }}</p>
                    </div>
                    <div class="record-view-section">
                        <span class="label">既往</span>
                        <p>{{ medicalRecordContent.pastHistory }}</p>
                    </div>
                     <div class="record-view-section">
                        <span class="label">体检情况</span>
                        <p>T <span class="vital-value">{{ medicalRecordContent.temperature }}</span>℃，{{ medicalRecordContent.physicalExamNotes }}</p>
                    </div>
                     <div class="record-view-section">
                        <span class="label">临床诊断</span>
                        <p>{{ medicalRecordContent.clinicalDiagnosis }}</p>
                    </div>
                    <div class="record-view-section">
                        <span class="label">处理意见</span>
                        <p>{{ medicalRecordContent.treatmentOpinion }}</p>
                    </div>
                </div>

                <!-- Edit/Create Mode (Fig. 3) -->
                <div v-else class="record-edit-form">
                    <div class="template-selector-container">
                        <div class="template-selector-header">
                            <button class="btn-template" :class="{active: showTemplateSelectorContent}" @click.stop="toggleTemplateSelector">
                                <i class="el-icon-folder-opened"></i> 选择模板
                            </button>
                            <span class="template-hint">另存为模</span>
                        </div>
                        <!-- Template Search and List (Conditionally Shown) -->
                        <div v-if="showTemplateSelectorContent" class="template-selector-content">
                            <div class="template-search">
                                <input type="text" v-model="templateSearch" placeholder="模板名称">
                                <i class="el-icon-search"></i>
                            </div>
                            <ul class="template-list">
                                <li v-for="template in filteredTemplates" 
                                    :key="template.id" 
                                    @click="selectTemplate(template)">
                                    <span class="bullet"></span> {{ template.name }}
                                </li>
                                <li v-if="filteredTemplates.length === 0" class="no-results">
                                    无分组匹配模版
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="chiefComplaint">主诉</label>
                        <textarea id="chiefComplaint" v-model="recordForm.chiefComplaint" rows="2"></textarea>
                    </div>
                     <div class="form-group">
                        <label for="presentHistory">现病</label>
                        <textarea id="presentHistory" v-model="recordForm.presentHistory" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="pastHistory">既往</label>
                        <textarea id="pastHistory" v-model="recordForm.pastHistory" rows="2"></textarea>
                    </div>
                    <div class="form-group form-group-inline">
                        <label>体检情况</label>
                        <div class="inline-inputs">
                            <span>T</span> <input type="text" v-model="recordForm.temperature" placeholder="℃"> <span>℃</span>
                            <span>P</span> <input type="text" v-model="recordForm.pulse" placeholder="次/分"> <span>次/分</span>
                            <span>R</span> <input type="text" v-model="recordForm.respiration" placeholder="次/分"> <span>次/分</span>
                            <span>BP</span> <input type="text" v-model="recordForm.bpSystolic" placeholder="收缩压"> / <input type="text" v-model="recordForm.bpDiastolic" placeholder="舒张压"> <span>mmHg</span>
                        </div>
                         <textarea v-model="recordForm.physicalExamNotes" rows="3" placeholder="体格描述"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="auxiliaryExam">辅助检查</label>
                        <textarea id="auxiliaryExam" v-model="recordForm.auxiliaryExam" rows="3" placeholder="辅助检查结果"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="clinicalDiagnosis">临床诊断</label>
                        <textarea id="clinicalDiagnosis" v-model="recordForm.clinicalDiagnosis" rows="2" placeholder="输入名称/编码/助记码，按回车添加"></textarea>
                    </div>
                     <div class="form-group">
                        <label for="treatmentOpinion">处理意见</label>
                        <textarea id="treatmentOpinion" v-model="recordForm.treatmentOpinion" rows="3"></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Medical Record Print Modal -->
     <div v-if="showRecordPrintModal" class="record-print-modal-backdrop" @click="closeRecordPrintModal">
        <div class="record-print-modal" @click.stop>
            <div class="record-print-header">
                <h3>电子病历打印预览</h3>
                 <button class="close-btn" @click="closeRecordPrintModal">×</button>
            </div>
             <div class="record-print-content">
                <div class="record-print-header-info">
                     <span class="print-date">2024年5月12日</span>
                     <span class="print-institution">XX机构</span>
                 </div>
                 <div class="record-print-section">
                    <span class="label">主诉:</span>
                    <span class="content">{{ medicalRecordContent?.chiefComplaint }}</span>
                </div>
                 <div class="record-print-section">
                    <span class="label">现病史:</span>
                    <span class="content">{{ medicalRecordContent?.presentHistory }}</span>
                </div>
                 <div class="record-print-section">
                    <span class="label">既往史:</span>
                    <span class="content">{{ medicalRecordContent?.pastHistory }}</span>
                </div>
                 <div class="record-print-section">
                    <span class="label">体检:</span>
                    <span class="content">T {{ medicalRecordContent?.temperature }}℃，{{ medicalRecordContent?.physicalExamNotes }}</span>
                </div>
                 <div class="record-print-section">
                     <span class="label">辅助检查</span>
                     <span class="content">{{ medicalRecordContent?.auxiliaryExam }}</span>
                 </div>
                 <div class="record-print-section">
                    <span class="label">诊断:</span>
                    <span class="content">{{ medicalRecordContent?.clinicalDiagnosis }}</span>
                </div>
                 <div class="record-print-section">
                    <span class="label">处理:</span>
                     <span class="content">{{ medicalRecordContent?.treatmentOpinion }}</span>
                </div>
                <div class="record-print-signature">
                    <span>医师签名:</span>
                    <span>{{ medicalRecordContent?.doctorSignature || '张医生' }}</span>
                </div>
            </div>
             <div class="record-print-footer">
                <button class="btn-close-print" @click="closeRecordPrintModal">关闭</button>
                 <button class="btn-confirm-print" @click="doPrintRecord"><i class="el-icon-printer"></i> 打印病历</button>
            </div>
        </div>
    </div>

    <!-- Drug Selection Modal -->
    <div v-if="showDrugModal" class="drug-modal-backdrop" @click.self="closeDrugModal">
        <div class="drug-modal">
            <div class="drug-modal-header">
                <h3>添加药品</h3>
                <button class="close-btn" @click="closeDrugModal">&times;</button>
            </div>
            <div class="drug-modal-body">
                <div class="drug-search-controls">
                    <select v-model="drugFilter.category" class="drug-category-select">
                        <option value="all">全部类型</option>
                        <option value="western">西药</option>
                        <option value="chinese">中成药</option>
                        <option value="herbal">中草药</option>
                    </select>
                    <div class="drug-search-input-wrapper">
                        <input type="text" v-model="drugFilter.keyword" placeholder="名称/条码/编码/助记码" @keyup.enter="searchDrugs">
                        <i class="el-icon-search" @click="searchDrugs"></i>
                    </div>
                </div>
                <div class="drug-action-buttons">
                     <button class="drug-tab-btn active">药品库</button>
                     <button class="drug-tab-btn">长者药品({{ elderDrugCount }})</button>
                 </div>

                <div class="drug-list-container">
                    <table class="drug-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;"><input type="checkbox" @change="toggleSelectAllDrugs" :checked="isAllDrugsSelected"></th>
                                <th>药品名称</th>
                                <th>规格</th>
                                <th>包装单位</th>
                                <th>单价(元)</th>
                                <th>可用库存</th>
                                <th>厂家</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="paginatedDrugs.length === 0">
                                <td colspan="7" class="no-drugs">暂无分组药品数据</td>
                            </tr>
                            <tr v-for="drug in paginatedDrugs" :key="drug.id">
                                <td><input type="checkbox" :value="drug.id" v-model="selectedDrugIdsInModal"></td>
                                <td>{{ drug.name }}<br><span class="drug-code">{{ drug.code }}</span></td>
                                <td>{{ drug.spec }}</td>
                                <td>{{ drug.packageUnit }}</td>
                                <td>{{ drug.price?.toFixed(2) }}</td>
                                <td>{{ drug.stock }}</td>
                                <td>{{ drug.manufacturer }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="drug-pagination">
                     <button @click="changeDrugPage(drugPagination.currentPage - 1)" :disabled="drugPagination.currentPage <= 1">&lt;</button>
                     <span>
                        <button v-for="page in drugPageNumbers" :key="page"
                                @click="changeDrugPage(page)"
                                :class="{ active: page === drugPagination.currentPage }">
                            {{ page }}
                        </button>
                     </span>
                     <button @click="changeDrugPage(drugPagination.currentPage + 1)" :disabled="drugPagination.currentPage >= totalDrugPages">&gt;</button>
                </div>
            </div>
            <div class="drug-modal-footer">
                <div class="hint-box">
                    西医处方，只展示西药+中成药<br>
                    需要提供分页，跨TAB页，跨搜索条件多选能力；<br>
                    【可选交互】本页面勾选时，一次最多选择5种药物（选第六个的时候，弹出提示：一次最多只能选择5种药物）
                </div>
                <button class="btn-cancel-drug" @click="closeDrugModal">取消</button>
                <button class="btn-confirm-drug" @click="confirmAddDrugs">提交</button>
            </div>
        </div>
    </div>

    <!-- 处方打印预览弹窗 -->
    <div v-if="showPrescriptionPrintModal" class="prescription-print-modal-backdrop" @click="closePrescriptionPrintModal">
      <div class="prescription-print-modal" @click.stop>
        <div class="prescription-print-header">
          <h3>电子处方打印预览</h3>
          <button class="close-btn" @click="closePrescriptionPrintModal">×</button>
        </div>
        <div class="prescription-print-content">
          <div class="print-header">
            <h2 class="hospital-name">上海XX机构处方笺</h2>
            <div class="prescription-number">No. 0051258</div>
          </div>
          <div class="patient-print-info">
            <div class="info-print-row">
              <span>姓名: <b>{{ prescriptionData && prescriptionData.patientName || '王大勇' }}</b></span>
              <span>性别: <b>男</b></span>
              <span>年龄: <b>86</b></span>
              <span>入院号: <b>F10245</b></span>
              <span>床位: <b>{{ prescriptionData && prescriptionData.roomBed || '2206-5' }}</b></span>
            </div>
            <div class="info-print-row">
              <span>科别: <b>内科</b></span>
              <span>费别: <b>医保</b></span>
              <span>医保号: <b>{{ prescriptionData && prescriptionData.insuranceNo || 'D053252131' }}</b></span>
              <span>日期: <b>2024-05-16</b></span>
            </div>
            <div class="info-print-row diagnosis">
              <span>诊断: <b>{{ prescriptionData && prescriptionData.diagnosis || '头痛' }}</b></span>
            </div>
          </div>
          
          <div class="rx-symbol">Rx:</div>
          
          <div class="prescription-print-items">
            <div v-for="(item, index) in prescriptionData?.items" :key="item.id" class="prescription-print-item">
              <div class="item-number">{{ index + 1 }}</div>
              <div class="item-details">
                <div class="item-name">{{ item.content }}</div>
                <div class="item-spec">{{ item.spec }}</div>
                <div class="item-usage">Sig: {{ item.usage }} {{ item.frequency }} {{ item.timing ? ' ' + item.timing : '' }} {{ item.days ? 'x' + item.days + '天' : '' }}</div>
              </div>
              <div class="item-quantity">{{ item.total }}{{ item.totalUnit }}</div>
            </div>
            <div v-if="!prescriptionData?.items || prescriptionData.items.length === 0" class="no-prescription-items">
              暂无处方项目
            </div>
          </div>
          
          <div class="prescription-print-footer">
            <div class="signatures">
              <div class="signature-item">
                <span>审核/调配:</span>
                <span class="signature-line"></span>
              </div>
              <div class="signature-item">
                <span>核对/发药:</span>
                <span class="signature-line"></span>
              </div>
              <div class="signature-item">
                <span>医师:</span>
                <span class="signature-line"></span>
              </div>
            </div>
            <div class="price-info">
              <span>金额:</span>
              <span class="signature-line"></span>
            </div>
          </div>
        </div>
        <div class="prescription-print-footer">
          <button class="btn-close-print" @click="closePrescriptionPrintModal">关闭</button>
          <button class="btn-confirm-print" @click="doPrintPrescription"><i class="el-icon-printer"></i> 打印处方</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrescriptionDetail',
  props: ['id'],
  data() {
    return {
      activeTab: 'prescription',
      medicalRecordContent: null,
      isEditingRecord: false,
      isEditingPrescription: false,
      prescriptionItems: [],
      recordForm: {
        chiefComplaint: '',
        presentHistory: '',
        pastHistory: '',
        temperature: '',
        pulse: '',
        respiration: '',
        bpSystolic: '',
        bpDiastolic: '',
        physicalExamNotes: '',
        auxiliaryExam: '',
        clinicalDiagnosis: '',
        treatmentOpinion: ''
      },
      showRecordPrintModal: false,
      showTemplateSelectorContent: false,
      templateSearch: '',
      templates: [
        { id: 't1', name: '感冒模板', content: { chiefComplaint: '发热、咳嗽2天', presentHistory: '2天前受凉后出现发热...', clinicalDiagnosis: '上呼吸道感染' } },
        { id: 't2', name: '高血压随访', content: { chiefComplaint: '高血压随访', presentHistory: '长期服用降压药...', clinicalDiagnosis: '原发性高血压' } },
      ],
      selectedRecordTemplateId: null,
      prescriptionData: null,
      showDrugModal: false,
      drugFilter: {
        category: 'all',
        keyword: ''
      },
      selectedDrugIdsInModal: [],
      drugPagination: {
        currentPage: 1,
        pageSize: 10
      },
      availableDrugs: [
        { id: 'd1', name: '阿司匹林肠溶片', spec: '25mg*20片/盒', packageUnit: '盒', price: 35.5, stock: 200, manufacturer: '拜耳医药', code: 'ASP001', category: 'western' },
        { id: 'd2', name: '布洛芬缓释胶囊', spec: '0.3g*10粒/盒', packageUnit: '盒', price: 28.0, stock: 150, manufacturer: '西南制药', code: 'IBU002', category: 'western' },
        { id: 'd3', name: '头孢克洛胶囊', spec: '0.25g*6粒/盒', packageUnit: '盒', price: 45.8, stock: 80, manufacturer: '哈药制药', code: 'CEF003', category: 'western' },
      ],
      
      // 新增数据
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
        }
        // ... 可以添加更多测试数据
      ],
      showPrescriptionPrintModal: false, // 新增处方打印预览弹窗控制
    }
  },
  computed: {
    isReadOnly() {
      return !this.isEditingPrescription && this.activeTab === 'prescription';
    },
    isRecordReadOnly() {
      return !this.isEditingRecord && this.activeTab === 'record';
    },
    filteredRecordTemplates() {
      if (!this.templateSearch) {
        return this.templates;
      }
      const lowerSearch = this.templateSearch.toLowerCase();
      return this.templates.filter(t => t.name.toLowerCase().includes(lowerSearch));
    },
    filteredAvailableDrugs() {
      let drugs = this.availableDrugs;
      // Filter by category
      if (this.drugFilter.category !== 'all') {
        drugs = drugs.filter(d => d.category === this.drugFilter.category);
      }
      // Filter by keyword
      if (this.drugFilter.keyword) {
        const lowerKeyword = this.drugFilter.keyword.toLowerCase();
        drugs = drugs.filter(d =>
          d.name.toLowerCase().includes(lowerKeyword) ||
          d.code.toLowerCase().includes(lowerKeyword)
          // Add other searchable fields like pinyin etc. if needed
        );
      }
       // Requirement: "西医处方，只展示西药+中成药"
       drugs = drugs.filter(d => d.category === 'western' || d.category === 'chinese');

      return drugs;
    },
    totalDrugPages() {
      return Math.ceil(this.filteredAvailableDrugs.length / this.drugPagination.pageSize);
    },
    paginatedDrugs() {
      const start = (this.drugPagination.currentPage - 1) * this.drugPagination.pageSize;
      const end = start + this.drugPagination.pageSize;
      return this.filteredAvailableDrugs.slice(start, end);
    },
    isAllDrugsSelected() {
      if (this.paginatedDrugs.length === 0) return false;
      return this.paginatedDrugs.every(drug => this.selectedDrugIdsInModal.includes(drug.id));
    },
    drugPageNumbers() {
      const pages = [];
      const maxPagesToShow = 5; // Example: Show up to 5 page numbers
      let startPage = Math.max(1, this.drugPagination.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalDrugPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
       // Add ellipsis if needed (simplified version)
       if (startPage > 1) pages.unshift('...');
       if (endPage < this.totalDrugPages) pages.push('...');

      return pages; // Note: ellipsis are just strings here, clicking them needs special handling or disable them
    },
    allSubItems() {
      if (!this.prescriptionData?.items) return [];
      
      const subItems = [];
      this.prescriptionData.items.forEach(item => {
        if (item.subItems && item.subItems.length) {
          item.subItems.forEach((subItem, index) => {
            subItems.push({
              ...subItem,
              uniqueId: `${item.id}-${subItem.id}`,
              isLast: index === item.subItems.length - 1
            });
          });
        }
      });
      return subItems;
    },
    pageNumbers() {
      const pages = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'record' && !this.medicalRecordContent) {
        this.isEditingRecord = true
      } else if (tab === 'record' && this.medicalRecordContent) {
        this.isEditingRecord = false
      }
    },
    editRecord() {
      if (this.medicalRecordContent) {
        this.recordForm = { ...this.medicalRecordContent }
      }
      this.isEditingRecord = true
    },
    saveRecord() {
      this.medicalRecordContent = { ...this.recordForm }
      this.isEditingRecord = false
      alert('病历已保存')
    },
    editPrescription() {
      this.isEditingPrescription = true
    },
    savePrescription() {
      this.isEditingPrescription = false
      alert('处方已保存')
    },
    addRow() {
      this.prescriptionItems.push({
        id: Date.now(),
        content: '',
        spec: '',
        dose: '',
        doseUnit: '',
        usage: '',
        frequency: '',
        timing: '',
        days: '',
        total: '',
        totalUnit: '',
        selected: false
      })
    },
    deleteSelectedRows() {
      this.prescriptionItems = this.prescriptionItems.filter(item => !item.selected)
    },
    openDrugModal() {
      this.selectedDrugIdsInModal = []
      this.drugPagination.currentPage = 1
      this.showDrugModal = true
    },
    closeDrugModal() {
      this.showDrugModal = false;
    },
    searchDrugs() {
      this.drugPagination.currentPage = 1; // Reset page on new search
      // The computed property `filteredAvailableDrugs` handles the filtering
    },
    toggleSelectAllDrugs(event) {
      if (event.target.checked) {
        // Select all drugs on the CURRENT page
        this.paginatedDrugs.forEach(drug => {
          if (!this.selectedDrugIdsInModal.includes(drug.id)) {
            this.selectedDrugIdsInModal.push(drug.id);
          }
        });
      } else {
        // Deselect all drugs on the CURRENT page
        const pageDrugIds = this.paginatedDrugs.map(d => d.id);
        this.selectedDrugIdsInModal = this.selectedDrugIdsInModal.filter(id => !pageDrugIds.includes(id));
      }
    },
    changeDrugPage(page) {
      if (page >= 1 && page <= this.totalDrugPages) {
        this.drugPagination.currentPage = page;
      }
      // Handle ellipsis clicks if implemented more robustly
    },
    confirmAddDrugs() {
      const drugsToAdd = this.availableDrugs.filter(drug => this.selectedDrugIdsInModal.includes(drug.id));

      // 检查药品数量限制（最多5种）
      const currentDrugCount = this.prescriptionItems?.length || 0;
      if (currentDrugCount + drugsToAdd.length > 5) {
          alert('一次最多只能选择5种药品');
          return;
      }

      if (drugsToAdd.length > 0) {
          const newItems = drugsToAdd.map(drug => ({
              id: Date.now() + Math.random(), // 生成唯一ID
              content: drug.name,
              spec: drug.spec,
              dose: '',
              doseUnit: '',
              usage: '',
              frequency: '',
              timing: '',
              days: '',
              total: '',
              totalUnit: drug.packageUnit, // 使用药品的包装单位
              selected: false
          }));

          // 如果prescriptionItems不存在，初始化为空数组
          if (!this.prescriptionItems) {
              this.prescriptionItems = [];
          }
          
          // 添加新药品到列表
          this.prescriptionItems.push(...newItems);
      }
      
      this.closeDrugModal();
    },
    printMedicalRecord() {
      // 确保有内容才打开打印预览
       if (this.medicalRecordContent) {
            this.showRecordPrintModal = true;
       } else {
           alert('没有可打印的病历内容');
       }
    },
    closeRecordPrintModal() {
      this.showRecordPrintModal = false;
    },
    doPrintRecord() {
      // TODO: 实现调用浏览器打印功能的逻辑，可能需要打印特定区域
      alert('正在打印病历...');
      this.closeRecordPrintModal();
    },
    toggleTemplateSelector() {
      this.showTemplateSelectorContent = !this.showTemplateSelectorContent;
    },
    selectTemplate(template) {
      this.selectedRecordTemplateId = template.id;
      // Deep copy template content to avoid modifying original
      this.medicalRecordContent = JSON.parse(JSON.stringify(template.content));
      this.showTemplateSelectorContent = false; // Close dropdown
       this.templateSearch = ''; // Clear search
       // Optionally focus the first field or scroll
    },
    loadExistingData() {
      if (this.id === '0002658') {
        // 新增状态
        this.isEditingPrescription = true;
        this.isEditingRecord = true;
        this.prescriptionData = { items: [] };
        this.prescriptionItems = [];
        this.medicalRecordContent = null;
      } else if (this.id === '0023566') {
        // 细菌性上呼吸道感染的数据
        this.isEditingPrescription = false;
        this.isEditingRecord = false;
        this.prescriptionData = {
          items: [
            {
              id: 1,
              content: '阿司匹林肠溶片',
              spec: '0.25g*20粒/盒',
              dose: '0.25g',
              usage: '口服(po)',
              frequency: '每天1次(qd)',
              timing: '睡前(hs)',
              days: 4,
              total: 3,
              totalUnit: '盒',
              source: '内科'
            },
            {
              id: 2,
              content: '(维他命D)维生素C',
              spec: '10ml*5支/盒',
              dose: '适量',
              usage: '外用',
              frequency: '每天3次(tid)',
              timing: '',
              days: 7,
              total: 3,
              totalUnit: '瓶',
              source: '自开'
            },
            {
              id: 3,
              content: '0.9%氯化钠注射液',
              spec: '500ml*1瓶/盒',
              dose: '0.25g',
              usage: '静脉滴注(ivdrip)',
              frequency: '每天1次(qd)',
              timing: '',
              days: 3,
              total: 1,
              totalUnit: '盒',
              source: '内科'
            }
          ]
        };
        this.medicalRecordContent = {
          chiefComplaint: '咳嗽无痰4天有余，加重1日',
          presentHistory: '咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日',
          pastHistory: '咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日',
          temperature: '37.2',
          physicalExamNotes: '咳嗽无痰4天有余，加重1日',
          clinicalDiagnosis: '上呼吸道感染',
          treatmentOpinion: '注意休息，按时服药'
        };
      } else if (this.id === '0002365') {
        // 甲型流感的数据
        this.isEditingPrescription = false;
        this.isEditingRecord = false;
        this.prescriptionData = {
          items: [
            {
              id: 1,
              content: '甲型流感',
              spec: '其他',
              dose: '0.25g',
              usage: '外用',
              frequency: '',
              timing: '',
              days: null,
              total: 1,
              totalUnit: '盒',
              source: 'XXXX'
            }
          ]
        };
        this.medicalRecordContent = {
          chiefComplaint: '发热、咳嗽3天',
          presentHistory: '3天前开始出现症状...',
          pastHistory: '否认特殊疾病史',
          temperature: '38.5',
          clinicalDiagnosis: '甲型流感',
          treatmentOpinion: '遵医嘱服药'
        };
      }
    },
    changePage(page) {
      this.currentPage = page;
    },
    openPrintPreview(record) {
      this.selectedRecord = record;
      this.showPrintPreview = true;
    },
    closePrintPreview() {
      this.showPrintPreview = false;
      this.selectedRecord = null;
    },
    printPrescription() {
      // 显示处方打印预览弹窗，而不是直接打印
      this.showPrescriptionPrintModal = true;
    },
    closePrescriptionPrintModal() {
      this.showPrescriptionPrintModal = false;
    },
    doPrintPrescription() {
      // 实际执行打印操作
      window.print();
      this.closePrescriptionPrintModal();
    },
    openPrescriptionDetail(record) {
      this.selectedRecord = record;
      this.showPrescriptionDetail = true;
    },
    closePrescriptionDetail() {
      this.showPrescriptionDetail = false;
      this.selectedRecord = null;
    }
  },
  mounted() {
    console.log('Prescription/Record ID from route:', this.id)
    if (this.id === '0002658') {
      // 新增状态
      this.isEditingPrescription = true;
      this.isEditingRecord = true;
      this.prescriptionData = { items: [] };
      this.prescriptionItems = [];
      this.medicalRecordContent = null;
    } else if (this.id === '0023566') {
      // 细菌性上呼吸道感染的数据
      this.isEditingPrescription = false;
      this.isEditingRecord = false;
      this.prescriptionData = {
        items: [
          {
            id: 1,
            content: '阿司匹林肠溶片',
            spec: '0.25g*20粒/盒',
            dose: '0.25g',
            usage: '口服(po)',
            frequency: '每天1次(qd)',
            timing: '睡前(hs)',
            days: 4,
            total: 3,
            totalUnit: '盒',
            source: '内科'
          },
          {
            id: 2,
            content: '(维他命D)维生素C',
            spec: '10ml*5支/盒',
            dose: '适量',
            usage: '外用',
            frequency: '每天3次(tid)',
            timing: '',
            days: 7,
            total: 3,
            totalUnit: '瓶',
            source: '自开'
          },
          {
            id: 3,
            content: '0.9%氯化钠注射液',
            spec: '500ml*1瓶/盒',
            dose: '0.25g',
            usage: '静脉滴注(ivdrip)',
            frequency: '每天1次(qd)',
            timing: '',
            days: 3,
            total: 1,
            totalUnit: '盒',
            source: '内科'
          }
        ]
      };
      this.medicalRecordContent = {
        chiefComplaint: '咳嗽无痰4天有余，加重1日',
        presentHistory: '咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日',
        pastHistory: '咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日，咳嗽无痰4天有余，加重1日',
        temperature: '37.2',
        physicalExamNotes: '咳嗽无痰4天有余，加重1日',
        clinicalDiagnosis: '上呼吸道感染',
        treatmentOpinion: '注意休息，按时服药'
      };
    } else if (this.id === '0002365') {
      // 甲型流感的数据
      this.isEditingPrescription = false;
      this.isEditingRecord = false;
      this.prescriptionData = {
        items: [
          {
            id: 1,
            content: '甲型流感',
            spec: '其他',
            dose: '0.25g',
            usage: '外用',
            frequency: '',
            timing: '',
            days: null,
            total: 1,
            totalUnit: '盒',
            source: 'XXXX'
          }
        ]
      };
      this.medicalRecordContent = {
        chiefComplaint: '发热、咳嗽3天',
        presentHistory: '3天前开始出现症状...',
        pastHistory: '否认特殊疾病史',
        temperature: '38.5',
        clinicalDiagnosis: '甲型流感',
        treatmentOpinion: '遵医嘱服药'
      };
    } else if (this.id) {
      // 修改状态 - 加载现有数据
      this.isEditingPrescription = false;
      this.isEditingRecord = false;
      // TODO: 这里应该从后端加载数据
      this.loadExistingData();
    }
  }
}
</script>

<style scoped>
.prescription-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.back-button-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.back-btn {
  padding: 8px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
  color: #606266;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #f5f7fa;
}

.detail-no {
  font-size: 14px;
  color: #606266;
}

.tag-a1 {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  margin-left: 5px;
}

.detail-content-wrapper {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.patient-info-sidebar {
  width: 280px;
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.info-item .value {
  color: #303133;
  flex: 1;
}

.info-item .value.name {
  font-weight: 500;
  font-size: 16px;
}

.allergies-item {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  margin-top: 15px;
}

.allergies-item .value.allergies {
  color: #f56c6c;
}

.prescription-main-content {
  flex: 1;
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
}

.tabs-detail {
  display: flex;
  gap: 20px;
}

.tab {
  padding: 8px 15px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.tab i {
  font-size: 16px;
}

.prescription-header-content {
    display: flex;
    justify-content: flex-start; /* Align items to the start */
    align-items: center;
    flex-grow: 0; /* Don't allow it to grow excessively */
    gap: 15px; /* Space between diagnosis and buttons */
    margin-left: auto; /* Push to the right, beside tabs */
}

.diagnosis-edit {
    display: flex;
    align-items: center;
    gap: 8px;
}

.diagnosis-edit .label {
    color: #909399;
    font-size: 14px;
    white-space: nowrap;
}

.tag-diagnosis {
    background-color: #f0f9eb; /* Light green background */
    color: #67c23a; /* Green text */
    border: 1px solid #e1f3d8; /* Light green border */
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 13px;
    margin-right: 5px;
}

.diagnosis-edit input[type="text"] {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 6px 10px; /* Adjusted padding */
    font-size: 13px;
    width: 220px; /* Adjust as needed */
    transition: border-color 0.2s ease;
}
.diagnosis-edit input[type="text"]:focus {
    border-color: #409eff;
    outline: none;
}

/* Keep action buttons grouped */
.prescription-header-content .action-buttons-main {
    margin-left: 0; /* Reset margin if it was moved */
}

/* Styles for Prescription Actions (Add Drug, Group, Delete etc.) */
.prescription-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px; /* Increased space below actions */
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed; /* Consistent border */
}

.prescription-actions button {
    padding: 7px 15px; /* Consistent padding */
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
    color: #606266;
    cursor: pointer;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.prescription-actions button i {
    font-size: 15px;
}

.prescription-actions button:hover {
    background-color: #ecf5ff;
    color: #409eff;
    border-color: #b3d8ff;
}

.prescription-actions button:active {
    background-color: #d9ecff;
    border-color: #a0cfff;
}

.prescription-actions button:disabled {
    color: #c0c4cc;
    cursor: not-allowed;
    background-color: #f5f7fa;
    border-color: #e4e7ed;
}
.prescription-actions button:disabled:hover {
    background-color: #f5f7fa;
    color: #c0c4cc;
    border-color: #e4e7ed;
}

/* Style for Delete button */
.prescription-actions button.delete-btn {
    color: #f56c6c;
    border-color: #fbc4c4;
}
.prescription-actions button.delete-btn:hover {
    background-color: #fef0f0;
    color: #f78989;
    border-color: #fcd3d3;
}
.prescription-actions button.delete-btn:active {
    background-color: #fde2e2;
    color: #f78989;
    border-color: #fcd3d3;
}

/* --- Table Styles --- */
.prescription-table-wrapper {
    margin-top: 20px; /* Space above table */
    border: 1px solid #e4e7ed; /* Lighter border */
    border-radius: 4px;
    overflow: hidden; /* Prevents box-shadow leak */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); /* Subtle shadow */
}

.prescription-table-main {
  width: 100%;
  border-collapse: collapse; /* Ensure borders are clean */
}

/* Common cell styles */
.prescription-table-main th,
.prescription-table-main td {
  padding: 12px 10px; /* Increased padding */
  text-align: left;
  font-size: 13px;
  vertical-align: middle; /* Align vertically */
  border-bottom: 1px solid #f0f2f5; /* Lighter row separator */
}

/* Header styles */
.prescription-table-main th {
  background-color: #f9fafc; /* Lighter header background */
  color: #606266; /* Darker header text */
  font-weight: 500; /* Medium weight */
  white-space: nowrap;
}

/* Remove right border logic - use border-bottom only */
.prescription-table-main th,
.prescription-table-main td {
  border-right: none;
}


/* Read-Only Table Specific Styles */
.prescription-table-main.read-only td {
  color: #303133; /* Standard text color */
  line-height: 1.5;
}

/* Zebra striping for read-only table */
.prescription-table-main.read-only tbody tr:not(.group-item):nth-child(odd) {
   /* background-color: #fafcff; /* Very light blue stripe - Apply only to non-group items if complex */
}
/* Zebra striping for read-only table (simpler version) */
.prescription-table-main.read-only tbody tr:nth-child(odd) {
    /* Consider adding if group logic allows simple striping */
}

.tag-item {
    display: inline-block;
    background-color: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 11px;
    margin-right: 6px;
    font-weight: bold;
    min-width: 18px;
    text-align: center;
}

.sub-item-indent {
    display: inline-block;
    width: 20px; /* Indentation width */
    text-align: center;
    margin-right: 5px;
    color: #c0c4cc; /* Lighter color for lines */
    position: relative;
}

.group-item td {
    padding-left: 15px; /* Indent group items */
    position: relative;
    border-bottom-color: #f5f7fa; /* Lighter border for sub-items */
}

/* --- End Table Styles --- */

/* --- EMR View Mode Styles --- */
.record-view-content {
    padding: 20px 10px; /* Add some padding */
    line-height: 1.7; /* Improve readability */
    color: #303133; /* Standard text color */
}

.record-view-section {
    margin-bottom: 20px; /* Space between sections */
    display: flex; /* Align label and content */
    flex-direction: column; /* Stack label above content */
}

.record-view-section .label {
    font-weight: 600; /* Make label bold */
    color: #606266; /* Slightly lighter color for label */
    margin-bottom: 8px; /* Space between label and content */
    font-size: 14px; /* Match other labels */
}

.record-view-section p {
    margin: 0; /* Remove default paragraph margin */
    font-size: 14px; /* Standard content size */
    color: #303133;
    white-space: pre-wrap; /* Preserve line breaks from data */
}

.record-view-section .vital-value {
    font-weight: 500; /* Slightly bolder vital signs */
    color: #409eff; /* Highlight vital signs */
    margin: 0 2px;
}


/* --- Edit Form Styles --- */
.record-edit-form {
    padding: 25px; /* Increased padding */
    border: none; /* Remove border, main content has it */
    border-radius: 0;
    margin-top: 20px;
}

.template-selector-container {
    margin-bottom: 30px; /* Increased margin */
    position: relative; /* Needed for dropdown positioning */
}

.template-selector-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px; /* Space below header */
}

.btn-template {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    padding: 8px 15px; /* Adjusted padding */
    border-radius: 4px;
    cursor: pointer;
    margin-right: 15px;
    font-size: 14px; /* Increased size */
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}
.btn-template i {
    font-size: 16px;
}

.btn-template:hover,
.btn-template.active {
    border-color: #409eff;
    color: #409eff;
    background-color: #ecf5ff;
}

.template-hint {
    color: #409eff; /* Blue color for link-like appearance */
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s ease;
}
.template-hint:hover {
    color: #66b1ff;
}

/* Template Dropdown Content */
.template-selector-content {
    border: 1px solid #e4e7ed; /* Lighter border */
    border-radius: 4px;
    width: 350px; /* Wider dropdown */
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1); /* Standard dropdown shadow */
    z-index: 10; /* Ensure it's above other content */
    max-height: 300px; /* Increased max height */
    display: flex;
    flex-direction: column;
    margin-top: 8px; /* Space from header */
    position: absolute; /* Position absolutely */
    top: 100%;
    left: 0;
}

.template-search {
  padding: 8px 12px; /* Adjusted padding */
  border-bottom: 1px solid #f0f2f5; /* Lighter separator */
  display: flex;
  align-items: center;
}

.template-search input {
  flex-grow: 1;
  border: 1px solid #dcdfe6; /* Keep border */
  outline: none;
  font-size: 13px;
  padding: 6px 10px; /* Input padding */
  border-radius: 3px;
}
.template-search input:focus {
    border-color: #409eff;
}

.template-search .el-icon-search {
    color: #c0c4cc;
    margin-left: 10px;
    cursor: pointer;
    font-size: 16px;
}

.template-list {
  list-style: none;
  margin: 0;
  padding: 5px 0;
  overflow-y: auto;
  flex-grow: 1;
}

.template-list li {
  padding: 8px 15px; /* Increased padding */
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.template-list li .bullet {
    font-size: 16px;
    margin-right: 10px; /* Increased margin */
    color: #c0c4cc; /* Lighter bullet */
    line-height: 1; /* Align bullet better */
}

.template-list li:hover {
  background-color: #f5f7fa; /* Subtle hover */
  color: #409eff;
}

.template-list .no-results {
    padding: 15px; /* Increased padding */
    color: #909399;
    font-style: italic;
    cursor: default;
    text-align: center;
}
.template-list .no-results:hover {
    background-color: transparent;
    color: #909399;
}

/* Form Group Styling */
.form-group {
    margin-bottom: 22px; /* Increased margin */
}

.form-group label {
    display: block;
    margin-bottom: 8px; /* Increased margin */
    font-weight: 500; /* Medium weight */
    font-size: 14px;
    color: #303133; /* Darker label */
}

.form-group textarea,
.form-group input[type="text"]:not(.inline-inputs input) {
    width: 100%;
    padding: 10px 12px; /* Increased padding */
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    color: #303133;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
}
.form-group textarea {
    resize: vertical;
    min-height: 60px; /* Minimum height for textareas */
}

.form-group textarea:focus,
.form-group input[type="text"]:not(.inline-inputs input):focus {
    border-color: #409eff;
    outline: none;
}

/* Inline Vital Signs */
.form-group-inline > label {
     margin-bottom: 12px;
}

.inline-inputs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 15px; /* Adjusted gaps */
    margin-bottom: 12px;
}

.inline-inputs span {
    color: #606266;
    font-size: 14px;
    margin-left: 3px;
    margin-right: 12px;
    white-space: nowrap;
}
.inline-inputs span:last-of-type {
    margin-right: 0; /* Remove margin for last unit */
}

.inline-inputs input[type="text"] {
    width: 90px; /* Adjusted width */
    padding: 10px; /* Increased padding */
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
    transition: border-color 0.2s ease;
}
.inline-inputs input[type="text"]:focus {
    border-color: #409eff;
    outline: none;
}

.form-group-inline textarea {
    width: 100%;
    margin-top: 8px;
}


/* --- Print Modal Styles --- */
.record-print-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Standard backdrop */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Ensure above other elements */
}

.record-print-modal {
  background-color: #fff;
  border-radius: 6px;
  width: 90%;
  max-width: 800px; /* A4-ish width */
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.record-print-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed; /* Lighter border */
}

.record-print-header h3 {
  margin: 0;
  font-size: 17px; /* Slightly larger */
  font-weight: 600;
  color: #303133;
}

.record-print-modal .close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399; /* Standard close icon color */
  padding: 0;
  line-height: 1;
}
.record-print-modal .close-btn:hover {
    color: #f56c6c; /* Red hover for close */
}

.record-print-content {
  padding: 25px 30px; /* Increased padding */
  max-height: calc(90vh - 130px); /* Adjust based on header/footer */
  overflow-y: auto;
  font-family: 'SimSun', '宋体', serif; /* Use serif font for printing */
  line-height: 1.8; /* Improve print readability */
  color: #000; /* Black text for printing */
}
.record-print-header-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 13px;
    color: #555;
}
.record-print-section {
    margin-bottom: 15px;
    display: flex; /* Align label and content */
}
.record-print-section .label {
    font-weight: bold;
    width: 80px; /* Fixed width for labels */
    flex-shrink: 0; /* Prevent label shrinking */
    margin-right: 10px;
}
.record-print-section .content {
    flex-grow: 1;
}

.record-print-signature {
    margin-top: 30px;
    text-align: right;
    font-size: 14px;
}
.record-print-signature span:first-child {
    margin-right: 10px;
}

.record-print-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #f9fafc; /* Light footer background */
}

/* Style footer buttons */
.record-print-footer button {
  padding: 8px 18px;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}
.btn-close-print {
  background-color: #fff;
  color: #606266;
  border-color: #dcdfe6;
  margin-right: 10px;
}
.btn-close-print:hover {
    background-color: #f5f7fa;
    border-color: #c0c4cc;
}
.btn-confirm-print {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}
.btn-confirm-print:hover {
  background-color: #66b1ff;
}

/* Keep existing modal styles for drug modal if needed */
/* Keep existing styles for group-start, group-item, last-item, tag-item, sub-item-indent, last-indent etc. */
.no-data-row td {
    text-align: center;
    color: #909399;
    padding: 30px; /* More padding for empty state */
    font-size: 14px;
}

/* Adjust editable table inputs for consistency */
.prescription-table-main.editable input[type="text"]:not([readonly]),
.prescription-table-main.editable input[type="number"]:not([readonly]),
.prescription-table-main.editable select:not([disabled]) {
    width: 100%;
    padding: 6px 8px; /* Keep slightly smaller for editable table */
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
}
.prescription-table-main.editable input:focus:not([readonly]),
.prescription-table-main.editable select:focus:not([disabled]) {
    border-color: #409eff;
    outline: none;
}

/* Keep existing modal styles for drug modal if needed */
/* --- Drug Modal Styles (Fig 2) --- */
.drug-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Standard backdrop */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; /* High z-index */
}

.drug-modal {
  background-color: #fff;
  border-radius: 6px;
  width: 90%;
  max-width: 900px; /* Wider modal */
  box-shadow: 0 5px 20px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden; /* Prevent content spill */
}

.drug-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px; /* Increased padding */
  border-bottom: 1px solid #e4e7ed;
}

.drug-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.drug-modal .close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  line-height: 1;
}
.drug-modal .close-btn:hover {
    color: #f56c6c;
}

.drug-modal-body {
  padding: 20px 25px; 
  flex-grow: 1; /* Take remaining height */
  overflow-y: hidden; /* Prevent body scroll, inner container scrolls */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Space between elements */
}

.drug-search-controls {
    display: flex;
    gap: 10px;
    align-items: center;
}

.drug-category-select {
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
    min-width: 120px;
    background-color: #fff;
}

.drug-search-input-wrapper {
    display: flex;
    align-items: center;
    flex-grow: 1;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0 12px;
    background-color: #fff;
}

.drug-search-input-wrapper input {
    flex-grow: 1;
    border: none;
    outline: none;
    padding: 8px 0;
    font-size: 14px;
}

.drug-search-input-wrapper .el-icon-search {
    color: #c0c4cc;
    cursor: pointer;
    font-size: 16px;
}

.drug-action-buttons {
    display: flex;
    gap: 10px;
}

.drug-tab-btn {
    padding: 8px 18px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
    color: #606266;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}
.drug-tab-btn.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
}
.drug-tab-btn:not(.active):hover {
    color: #409eff;
    border-color: #b3d8ff;
}

.drug-list-container {
  flex-grow: 1; /* Take available space */
  overflow-y: auto; /* Enable scrolling for the table */
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.drug-table {
  width: 100%;
  border-collapse: collapse;
}

.drug-table th,
.drug-table td {
  padding: 10px 12px; 
  text-align: left;
  border-bottom: 1px solid #f0f2f5; /* Lighter border */
  font-size: 13px;
  vertical-align: middle;
}

.drug-table th {
  background-color: #f9fafc;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  position: sticky; 
  top: 0;
  z-index: 1;
}

.drug-table input[type="checkbox"] {
    cursor: pointer;
}

.drug-table .drug-code {
    color: #909399;
    font-size: 11px;
}

.drug-table tbody tr:hover {
  background-color: #f5f7fa;
}

.no-drugs {
  text-align: center;
  padding: 30px;
  color: #909399;
  font-size: 14px;
}

.drug-pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 15px;
    gap: 5px;
}

.drug-pagination button {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    min-width: 30px;
    height: 30px;
    padding: 0 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease;
}
.drug-pagination button:disabled {
    color: #c0c4cc;
    cursor: not-allowed;
    background-color: #f5f7fa;
}
.drug-pagination button:not(:disabled):hover {
    color: #409eff;
    border-color: #c6e2ff;
}
.drug-pagination button.active {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
    cursor: default;
}
.drug-pagination button.active:hover {
    background-color: #409eff;
    color: #fff;
    border-color: #409eff;
}

.drug-modal-footer {
  display: flex;
  justify-content: space-between; /* Align hint left, buttons right */
  align-items: flex-end; /* Align items to bottom */
  padding: 15px 25px;
  border-top: 1px solid #e4e7ed;
  background-color: #f9fafc;
}

.hint-box {
    background-color: #fffbe6; /* Yellow hint background */
    border: 1px solid #ffe58f;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 12px;
    color: #8c6e2d;
    line-height: 1.6;
    flex-grow: 1; /* Allow hint box to take space */
    margin-right: 20px; /* Space between hint and buttons */
}

.drug-modal-footer .button-group {
     display: flex;
     gap: 10px;
}

.btn-cancel-drug {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-cancel-drug:hover {
    background-color: #f5f7fa;
    border-color: #c0c4cc;
}

.btn-confirm-drug {
  background-color: #409eff;
  color: white;
  border: 1px solid #409eff;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-confirm-drug:hover {    
  background-color: #66b1ff; 
  border-color: #66b1ff;     
}

/* 处方记录列表样式 */
.prescription-records {
  margin-top: 20px;
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.records-header {
  margin-bottom: 20px;
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
  padding: 7px 15px;
  background: #409eff;
  border: none;
  border-radius: 4px;
  color: white;
  margin-left: 10px;
  cursor: pointer;
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
}

.action-buttons button {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-buttons .btn-print:hover {
  color: #409eff;
  border-color: #409eff;
}

.action-buttons .btn-view:hover {
  color: #67c23a;
  border-color: #67c23a;
}

.records-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
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

.print-preview-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
}

.detail-modal-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 添加更现代的按钮样式 */
.btn-send-prescription,
.btn-modify-main,
.btn-print-main,
.btn-save-record {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  outline: none;
  margin-left: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #dcdfe6;
}

.btn-send-prescription i,
.btn-modify-main i,
.btn-print-main i,
.btn-save-record i {
  font-size: 16px;
}

.btn-send-prescription,
.btn-modify-main {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.btn-send-prescription:hover,
.btn-modify-main:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.btn-print-main,
.btn-save-record {
  background-color: #f4f4f5;
  color: #606266;
}

.btn-print-main:hover,
.btn-save-record:hover {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.action-buttons-main {
  display: flex;
  gap: 10px;
}

.btn-confirm-print {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.btn-confirm-print:hover {
  background-color: #66b1ff;
}

/* 优化处方表格中的按钮 */
.prescription-actions button {
  padding: 7px 15px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: #f4f4f5;
  color: #606266;
  border: 1px solid #dcdfe6;
  margin-right: 10px;
  outline: none;
}

.prescription-actions button:hover {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.btn-add-row {
  background-color: #f0f9eb !important;
  color: #67c23a !important;
  border: 1px solid #e1f3d8 !important;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-row:hover {
  background-color: #e1f3d8 !important;
  border-color: #67c23a !important;
}

/* 处方打印预览弹窗样式 */
.prescription-print-modal-backdrop {
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

.prescription-print-modal {
  background: white;
  width: 800px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.prescription-print-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.prescription-print-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.prescription-print-content {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
  font-family: 'SimSun', '宋体', serif;
  color: #000;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
}

.hospital-name {
  font-size: 24px;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.prescription-number {
  font-size: 14px;
  color: #333;
}

.patient-print-info {
  margin-bottom: 20px;
  border-bottom: 1px solid #000;
  padding-bottom: 15px;
}

.info-print-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-print-row span {
  margin-right: 20px;
}

.info-print-row.diagnosis {
  margin-top: 10px;
}

.rx-symbol {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.prescription-print-items {
  margin-bottom: 30px;
}

.prescription-print-item {
  display: flex;
  margin-bottom: 15px;
  font-size: 14px;
}

.item-number {
  width: 30px;
  flex-shrink: 0;
}

.item-details {
  flex-grow: 1;
}

.item-name {
  font-weight: bold;
}

.item-spec {
  color: #333;
  margin: 5px 0;
}

.item-usage {
  margin-top: 5px;
  color: #333;
}

.item-quantity {
  width: 60px;
  text-align: right;
  flex-shrink: 0;
}

.no-prescription-items {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-style: italic;
}

.prescription-print-footer {
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
}

.signatures {
  display: flex;
  gap: 50px;
}

.signature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.signature-line {
  display: inline-block;
  width: 100px;
  border-bottom: 1px solid #000;
}

.prescription-print-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #f9fafc;
}
</style>


