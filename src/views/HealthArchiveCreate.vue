<template>
  <div class="health-archive-create">
    <div class="patient-info-bar">
      <div class="avatar">
        <span>{{patient.name.substring(0,1)}}</span>
      </div>
      <div class="basic-info">
        <div>{{patient.name}}</div>
        <div>{{patient.gender}} {{patient.age}}岁</div>
      </div>
      <div class="room-info">
        <div>房间床位 {{patient.roomNumber}}</div>
        <div>护理等级 <span class="nursing-level">{{patient.nursingLevel}}</span></div>
      </div>
      <div class="admission-info">
        <div>入院日期 {{patient.admissionDate}}</div>
        <div>入院编号 {{patient.admissionNo}}</div>
      </div>
    </div>

    <div class="tabs">
      <div class="tab" @click="goToTab('medical')" :class="{active: activeTab === 'medical'}">
        <i class="el-icon-document-checked"></i> 医嘱管理
      </div>
      <div class="tab" @click="goToTab('history')" :class="{active: activeTab === 'history'}">
        <i class="el-icon-document"></i> 病史记录
      </div>
      <div class="tab" @click="goToTab('ward')" :class="{active: activeTab === 'ward'}">
        <i class="el-icon-place"></i> 查房记录
      </div>
      <div class="tab" @click="goToTab('medication')" :class="{active: activeTab === 'medication'}">
        <i class="el-icon-medicine-box"></i> 用药记录
      </div>
      <div class="tab" @click="goToTab('basic')" :class="{active: activeTab === 'basic'}">
        <i class="el-icon-user"></i> 基本信息
      </div>
    </div>

    <!-- 医嘱管理子标签 -->
    <div v-if="activeTab === 'medical'" class="medical-tabs">
      <div class="sub-tab" @click="setMedicalSubTab('temp')" :class="{active: medicalSubTab === 'temp'}">
        临时医嘱
      </div>
      <div class="sub-tab" @click="setMedicalSubTab('long')" :class="{active: medicalSubTab === 'long'}">
        长期医嘱
      </div>
      <div class="tab-actions">
        <button class="action-btn help-btn" @click="showHelp">
          <i class="el-icon-question"></i> 显示说明
        </button>
        <button class="action-btn print-btn" @click="showPrintModal">
          <i class="el-icon-printer"></i> 打印空白医嘱单
        </button>
      </div>
    </div>

    <!-- 病史记录子标签 -->
    <div v-if="activeTab === 'history'" class="medical-tabs">
      <div class="sub-tab" @click="setHistorySubTab('progress')" :class="{active: historySubTab === 'progress'}">
        病程录
      </div>
      <div class="sub-tab" @click="setHistorySubTab('admission')" :class="{active: historySubTab === 'admission'}">
        入院记录
      </div>
      <div class="tab-actions">
        <button class="action-btn print-btn" @click="printHistory">
          <i class="el-icon-printer"></i> 打印
        </button>
      </div>
    </div>

    <!-- 未建档提示 -->
    <div class="notification-alert" v-if="!patient.hasArchive && !showPrintModalFlag">
      <i class="icon-alert"></i>
      <span>该长者健康档案尚未建立，请及时完善记录</span>
      <button class="create-btn" @click="startCreate">开始创建</button>
    </div>

    <!-- 医嘱管理内容 -->
    <div v-if="activeTab === 'medical' && !showPrintModalFlag" class="medical-content">
      <!-- 未建档状态 -->
      <div v-if="!patient.hasArchive">
        <div v-if="medicalSubTab === 'temp'" class="temp-orders">
          <div class="empty-placeholder">
            健康档案尚未建立，无法查看临时医嘱
          </div>
        </div>
        <div v-if="medicalSubTab === 'long'" class="long-orders">
          <div class="empty-placeholder">
            健康档案尚未建立，无法查看长期医嘱
          </div>
        </div>
      </div>
      
      <!-- 已建档状态 - 显示医嘱内容 -->
      <div v-else>
        <!-- 临时医嘱内容 -->
        <div v-if="medicalSubTab === 'temp'" class="temp-orders">
          <div class="medical-table-container">
            <table class="medical-table">
              <thead>
                <tr>
                  <th class="checkbox-cell">
                    <input type="checkbox" v-model="selectAllTemp" @change="toggleAllTemp" title="全选" />
                  </th>
                  <th class="time-cell">下嘱时间</th>
                  <th class="content-cell">医嘱内容</th>
                  <th class="dosage-cell">剂量</th>
                  <th class="usage-cell">用法</th>
                  <th class="action-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in temporaryOrders" :key="`temp-${index}`">
                  <td class="checkbox-cell">
                    <input type="checkbox" v-model="order.selected" />
                  </td>
                  <td class="time-cell">{{ order.time }}</td>
                  <td class="content-cell">{{ order.content }}</td>
                  <td class="dosage-cell">{{ order.dosage }}</td>
                  <td class="usage-cell">{{ order.usage }}</td>
                  <td class="action-cell">
                    <div class="btn-group">
                      <button class="action-btn-simple view-btn" @click="viewOrder(order)">查看</button>
                      <button class="action-btn-simple stop-btn" @click="invalidateOrder(order, 'temporary')">停止</button>
                      <button class="action-btn-simple print-btn" @click="printOrder(order)">打印</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="temporaryOrders.length === 0">
                  <td colspan="6" class="empty-row">暂无临时医嘱</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination">
            <div class="pagination-info">
              <div class="checkbox-container"><input type="checkbox" @click="toggleSelectAll"></div>
              <button class="batch-btn print-batch-btn"><i class="el-icon-printer"></i> 打印医嘱</button>
            </div>
            <div class="pagination-pages">
              <button class="page-btn"><i class="el-icon-arrow-left"></i></button>
              <div class="page-numbers">
                <span class="page-number active">1</span>
                <span class="page-number">2</span>
                <span class="page-number">3</span>
                <span class="page-number">4</span>
                <span class="page-number">5</span>
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
        
        <!-- 长期医嘱内容 -->
        <div v-if="medicalSubTab === 'long'" class="long-orders">
          <div class="yellow-tip">
            未执行的长期医嘱 可以作废
          </div>
          <div class="yellow-tip executed">
            已执行的长期医嘱 可以停止（立即停止，或者设定停止时间；立即停止-即停止时间为当前时间）
          </div>
          
          <div class="medical-table-container">
            <table class="medical-table">
              <thead>
                <tr>
                  <th class="checkbox-cell">
                    <input type="checkbox" v-model="selectAllLong" @change="toggleAllLong" title="全选" />
                  </th>
                  <th class="time-cell">下嘱时间</th>
                  <th class="content-cell">医嘱内容</th>
                  <th class="dosage-cell">剂量</th>
                  <th class="usage-cell">用法</th>
                  <th class="action-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in longTermOrders" :key="`long-${index}`">
                  <td class="checkbox-cell">
                    <input type="checkbox" v-model="order.selected" />
                  </td>
                  <td class="time-cell">{{ order.time }}</td>
                  <td class="content-cell">{{ order.content }}</td>
                  <td class="dosage-cell">{{ order.dosage }}</td>
                  <td class="usage-cell">{{ order.usage }}</td>
                  <td class="action-cell">
                    <div class="btn-group">
                      <button class="action-btn-simple view-btn" @click="viewOrder(order)">查看</button>
                      <button class="action-btn-simple pause-btn" @click="openStopOrderModal(order)">暂停</button>
                      <button class="action-btn-simple stop-btn" @click="invalidateOrder(order, 'longTerm')">停止</button>
                      <button class="action-btn-simple print-btn" @click="printOrder(order)">打印</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="longTermOrders.length === 0">
                  <td colspan="6" class="empty-row">暂无长期医嘱</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination">
            <div class="pagination-info">
              <div class="checkbox-container"><input type="checkbox" @click="toggleSelectAll"></div>
              <button class="batch-btn print-batch-btn"><i class="el-icon-printer"></i> 批量打印</button>
            </div>
            <div class="pagination-pages">
              <button class="page-btn"><i class="el-icon-arrow-left"></i></button>
              <div class="page-numbers">
                <span class="page-number active">1</span>
                <span class="page-number">2</span>
                <span class="page-number">3</span>
                <span class="page-number">4</span>
                <span class="page-number">5</span>
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
    </div>

    <!-- 病史记录内容 -->
    <div v-if="activeTab === 'history' && !showPrintModalFlag" class="history-content">
      <!-- 未建档状态 -->
      <div v-if="!patient.hasArchive">
        <div class="empty-placeholder">
          健康档案尚未建立，无法查看病史记录
        </div>
      </div>
      
      <!-- 已建档状态 - 显示病史记录内容 -->
      <div v-else>
        <!-- 病程录内容 -->
        <div v-if="historySubTab === 'progress'" class="progress-notes">
          <div class="top-actions">
            <button class="add-note-btn">
              <i class="el-icon-plus"></i> 新增病程记录
            </button>
          </div>
          
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-cell">
                    <input type="checkbox" @change="toggleSelectAllNotes">
                  </th>
                  <th>记录日期</th>
                  <th>记录医生</th>
                  <th class="operation-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(note, index) in progressNotes" :key="index">
                  <td class="checkbox-cell">
                    <input type="checkbox" v-model="note.selected">
                  </td>
                  <td>{{note.date}} <i v-if="note.hasAttachment" class="el-icon-paperclip text-warning"></i></td>
                  <td>{{note.doctor}}</td>
                  <td class="operation-cell">
                    <div class="btn-group">
                      <button 
                        class="action-btn-simple view-btn" 
                        @click="viewProgressNote(note)"
                      >查看</button>
                      <button 
                        :class="['action-btn-simple', 'edit-btn', {'disabled-btn': note.printed}]" 
                        v-if="note.canEdit"
                        @click="editProgressNote(note)"
                      >编辑</button>
                      <button 
                        :class="['action-btn-simple', 'print-btn', {'disabled-btn': note.printed}]" 
                        @click="printProgressNote(note)"
                      >打印</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination">
            <div class="checkbox-container">
              <input type="checkbox" @click="toggleSelectAll">
              <button class="batch-btn print-batch-btn"><i class="el-icon-printer"></i> 批量打印</button>
            </div>
            <div class="pagination-pages">
              <button class="page-btn"><i class="el-icon-arrow-left"></i></button>
              <div class="page-numbers">
                <span class="page-number active">1</span>
                <span class="page-number">2</span>
                <span class="page-number">3</span>
                <span class="page-number">4</span>
                <span class="page-number">5</span>
              </div>
              <button class="page-btn"><i class="el-icon-arrow-right"></i></button>
              <select class="page-size-select">
                <option>10条/页</option>
                <option>20条/页</option>
                <option>50条/页</option>
              </select>
            </div>
          </div>
          
          <div class="print-tips">
            <div class="print-tip-header">2024-5-9更新</div>
            <div class="print-tip-item">1, 本打印页，可编辑套版</div>
            <div class="print-tip-item">2, 初次打印后，打印纸张为灰色（不影响打印）</div>
            <div class="print-tip-item">3, 初次打印后，不再跳线</div>
          </div>
        </div>
        
        <!-- 入院记录内容 -->
        <div v-if="historySubTab === 'admission'" class="admission-record">
          <div class="admission-header">
            <div class="institution-name">上海XX机构</div>
            <div class="record-title">入院健康档案</div>
          </div>
          
          <div class="patient-basic-info">
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">姓名</span>
                <span class="info-value">{{patient.name}}</span>
              </div>
              <div class="info-item">
                <span class="info-label">病区</span>
                <span class="info-value">生活区</span>
              </div>
              <div class="info-item">
                <span class="info-label">房间床位</span>
                <span class="info-value">{{patient.roomNumber}}</span>
              </div>
              <div class="info-item">
                <span class="info-label">住院号</span>
                <span class="info-value">F01668</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">姓名</span>
                <span class="info-value">{{patient.name}}</span>
              </div>
              <div class="info-item">
                <span class="info-label">工作单位</span>
                <span class="info-value">退休</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">性别</span>
                <span class="info-value">{{patient.gender}}</span>
              </div>
              <div class="info-item">
                <span class="info-label">职业</span>
                <span class="info-value">XX区XX镇蕰巷D门808号225</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">年龄</span>
                <span class="info-value">{{patient.age}}</span>
              </div>
              <div class="info-item">
                <span class="info-label">供史人</span>
                <span class="info-value">本人及家属</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">民族</span>
                <span class="info-value">汉</span>
              </div>
              <div class="info-item">
                <span class="info-label">可靠程度</span>
                <span class="info-value">欠可靠</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">出生地</span>
                <span class="info-value">浙江</span>
              </div>
              <div class="info-item">
                <span class="info-label">入院日期</span>
                <span class="info-value">{{patient.admissionDate}}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">采集时间</span>
                <span class="info-value">2024-05-12 12:16</span>
              </div>
              <div class="info-item">
                <span class="info-label">住址</span>
                <span class="info-value">XX区XX镇蕰巷D门808号225</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <span class="info-label">联系人</span>
                <span class="info-value">家属姓名</span>
              </div>
              <div class="info-item">
                <span class="info-label">电话</span>
                <span class="info-value">家属手机号</span>
              </div>
            </div>
          </div>

          <div class="medical-sections">
            <div class="section-item">
              <div class="section-title">主诉</div>
              <div class="section-content">
                <span class="content-text-link">反复咳嗽、气促十余年，加重十天</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">现病史</div>
              <div class="section-content">
                <span class="content-text-link">患者于十年前冬季到夏季及天气变化时期开始出现咳嗽、咳痰、气促、喘息不适，腹大吸白色粘痰，偶尔咳嗽及运动后胸闷、气促改变，无发热。气促时可睡眠治疗（具体用药不详）。近十天来，患者上呼吸道再次发作，气促比往常明显，伴少量咳嗽及白色粘痰。</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">既往史</div>
              <div class="section-content">
                <span class="content-text-link">既往体质一般，曾患疾病：冠心病"脑梗"曾两年余，具体不详。有高血压、糖尿病，预防接种史不详。</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">传染病</div>
              <div class="section-content">
                <span class="content-text-link">无，肺结核</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">手术史</div>
              <div class="section-content">
                <span class="content-text-link">无，左膝关节</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">食物、药物过敏史</div>
              <div class="section-content">
                <span class="content-text-link">无，青霉素、头孢类</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">重要药物应用史</div>
              <div class="section-content">
                <span class="content-text-link">激素、甲基强的松龙</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">个人史</div>
              <div class="section-content">
                <span class="content-text-link">文化程度：小学文化；居住水体接触史：无；婚姻：有；巳婚8年，平均12岁/月，已生2子；饮酒：有，约8年，平均12两/日，已戒2年；特殊嗜好：爱吃坚硬食品</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">婚育史</div>
              <div class="section-content">
                <span class="content-text-link">婚姻情况：已婚；配偶健康状况：一般；夫妻关系和睦；生育子女2人，1子1女；与子女关系和睦</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">月经史</div>
              <div class="section-content">
                <span class="content-text-link">初潮14岁，绝经56岁</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">自理能力</div>
              <div class="section-content">
                <span class="content-text-link">进食依赖帮助，个人卫生能自理，行走依赖帮助，上下床能自理</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">饮食</div>
              <div class="section-content">
                <span class="content-text-link">肠内营养，食欲退减，其他 需要有低盐饮食</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">大便</div>
              <div class="section-content">
                <span class="content-text-link">排便情况正常，排便次数3次/日，排便物为便秘，其他有排尿困难</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">睡眠</div>
              <div class="section-content">
                <span class="content-text-link">睡眠情况正常，睡眠时长12小时/日，无需药物辅助睡眠，五年睡习惯</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">家族史</div>
              <div class="section-content">
                <span class="content-text-link">无家族遗传性疾史，遗传疾病总结 家族性早衰症</span>
              </div>
            </div>
          </div>

          <div class="physical-examination">
            <div class="section-page">第1页</div>
            <div class="patient-info-brief">
              <span>姓名 {{patient.name}}</span>
              <span>病区 生活区</span>
              <span>房间床位 {{patient.roomNumber}}</span>
              <span>住院号 F01668</span>
            </div>

            <div class="examination-title">体格检查</div>

            <div class="vital-signs">
              <div class="sign-item">
                <span class="sign-label">体温(T)</span>
                <span class="sign-value">36.5℃</span>
              </div>
              <div class="sign-item">
                <span class="sign-label">脉搏(P)</span>
                <span class="sign-value">78次/分</span>
              </div>
              <div class="sign-item">
                <span class="sign-label">呼吸(R)</span>
                <span class="sign-value">23次/分</span>
              </div>
              <div class="sign-item">
                <span class="sign-label">血压(BP)</span>
                <span class="sign-value">145/90mmHg</span>
              </div>
            </div>

            <div class="general-condition">
              <div class="condition-title">一般情况</div>
              <div class="condition-item">
                <span class="condition-label">进食</span>
                <span class="condition-value">坐轮椅推入</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">神志</span>
                <span class="condition-value">清晰</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">表情</span>
                <span class="condition-value">正常</span>
              </div>
              <div class="condition-item">
                <span class="condition-label">发育</span>
                <span class="condition-value">欠佳</span>
              </div>
            </div>

            <div class="section-item">
              <div class="section-title">皮肤粘膜</div>
              <div class="section-content">
                <span class="content-text">全身皮肤粘膜无黄染，右出血点，位于右眶上缘，无肿胀，无渗出，右眉毛中部无疤痕，左眉无疤痕，位于左腹后侧</span>
              </div>
            </div>

            <div class="body-parts">
              <div class="part-item">
                <div class="part-title">咽</div>
                <div class="part-content">XXXXXXXXXXXXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">耳</div>
                <div class="part-content">XXXXXXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">鼻</div>
                <div class="part-content">XXXXXXXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">口腔</div>
                <div class="part-content">XXXXXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">浅表淋巴结</div>
                <div class="part-content">XXXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">胸</div>
                <div class="part-content">X</div>
              </div>
              <div class="part-item">
                <div class="part-title">心脏</div>
                <div class="part-content">XXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">肺</div>
                <div class="part-content">XXXXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">腹部</div>
                <div class="part-content">XXXXXXXXXX</div>
              </div>
              <div class="part-item">
                <div class="part-title">肝胆脾肾<br/>外生殖器</div>
                <div class="part-content"></div>
              </div>
              <div class="part-item">
                <div class="part-title">脊柱四肢</div>
                <div class="part-content"></div>
              </div>
            </div>

            <div class="section-page">第2页</div>
            <div class="patient-info-brief">
              <span>姓名 {{patient.name}}</span>
              <span>病区 生活区</span>
              <span>房间床位 {{patient.roomNumber}}</span>
              <span>住院号 F01668</span>
            </div>

            <div class="laboratory-title">实验室与特殊检查</div>

            <div class="laboratory-section">
              <div class="lab-title">生化检查</div>
              <div class="lab-content">
                <span>葡萄糖 3.5 mmol/L，肌酐 3.5 mmol/L，总胆固醇 3.5 mmol/L，谷丙转氨酶 3.5 U/L，尿素氮 3.5 mmol/L</span>
              </div>
            </div>

            <div class="laboratory-section">
              <div class="lab-title">器械辅助检查</div>
              <div class="lab-content">
                <div>心电图：窦性心动过速</div>
                <div>CT：胸腔积液</div>
                <div>X光检查：未查</div>
              </div>
            </div>

            <div class="summary-section">
              <div class="summary-title">小结</div>
              <div class="summary-content">
                <p>对象李小二，女，68岁 2024年2月12日，因家中子女上班无人照料且生活不能自理 入院。老人十年前即开始出现冬季和及天气变化时咳嗽、咳痰、气促不适，痰大量白色粘痰，偶然咳嗽运动后胸闷、气促改变，无发热。近十天来，患者上呼吸道再次发作，气促比往常明显，伴少量咳嗽及白色粘痰。既往体质一般，曾患疾病：冠心病"脑梗"曾两年余，具体不详。有高血压、糖尿病，预防接种史不详。</p>
              </div>
              <div class="diagnosis-plan">
                <div class="diagnosis">
                  <div class="diagnosis-title">初步诊断</div>
                  <div class="diagnosis-items">
                    <div>1，高血压病II级</div>
                    <div>2，冠心病</div>
                    <div>3，胆囊切除术后</div>
                  </div>
                </div>
                <div class="treatment-plan">
                  <div class="plan-title">诊疗计划</div>
                  <div class="plan-items">
                    <div>1, 持续监测，控制血压</div>
                    <div>2, 护心，保心治疗</div>
                    <div>3, 清淡饮食</div>
                  </div>
                </div>
              </div>
              <div class="doctor-signature">
                <div class="signature-label">医生签名：</div>
                <div class="date-label">日期：2024-06-12</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-area" v-if="activeTab === 'basic' && !showPrintModalFlag">
      <div class="basic-info-display">
        <div class="info-row">
          <div class="info-label">民族</div>
          <div class="info-value">汉</div>
          <div class="info-label">籍贯</div>
          <div class="info-value">浙江，宁波</div>
        </div>
        <div class="info-row">
          <div class="info-label">出生日期</div>
          <div class="info-value">1950-12-16</div>
          <div class="info-label">婚姻状况</div>
          <div class="info-value">已婚</div>
        </div>
        <div class="info-row">
          <div class="info-label">身份证号</div>
          <div class="info-value">312125195015184251</div>
          <div class="info-label">住址</div>
          <div class="info-value">XXX区镇西街XX号XXX室</div>
        </div>
        <div class="info-row">
          <div class="info-label">工作单位</div>
          <div class="info-value"></div>
          <div class="info-label">职业</div>
          <div class="info-value"></div>
        </div>
        <div class="info-row">
          <div class="info-label">医保情况</div>
          <div class="info-value"></div>
          <div class="info-label">过敏药物</div>
          <div class="info-value"></div>
        </div>
        <div class="info-row">
          <div class="info-label">供史人</div>
          <div class="info-value"></div>
          <div class="info-label">可靠程度</div>
          <div class="info-value"></div>
        </div>
        <div class="info-row">
          <div class="info-label">联系人</div>
          <div class="info-value">家属姓名</div>
          <div class="info-label">电话</div>
          <div class="info-value">家属手机号</div>
        </div>
      </div>

      <div class="info-tips" v-if="!patient.hasArchive">
        <div class="tip-item">1、健康档案未完成时，默认进入基本信息TAB页，显示完整档案</div>
        <div class="tip-item">2、健康档案未完成时，其他TAB页暂无法使用</div>
        <div class="tip-item">3、健康档案完成后，默认进入查房记录页面</div>
      </div>
    </div>

    <!-- 添加查看医嘱详情抽屉 -->
    <div v-if="showOrderDetailDrawer" class="order-detail-drawer-container">
      <div class="order-detail-backdrop" @click="showOrderDetailDrawer = false"></div>
      <div class="order-detail-drawer">
        <div class="drawer-header">
          <h3>医嘱信息</h3>
          <button class="close-button" @click="showOrderDetailDrawer = false">×</button>
        </div>
        <div class="drawer-content">
          <div class="order-info-section">
            <div class="order-info-header">医嘱信息</div>
            <div class="info-row">
              <div class="info-label">医嘱类型</div>
              <div class="info-value">长嘱</div>
            </div>
            <div class="info-row">
              <div class="info-label">开方时间</div>
              <div class="info-value">{{selectedOrder.time || '2024-05-16 14:22:18'}}</div>
            </div>
            <div class="info-row">
              <div class="info-label">医嘱内容</div>
              <div class="info-value">{{selectedOrder.content || '6% 氨基酸注射液 (10ml*5支/盒)'}}</div>
            </div>
            <div class="info-row">
              <div class="info-label">单次用量</div>
              <div class="info-value">{{selectedOrder.dosage || '10ml'}}</div>
            </div>
            <div class="info-row">
              <div class="info-label">给药途径</div>
              <div class="info-value">静脉滴注 (iv)</div>
            </div>
            <div class="info-row">
              <div class="info-label">频次</div>
              <div class="info-value">一天三次 (tid)</div>
            </div>
            <div class="info-row">
              <div class="info-label">给药时间</div>
              <div class="info-value">餐前 (ac)</div>
            </div>
            <div class="info-row">
              <div class="info-label">总量</div>
              <div class="info-value">6支</div>
            </div>
            <div class="info-row">
              <div class="info-label">配伍禁忌</div>
              <div class="info-value">碱性溶液</div>
            </div>
          </div>
          
          <div class="order-detail-tips">
            <div class="order-tip-header">
              <i class="el-icon-warning-outline"></i> 本单不替代纸质医嘱执行记录单
            </div>
          </div>
          
          <div class="order-operators-info">
            <div class="operators-header">
              <i class="el-icon-user"></i> 医嘱流程
            </div>
            <div class="operator-row">
              <div class="operator-label">停止时间</div>
              <div class="operator-value">2024-05-18 14:18:19</div>
            </div>
            <div class="operator-row">
              <div class="operator-label">开嘱医生</div>
              <div class="operator-value">张医生，05-16 14:36</div>
            </div>
            <div class="operator-row">
              <div class="operator-label">审核护士</div>
              <div class="operator-value">XP士，05-16 14:36</div>
            </div>
            <div class="operator-row">
              <div class="operator-label">停嘱审核医生</div>
              <div class="operator-value">张医生，05-16 14:36</div>
            </div>
            <div class="operator-row">
              <div class="operator-label">确认停止护士</div>
              <div class="operator-value">XP士，05-16 14:36</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加医嘱打印弹窗 -->
    <div v-if="showOrderPrintModal" class="print-modal-overlay">
      <div class="print-modal">
        <div class="modal-header">
          <h3>长期医嘱单</h3>
          <button class="close-button" @click="showOrderPrintModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="print-preview">
            <div class="preview-header">
              <div class="institution">上海XX机构</div>
              <div class="page-info">第_____页</div>
            </div>
            <div class="print-title">长期医嘱单</div>
            <div class="patient-row">
              <div class="print-field">
                <span class="field-label">姓名</span>
                <span class="field-value">{{patient.name}}</span>
              </div>
              <div class="print-field">
                <span class="field-label">区域</span>
                <span class="field-value">生活区</span>
              </div>
              <div class="print-field">
                <span class="field-label">房间床位</span>
                <span class="field-value">{{patient.roomNumber}}</span>
              </div>
              <div class="print-field">
                <span class="field-label">住院号</span>
                <span class="field-value">F01668</span>
              </div>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  <th>开始时间</th>
                  <th>医生签名</th>
                  <th>护士签名</th>
                  <th>长期医嘱</th>
                  <th>停止时间</th>
                  <th>医生签名</th>
                  <th>护士签名</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024/6/20<br/>14:00</td>
                  <td></td>
                  <td></td>
                  <td>院内外病理处理</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>2024/6/21<br/>9:00</td>
                  <td></td>
                  <td></td>
                  <td>川贝护理</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>2024/6/21<br/>11:00</td>
                  <td></td>
                  <td></td>
                  <td>糖尿病饮食</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>2024/6/21<br/>11:00</td>
                  <td></td>
                  <td></td>
                  <td>
                    0.9%氯化钠注射液  250ml<sup>⊕</sup><br/>
                    头孢磺咝  0.5g<br/>
                    青霉素  1.5g
                  </td>
                  <td>2024/6/29<br/>11:00</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div class="print-notes">
              <div class="note-item">1, 同组药物的医嘱，只要第一条打印同组日期，后续的留空间；</div>
              <div class="note-item">2, 表格每行留2行字的高度，上下留中打印；</div>
              <div class="note-item">3, 表格纵向留有足够的空间方便医嘱的书写</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="print-options">
            <span>从纸张第</span>
            <input type="number" class="page-input" v-model="startPage" min="1" max="99">
            <span>行开始打印</span>
          </div>
          <div class="action-buttons">
            <button class="cancel-button" @click="showOrderPrintModal = false">关闭</button>
            <button class="print-button" @click="printSelectedOrder">
              <i class="el-icon-printer"></i> 打印
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 打印空白医嘱单模态框 -->
    <div v-if="showPrintModalFlag" class="print-modal-overlay">
      <div class="print-modal">
        <div class="modal-header">
          <h3>长期医嘱单</h3>
          <button class="close-button" @click="showPrintModalFlag = false">×</button>
        </div>
        <div class="modal-body">
          <div class="print-preview">
            <div class="preview-header">
              <div class="institution">上海XX机构</div>
              <div class="page-info">第_____页</div>
            </div>
            <div class="print-title">长期医嘱单</div>
            <div class="patient-row">
              <div class="print-field">
                <span class="field-label">姓名</span>
                <span class="field-value">尹小二</span>
              </div>
              <div class="print-field">
                <span class="field-label">区域</span>
                <span class="field-value">生活区</span>
              </div>
              <div class="print-field">
                <span class="field-label">房间床位</span>
                <span class="field-value">3207-5</span>
              </div>
              <div class="print-field">
                <span class="field-label">住院号</span>
                <span class="field-value">F01668</span>
              </div>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  <th>开始时间</th>
                  <th>医生签名</th>
                  <th>护士签名</th>
                  <th>长期医嘱</th>
                  <th>停止时间</th>
                  <th>医生签名</th>
                  <th>护士签名</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <!-- 重复行，用于打印的空白表格 -->
                <tr v-for="i in 10" :key="i">
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
            <div class="print-notes">
              <div class="note-item">1, 同组药物的医嘱，只要第一条打印同组日期，后续的留空间；</div>
              <div class="note-item">2, 表格每行留2行字的高度，上下留中打印；</div>
              <div class="note-item">3, 表格纵向留有足够的空间方便医嘱的书写</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="print-options">
            <span>从纸张第</span>
            <input type="number" class="page-input" v-model="startPage" min="1" max="99">
            <span>行开始打印</span>
          </div>
          <div class="action-buttons">
            <button class="cancel-button" @click="showPrintModalFlag = false">关闭</button>
            <button class="print-button" @click="printMedicalOrder">
              <i class="el-icon-printer"></i> 打印
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 停止长期医嘱弹窗 -->
    <div v-if="showStopOrderModalFlag" class="modal-overlay">
      <div class="stop-order-modal">
        <div class="modal-header">
          <h3>停止长期医嘱</h3>
          <button class="close-button" @click="showStopOrderModalFlag = false">×</button>
        </div>
        <div class="modal-body">
          <div class="stop-order-info">
            每天一组四个日期（如1上午、1下午、2上午、2下午等），注：无护士签字是确认的医嘱，你需自行向下一级医务人员说明
          </div>
          <div class="stop-order-form">
            <div class="form-item">
              <label class="form-label">停止时间</label>
              <input type="text" class="form-input" value="选择时间" readonly />
              <div class="form-checkbox">
                <input type="checkbox" id="stopImmediately" v-model="stopImmediately" />
                <label for="stopImmediately">立即停止</label>
              </div>
            </div>
          </div>
          <div class="stop-order-list">
            <div class="order-item">
              <div class="order-title">{{currentStoppingOrder}}</div>
              <div class="order-details">
                <div class="order-detail-item">
                  <span>500ml</span>
                </div>
                <div class="order-detail-item">
                  <span>静脉滴注(ivdrip), 每天1次(qd)</span>
                </div>
              </div>
            </div>
            <div class="order-item" v-if="currentStoppingOrder === '0.9%氯化钠注射液'">
              <div class="order-title">头孢磺咝</div>
              <div class="order-details">
                <div class="order-detail-item">
                  <span>0.25mg</span>
                </div>
              </div>
            </div>
            <div class="order-item" v-if="currentStoppingOrder === '0.9%氯化钠注射液'">
              <div class="order-title">青霉素</div>
              <div class="order-details">
                <div class="order-detail-item">
                  <span>0.5mg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="showStopOrderModalFlag = false">取 消</button>
          <button class="submit-button" @click="confirmStopOrder">提 交</button>
        </div>
      </div>
    </div>

    <!-- 病程记录查看模态框 -->
    <div v-if="showProgressNoteViewModal" class="modal-overlay" @click.self="showProgressNoteViewModal = false">
      <div class="progress-note-modal">
        <div class="modal-header">
          <h3>病程记录内容</h3>
          <button class="close-button" @click="showProgressNoteViewModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="progress-note-info">
            <div class="note-meta">
              <div>患者：{{patient.name}}</div>
              <div>记录日期：{{selectedProgressNote?.date}}</div>
              <div>记录医生：{{selectedProgressNote?.doctor}}</div>
              <div>体温：36.5℃</div>
            </div>
            <div class="note-content">
              {{selectedProgressNote?.content}}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn close-btn" @click="showProgressNoteViewModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 病程记录编辑模态框 -->
    <div v-if="showProgressNoteEditModal" class="modal-overlay" @click.self="showProgressNoteEditModal = false">
      <div class="progress-note-modal">
        <div class="modal-header">
          <h3>编辑病程记录</h3>
          <button class="close-button" @click="showProgressNoteEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="progress-note-editor">
            <div class="note-meta">
              <div>患者：{{patient.name}}</div>
              <div>记录日期：{{selectedProgressNote?.date}}</div>
              <div>记录医生：{{selectedProgressNote?.doctor}}</div>
              <div>体温：<input type="text" value="36.5" class="temperature-input">℃</div>
            </div>
            <div class="note-content-editor">
              <textarea v-model="selectedProgressNote.content" rows="10" class="content-textarea"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn save-btn" @click="saveProgressNote">保存</button>
          <button class="action-btn cancel-btn" @click="showProgressNoteEditModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 病程记录打印预览 -->
    <div v-if="showProgressNotePrintModal" class="print-modal-overlay">
      <div class="print-modal">
        <div class="modal-header">
          <h3>打印病程记录</h3>
          <button class="close-button" @click="showProgressNotePrintModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="print-preview">
            <div class="progress-note-preview">
              <div class="progress-header">
                <div class="progress-title">病程记录</div>
                <div class="page-number">第______页</div>
              </div>
              <div class="patient-info-row">
                <div class="patient-info-item">
                  <span>姓名</span>
                  <span>{{patient.name}}</span>
                </div>
                <div class="patient-info-item">
                  <span>区域</span>
                  <span>生活区</span>
                </div>
                <div class="patient-info-item">
                  <span>房间床位</span>
                  <span>{{patient.roomNumber}}</span>
                </div>
                <div class="patient-info-item">
                  <span>住院号</span>
                  <span>F01668</span>
                </div>
              </div>
              <div class="date-line">
                <div class="date">{{selectedProgressNote?.date}}</div>
              </div>
              <div class="note-content-preview">
                {{selectedProgressNote?.content}}
              </div>
              <div class="doctor-signature">
                <div>医生：</div>
              </div>
            </div>
          </div>
          
          <div class="print-controls">
            <div class="page-controls">
              <label>从纸张第</label>
              <input type="number" v-model="printStartPage" min="1" class="page-input">
              <label>行开始打印</label>
            </div>
            <div class="print-actions">
              <button class="action-btn cancel-btn" @click="showProgressNotePrintModal = false">关闭</button>
              <button class="action-btn print-btn" @click="confirmPrintProgressNote">
                <i class="el-icon-printer"></i> 打印
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthArchiveCreateView',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      activeTab: 'basic',
      medicalSubTab: 'temp',
      showPrintModalFlag: false,
      showStopOrderModalFlag: false,
      stopImmediately: false,
      currentStoppingOrder: '',
      relatedOrders: [
        { name: '头孢磺咝', dosage: '0.25mg', usage: '' },
        { name: '青霉素', dosage: '0.5mg', usage: '' }
      ],
      startPage: 1,
      patient: {
        id: 0,
        name: '',
        gender: '',
        age: 0,
        roomNumber: '',
        nursingLevel: '',
        admissionDate: '',
        admissionNo: '',
        hasArchive: false
      },
      temporaryOrders: [
        { time: '05-12 09:10', content: '阿莫西林胶囊', dosage: '0.5g', usage: '口服(po)，每天3次(tid)，餐前(ac)，禁止饮酒' },
        { time: '05-12 09:10', content: '阿莫西林胶囊', dosage: '0.5g', usage: '口服(po)，每天3次(tid)' },
        { time: '05-12 09:10', content: '半流质饮食', dosage: '', usage: '' }
      ],
      longTermOrders: [
        { time: '05-12 09:10', content: '阿莫西林胶囊', dosage: '0.25g*20粒/盒', usage: '口服(po)，每天3次(tid)，餐前(ac)，禁止饮酒' },
        { time: '05-12 09:10', content: '阿莫西林胶囊', dosage: '10ml*5支/盒', usage: '口服(po)，每天3次(tid)' },
        { time: '05-12 09:10', content: '0.9%氯化钠注射液', dosage: '500ml*1瓶/盒', usage: '静脉滴注(ivdrip)，每天1次(qd)' }
      ],
      progressNotes: [
        { date: '2024-05-18', doctor: '王医生', selected: false, canEdit: true, printed: false, content: '呼啦啦，呼啦啦，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。小草偷偷地从土地里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。花园里春梅的，杏花的，梨花的，桃花的，都争着发了。红的像火，粉的像霞，白的像雪。花里带着甜味儿。闭了眼，树上仿佛已经满是桃儿，杏儿，梨儿。' },
        { date: '2024-05-13', doctor: '张医生', selected: false, canEdit: false, printed: true, content: '呼啦啦，呼啦啦，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。小草偷偷地从土地里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。' },
        { date: '2024-05-11', doctor: 'XXXX', selected: false, hasAttachment: true, canEdit: false, printed: true, content: '呼啦啦，呼啦啦，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。小草偷偷地从土地里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。花园里春梅的，杏花的，梨花的，桃花的，都争着发了。红的像火，粉的像霞，白的像雪。花里带着甜味儿。闭了眼，树上仿佛已经满是桃儿，杏儿，梨儿。' }
      ],
      selectAllTemp: false,
      selectAllLong: false,
      showOrderDetailDrawer: false,
      selectedOrder: null,
      showOrderPrintModal: false,
      historySubTab: 'progress',
      selectedProgressNote: null,
      showProgressNoteViewModal: false,
      showProgressNoteEditModal: false,
      showProgressNotePrintModal: false,
      printStartPage: 1
    }
  },
  methods: {
    loadPatientData() {
      // 模拟从服务器获取患者数据
      const patients = [
        {
          id: 1,
          name: '李大哥',
          gender: '男',
          age: 78,
          roomNumber: '2206-5',
          nursingLevel: '二级护理',
          admissionDate: '2024-05-12',
          admissionNo: '2024050124',
          hasArchive: false
        },
        {
          id: 2,
          name: '王大娘',
          gender: '女',
          age: 98,
          roomNumber: '2206-5',
          nursingLevel: '二级护理',
          admissionDate: '2024-05-12',
          admissionNo: '2024050124',
          hasArchive: true
        },
        {
          id: 3,
          name: '宋老博',
          gender: '男',
          age: 89,
          roomNumber: '2206-5',
          nursingLevel: '二级护理',
          admissionDate: '2024-05-12',
          admissionNo: '2024050124',
          hasArchive: true
        }
      ];
      
      const patientId = parseInt(this.id);
      const patient = patients.find(p => p.id === patientId);
      
      if (patient) {
        this.patient = patient;
      } else {
        // 如果找不到患者，返回列表页
        this.$router.push('/health-archive');
      }
    },
    goToTab(tab) {
      this.activeTab = tab;
    },
    setMedicalSubTab(subTab) {
      this.medicalSubTab = subTab;
    },
    startCreate() {
      // 开始创建健康档案
      this.$router.push(`/health-archive/form/step1/${this.id}`);
    },
    showHelp() {
      // 显示帮助说明
      console.log('显示帮助说明');
    },
    showPrintModal() {
      this.showPrintModalFlag = true;
    },
    printMedicalOrder() {
      // 实现打印功能
      console.log('打印医嘱单，从第', this.startPage, '行开始');
      window.print();
      this.showPrintModalFlag = false;
    },
    toggleSelectAll() {
      // 实现全选功能
      console.log('全选');
    },
    invalidateOrder(order, type) {
      if (confirm(`确定要停止医嘱"${order.content}"吗？`)) {
        this.$message.success(`已使医嘱"${order.content}"失效`);
        // 实际应用中，此处应有API调用使医嘱失效
        console.log(`已停止${type}类型的医嘱：${order.content}`);
      }
    },
    showStopOrderModal(orderName) {
      this.currentStoppingOrder = orderName;
      this.showStopOrderModalFlag = true;
    },
    confirmStopOrder() {
      console.log('停止医嘱：', this.currentStoppingOrder);
      console.log('立即停止：', this.stopImmediately);
      this.showStopOrderModalFlag = false;
    },
    openStopOrderModal(order) {
      this.currentStoppingOrder = order.content;
      this.showStopOrderModalFlag = true;
    },
    viewOrder(order) {
      this.selectedOrder = order;
      this.showOrderDetailDrawer = true;
    },
    printOrder(order) {
      // this.$message.info(`正在打印医嘱：${order.content}`);
      // 实际应用中，这里应该调用打印功能
      // 显示打印弹窗
      this.selectedOrder = order;
      this.showOrderPrintModal = true;
    },
    toggleAllTemp() {
      this.temporaryOrders.forEach(order => {
        order.selected = this.selectAllTemp;
      });
    },
    toggleAllLong() {
      this.longTermOrders.forEach(order => {
        order.selected = this.selectAllLong;
      });
    },
    printSelectedOrder() {
      // 实现打印功能
      console.log('打印医嘱单，从第', this.startPage, '行开始');
      window.print();
      this.showOrderPrintModal = false;
    },
    setHistorySubTab(subTab) {
      this.historySubTab = subTab;
    },
    printHistory() {
      // 实现打印历史记录的功能
      console.log('打印历史记录');
    },
    toggleSelectAllNotes() {
      const newState = !this.progressNotes.some(note => note.selected);
      this.progressNotes.forEach(note => {
        note.selected = newState;
      });
    },
    printProgressNote(note) {
      // 实现打印病程记录的功能
      console.log('打印病程记录：', note.date);
      // 实际应用中，这里应该调用打印功能
      // 显示打印弹窗
      this.selectedProgressNote = note;
      this.showProgressNotePrintModal = true;
    },
    editProgressNote(note) {
      // 实现编辑病程记录的功能
      console.log('编辑病程记录：', note.date);
      // 实际应用中，这里应该调用编辑功能
      // 显示编辑弹窗
      this.selectedProgressNote = note;
      this.showProgressNoteEditModal = true;
    },
    viewProgressNote(note) {
      // 实现查看病程记录的功能
      console.log('查看病程记录：', note.date);
      // 实际应用中，这里应该调用查看功能
      // 显示查看弹窗
      this.selectedProgressNote = note;
      this.showProgressNoteViewModal = true;
    },
    saveProgressNote() {
      // 实现保存编辑后的病程记录的功能
      console.log('保存编辑后的病程记录：', this.selectedProgressNote);
      this.showProgressNoteEditModal = false;
      this.showProgressNotePrintModal = true;
    },
    confirmPrintProgressNote() {
      // 实现确认打印病程记录的功能
      console.log('确认打印病程记录：', this.selectedProgressNote);
      
      // 将病程记录标记为已打印
      if (this.selectedProgressNote && !this.selectedProgressNote.printed) {
        // 找到当前正在打印的病程记录
        const noteIndex = this.progressNotes.findIndex(note => 
          note.date === this.selectedProgressNote.date && 
          note.doctor === this.selectedProgressNote.doctor
        );
        
        if (noteIndex !== -1) {
          // 更新打印状态
          this.progressNotes[noteIndex].printed = true;
          // 初次打印后不能再编辑
          this.progressNotes[noteIndex].canEdit = false;
          
          // 真正的打印操作
          window.print();
          
          // 提示打印成功
          this.$message.success('打印成功');
        }
      } else {
        // 已经打印过，直接打印
        window.print();
      }
      
      this.showProgressNotePrintModal = false;
    }
  },
  created() {
    this.loadPatientData();
    
    // 从URL查询参数中获取默认标签
    const { tab } = this.$route.query;
    if (tab) {
      this.activeTab = tab;
      
      // 如果是医嘱管理，则默认显示临时医嘱
      if (tab === 'medical') {
        this.medicalSubTab = 'temp';
      }
    }
  }
}
</script>

<style scoped>
.health-archive-create {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
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

.basic-info, .room-info, .admission-info {
  margin-right: 30px;
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
  display: flex;
  align-items: center;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: bold;
}

.tab i {
  margin-right: 5px;
  font-size: 16px;
}

/* 医嘱管理子标签样式 */
.medical-tabs {
  display: flex;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 0 10px;
}

.sub-tab {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  position: relative;
}

.sub-tab.active {
  color: #1890ff;
  font-weight: bold;
  position: relative;
}

.sub-tab.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1890ff;
}

.tab-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.action-btn {
  margin-left: 10px;
  padding: 5px 12px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.action-btn i {
  margin-right: 5px;
}

.help-btn {
  color: #666;
}

.print-btn {
  color: #1890ff;
  border-color: #1890ff;
}

.notification-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 15px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.icon-alert {
  color: #faad14;
  margin-right: 10px;
}

.create-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.content-area {
  margin-top: 20px;
}

.basic-info-display {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 80px;
  padding: 12px 15px;
  background-color: #f5f5f5;
  font-weight: bold;
  border-right: 1px solid #e8e8e8;
}

.info-value {
  flex: 1;
  padding: 12px 15px;
  min-width: 200px;
}

.info-tips {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.tip-item {
  margin-bottom: 8px;
  color: #666;
}

.medical-content {
  margin-top: 20px;
}

.empty-placeholder {
  text-align: center;
  color: #999;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 打印医嘱单模态框样式 */
.print-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.print-modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.print-preview {
  border: 1px solid #e8e8e8;
  padding: 20px;
  min-height: 400px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.institution {
  font-size: 16px;
  color: #666;
}

.page-info {
  font-size: 14px;
  color: #999;
}

.print-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.patient-row {
  display: flex;
  margin-bottom: 20px;
}

.print-field {
  margin-right: 20px;
}

.field-label {
  color: #666;
  margin-right: 5px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.print-table th, 
.print-table td {
  border: 1px solid #d9d9d9;
  padding: 8px;
  text-align: center;
}

.print-table th {
  background-color: #f5f5f5;
}

.print-table td {
  height: 30px;
}

.print-notes {
  margin-top: 20px;
  background-color: #fffbe6;
  padding: 10px;
  border-radius: 4px;
}

.note-item {
  margin-bottom: 5px;
  color: #666;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
  background-color: #f5f5f5;
}

.print-options {
  display: flex;
  align-items: center;
}

.page-input {
  width: 50px;
  margin: 0 5px;
  padding: 4px;
  text-align: center;
}

.action-buttons {
  display: flex;
}

.cancel-button {
  margin-right: 10px;
  padding: 6px 16px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.print-button {
  padding: 6px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.print-button i {
  margin-right: 5px;
}

@media print {
  .patient-info-bar, 
  .tabs, 
  .medical-tabs, 
  .notification-alert,
  .modal-header, 
  .modal-footer,
  .print-controls {
    display: none !important;
  }
  
  .print-modal {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
    max-height: none;
    padding: 0;
    margin: 0;
  }
  
  .modal-body {
    padding: 0;
  }
  
  .print-preview {
    border: none;
  }
  
  body * {
    visibility: hidden;
  }
  
  .print-preview, .print-preview * {
    visibility: visible;
  }
  
  .print-preview {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}

/* 医嘱管理表格样式 */
.medical-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.medical-table {
  width: 100%;
  border-collapse: collapse;
}

.medical-table th {
  background-color: #f5f5f5;
  padding: 12px 8px;
  text-align: left;
  font-weight: normal;
  color: #666;
  border-bottom: 1px solid #e8e8e8;
}

.medical-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e8e8e8;
}

.time-cell {
  color: #1890ff;
  cursor: pointer;
}

.content-cell {
  word-break: break-all;
}

.sub-content {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.dosage-cell, .usage-cell {
  word-break: break-all;
}

.blue-text {
  color: #1890ff;
}

.stop-time {
  color: #f5222d;
}

.action-cell {
  width: 240px;
  white-space: nowrap;
}

/* 文字按钮样式 */
.action-btn-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  margin-right: 5px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background-color: white;
  font-size: 12px;
  cursor: pointer;
  color: white;
}

.action-btn-text i {
  margin-right: 3px;
}

.action-btn-text.view-btn {
  background-color: #409eff;
}

.action-btn-text.view-btn:hover {
  background-color: #66b1ff;
}

.action-btn-text.edit-btn {
  background-color: #f0ad4e;
}

.action-btn-text.edit-btn:hover {
  background-color: #ebb563;
}

.action-btn-text.print-btn {
  background-color: #5cb85c;
}

.action-btn-text.print-btn:hover {
  background-color: #85ce61;
}

.empty-row {
  text-align: center;
  padding: 20px 0;
  color: #909399;
}

.table-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  margin: 0 2px;
  border: none;
  background: none;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.pagination-info {
  display: flex;
  align-items: center;
}

.checkbox-container {
  margin-right: 10px;
}

.batch-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.batch-btn i {
  margin-right: 5px;
}

.print-batch-btn {
  background-color: #1890ff;
}

.pagination-pages {
  display: flex;
  align-items: center;
}

.page-numbers {
  display: flex;
  margin: 0 10px;
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
  background-color: #1890ff;
  color: white;
}

.yellow-tip {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.yellow-tip.executed {
  margin-bottom: 20px;
}

/* 停止长期医嘱弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.stop-order-modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 600px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.close-button {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
}

.close-button:hover {
  color: #409eff;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.stop-order-info {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.5;
}

.stop-order-form {
  margin-bottom: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.form-label {
  width: 80px;
  text-align: right;
  padding-right: 12px;
  color: #606266;
  font-size: 14px;
}

.form-input {
  flex: 1;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 15px;
  color: #606266;
  background-color: #f5f7fa;
  cursor: pointer;
}

.form-checkbox {
  margin-left: 15px;
  display: flex;
  align-items: center;
}

.form-checkbox input[type="checkbox"] {
  margin-right: 5px;
}

.stop-order-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.order-item {
  padding: 12px 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-item:last-child {
  border-bottom: none;
}

.order-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}

.order-details {
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  color: #606266;
}

.order-detail-item {
  margin-right: 20px;
  margin-bottom: 5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.cancel-button, .submit-button {
  padding: 9px 15px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  margin-left: 10px;
}

.cancel-button {
  background-color: white;
  color: #606266;
}

.cancel-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.submit-button {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.submit-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 添加查看医嘱详情抽屉样式 */
.order-detail-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;
  width: 480px;
  background-color: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #f5f5f5;
  position: relative;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.drawer-header .close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  z-index: 2;
}

.drawer-header .close-button:hover {
  color: #409eff;
}

.drawer-content {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
}

.order-info-section {
  margin-bottom: 20px;
}

.order-info-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  width: 80px;
  font-weight: bold;
}

.info-value {
  flex: 1;
}

.order-detail-tips {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.order-tip-header {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.order-operators-info {
  margin-top: 20px;
}

.operators-header {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.operator-row {
  display: flex;
  margin-bottom: 5px;
}

.operator-label {
  width: 80px;
  font-weight: bold;
}

.operator-value {
  flex: 1;
}

/* 添加医嘱打印弹窗样式 */
.print-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.print-modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.print-preview {
  border: 1px solid #e8e8e8;
  padding: 20px;
  min-height: 400px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.institution {
  font-size: 16px;
  color: #666;
}

.page-info {
  font-size: 14px;
  color: #999;
}

.print-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.patient-row {
  display: flex;
  margin-bottom: 20px;
}

.print-field {
  margin-right: 20px;
}

.field-label {
  color: #666;
  margin-right: 5px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.print-table th, 
.print-table td {
  border: 1px solid #d9d9d9;
  padding: 8px;
  text-align: center;
}

.print-table th {
  background-color: #f5f5f5;
}

.print-table td {
  height: 30px;
}

.print-notes {
  margin-top: 20px;
  background-color: #fffbe6;
  padding: 10px;
  border-radius: 4px;
}

.note-item {
  margin-bottom: 5px;
  color: #666;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
  background-color: #f5f5f5;
}

.print-options {
  display: flex;
  align-items: center;
}

.page-input {
  width: 50px;
  margin: 0 5px;
  padding: 4px;
  text-align: center;
}

.action-buttons {
  display: flex;
}

.cancel-button {
  margin-right: 10px;
  padding: 6px 16px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.print-button {
  padding: 6px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.print-button i {
  margin-right: 5px;
}

/* 病史记录相关样式 */
.history-content {
  margin-top: 20px;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.tabs-selector {
  display: flex;
}

.tab-btn {
  padding: 6px 15px;
  border: 1px solid #dcdfe6;
  background-color: #f5f5f5;
  cursor: pointer;
  font-size: 14px;
}

.tab-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.tab-btn:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.tab-btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.create-note-btn {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.create-note-btn i {
  margin-right: 5px;
}

.data-table-container {
  margin-bottom: 20px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f5f5f5;
  padding: 12px 8px;
  text-align: left;
  font-weight: normal;
  color: #666;
  border-bottom: 1px solid #e8e8e8;
}

.data-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e8e8e8;
}

.operation-cell {
  width: 240px;
  white-space: nowrap;
}

.btn-group {
  display: flex;
  gap: 5px;
}

.action-btn-simple {
  padding: 5px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-size: 12px;
  min-width: 50px;
  text-align: center;
}

.action-btn-simple.view-btn {
  background-color: #409eff;
}

.action-btn-simple.edit-btn {
  background-color: #f0ad4e;
}

.action-btn-simple.pause-btn {
  background-color: #e6a23c;
}

.action-btn-simple.stop-btn {
  background-color: #f56c6c;
}

.action-btn-simple.print-btn {
  background-color: #5cb85c;
}

.action-btn-simple.disabled-btn {
  background-color: #c0c4cc;
  cursor: default;
  opacity: 0.7;
}

.action-icon-btn {
  width: 28px;
  height: 28px;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.action-icon-btn.print-btn:hover {
  color: #67c23a;
  border-color: #67c23a;
}

.action-icon-btn.edit-btn:hover {
  color: #e6a23c;
  border-color: #e6a23c;
}

.text-warning {
  color: #e6a23c;
  margin-left: 5px;
}

.print-tips {
  background-color: #fffbe6;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.print-tip-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.print-tip-item {
  margin-bottom: 5px;
  color: #666;
}

/* 入院记录样式 */
.admission-record {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}

.admission-header {
  text-align: center;
  margin-bottom: 20px;
}

.institution-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.record-title {
  font-size: 22px;
  font-weight: bold;
}

.patient-basic-info {
  margin-bottom: 30px;
}

.info-item {
  display: inline-block;
  margin-right: 30px;
  margin-bottom: 10px;
}

.info-label {
  color: #666;
  margin-right: 5px;
}

.medical-sections {
  margin-bottom: 30px;
}

.section-item {
  margin-bottom: 15px;
  display: flex;
  border-bottom: 1px dashed #e8e8e8;
  padding-bottom: 10px;
}

.section-title {
  font-weight: bold;
  width: 150px;
  flex-shrink: 0;
}

.section-content {
  flex: 1;
}

.content-text-link {
  color: #1890ff;
  cursor: pointer;
}

.content-text-link:hover {
  text-decoration: underline;
}

.physical-examination {
  margin-top: 30px;
}

.section-page {
  text-align: right;
  color: #999;
  margin-bottom: 10px;
}

.patient-info-brief {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.examination-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-decoration: underline;
}

.vital-signs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.sign-item {
  text-align: center;
}

.sign-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.general-condition {
  margin-bottom: 20px;
}

.condition-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.condition-item {
  display: inline-block;
  margin-right: 20px;
}

.condition-label {
  font-weight: bold;
  margin-right: 5px;
}

.body-parts {
  margin-top: 20px;
}

.part-item {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px dashed #e8e8e8;
  padding-bottom: 5px;
}

.part-title {
  width: 100px;
  font-weight: bold;
  text-align: right;
  padding-right: 15px;
}

.part-content {
  flex: 1;
}

.laboratory-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0;
  text-decoration: underline;
}

.laboratory-section {
  margin-bottom: 20px;
}

.lab-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.lab-content {
  line-height: 1.6;
}

.summary-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e8e8e8;
}

.summary-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-decoration: underline;
}

.summary-content {
  margin-bottom: 20px;
  line-height: 1.6;
}

.diagnosis-plan {
  display: flex;
  margin-bottom: 30px;
}

.diagnosis, .treatment-plan {
  flex: 1;
}

.diagnosis-title, .plan-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.diagnosis-items, .plan-items {
  line-height: 1.8;
}

.doctor-signature {
  text-align: right;
  margin-top: 30px;
}

.signature-label, .date-label {
  margin-bottom: 10px;
}

.progress-note-modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.progress-note-info {
  margin-bottom: 20px;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.note-meta div {
  font-size: 14px;
  color: #666;
}

.note-content {
  font-size: 16px;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
}

.action-btn {
  margin-left: 10px;
  padding: 6px 16px;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.action-btn i {
  margin-right: 5px;
}

.close-btn {
  background-color: #f5f7fa;
}

.save-btn {
  background-color: #67c23a;
  color: white;
}

.cancel-btn {
  background-color: #f5f7fa;
}

.progress-note-preview {
  border: 1px solid #e8e8e8;
  padding: 20px;
  min-height: 400px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 18px;
  font-weight: bold;
}

.page-number {
  font-size: 14px;
  color: #999;
}

.patient-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.patient-info-item {
  font-size: 14px;
  color: #666;
}

.date-line {
  text-align: right;
  margin-bottom: 10px;
}

.note-content-preview {
  font-size: 16px;
  color: #333;
}

.doctor-signature {
  text-align: right;
  margin-top: 20px;
}

.print-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.page-controls {
  display: flex;
  align-items: center;
}

.print-actions {
  display: flex;
}

.print-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.print-btn i {
  margin-right: 5px;
}

.temperature-input {
  width: 50px;
  margin-left: 5px;
  padding: 4px;
  text-align: center;
}

.content-textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 10px;
}

.text-warning {
  color: #e6a23c;
  margin-left: 5px;
}

.disabled-btn {
  opacity: 0.5;
  color: #909399 !important;
  border-color: #dcdfe6 !important;
  cursor: default !important;
}

.disabled-btn:hover {
  color: #909399 !important;
  border-color: #dcdfe6 !important;
}

.print-tips {
  background-color: #fffbe6;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.add-note-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.add-note-btn i {
  margin-right: 5px;
}
</style> 