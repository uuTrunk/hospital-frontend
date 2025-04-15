<template>
  <div class="assessment-detail-container">
    <!-- 患者信息卡片 -->
    <el-card class="info-card">
      <div slot="header" class="card-header">
        <el-icon><UserFilled /></el-icon>
        <span>患者信息</span>
      </div>
      <el-form label-width="100px" class="patient-info">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="姓名：">
              <span>{{ patient.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="性别：">
              <span>{{ patient.gender }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="年龄：">
              <span>{{ patient.age }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="身份证号：">
              <span>{{ patient.idNumber }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="登记时间：">
              <span>{{ formatDateTime(patient.registrationTime) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 评估选项卡 -->
    <div class="assessment-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'health' }"
        @click="activeTab = 'health'"
      >
        健康评估
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'care' }"
        @click="activeTab = 'care'"
      >
        首次照护评估
      </div>
    </div>

    <!-- 健康评估内容 -->
    <div v-if="activeTab === 'health'" class="assessment-content">
      <!-- 评估信息部分 -->
      <div class="assessment-section">
        <h3 class="section-title">评估信息</h3>
        <div class="section-content">
          <div class="history-item">
            <span class="history-label">现病史</span>
            <div class="history-actions">
              <div class="symptom-tag" v-for="symptom in currentIllnesses" :key="symptom.id">
                {{ symptom.name }} <i class="icon-close" @click="removeSymptom('current', symptom.id)"></i>
              </div>
              <div class="search-wrapper">
                <input 
                  type="text" 
                  class="search-symptom" 
                  placeholder="请输入疾病名称" 
                  v-model="currentSearchKeyword"
                  @input="searchSymptoms('current')"
                  @focus="showCurrentSuggestions = true"
                  @blur="hideSuggestionsDelayed('current')"
                />
                <div class="suggestions" v-show="showCurrentSuggestions && currentFilteredSymptoms.length > 0">
                  <div 
                    v-for="symptom in currentFilteredSymptoms" 
                    :key="symptom.id" 
                    class="suggestion-item"
                    @click="addSymptom('current', symptom)"
                    @mousedown.prevent
                  >
                    {{ symptom.name }}
                  </div>
                </div>
              </div>
              <span class="tip">填写现有疾病名称</span>
            </div>
          </div>

          <div class="history-item">
            <span class="history-label">既往病史</span>
            <div class="history-actions">
              <div class="symptom-tag" v-for="symptom in pastIllnesses" :key="symptom.id">
                {{ symptom.name }} <i class="icon-close" @click="removeSymptom('past', symptom.id)"></i>
              </div>
              <div class="search-wrapper">
                <input 
                  type="text" 
                  class="search-symptom" 
                  placeholder="请输入疾病名称" 
                  v-model="pastSearchKeyword"
                  @input="searchSymptoms('past')"
                  @focus="showPastSuggestions = true"
                  @blur="hideSuggestionsDelayed('past')"
                />
                <div class="suggestions" v-show="showPastSuggestions && pastFilteredSymptoms.length > 0">
                  <div 
                    v-for="symptom in pastFilteredSymptoms" 
                    :key="symptom.id" 
                    class="suggestion-item"
                    @click="addSymptom('past', symptom)"
                    @mousedown.prevent
                  >
                    {{ symptom.name }}
                  </div>
                </div>
              </div>
              <span class="tip">填写曾经患有的疾病名称</span>
            </div>
          </div>

          <div class="history-item">
            <span class="history-label">禁忌药品</span>
            <textarea
              v-model="medicalForm.forbiddenMedicine"
              placeholder="请输入禁忌药品"
              class="history-textarea"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 上传检查报告 -->
      <div class="assessment-section">
        <h3 class="section-title">上传检查报告</h3>
        <div class="section-content">
          <div class="upload-tip">
            仅支持jpg、png格式，且不超过5M
          </div>

          <div class="upload-items">
            <div class="upload-item">
              <span class="upload-label">生化检验</span>
              <div class="upload-actions">
                <div class="upload-preview-list" v-if="uploadFiles.biochemical && uploadFiles.biochemical.length">
                  <div class="upload-preview" v-for="(file, index) in uploadFiles.biochemical" :key="index">
                    <img :src="file.url || file" alt="预览" class="preview-img" />
                    <div class="preview-delete" @click="removeFile('biochemical', index)">×</div>
                  </div>
                  <div class="preview-count" v-if="uploadFiles.biochemical.length > 0">
                    {{ uploadFiles.biochemical.length }}/5
                  </div>
                </div>
                <label class="upload-btn" v-if="uploadFiles.biochemical.length < 5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    @change="handleFileUpload($event, 'biochemical')" 
                    style="display:none" 
                  />
                  <i class="icon-plus"></i>
                </label>
              </div>
            </div>

            <div class="upload-item">
              <span class="upload-label">X光</span>
              <div class="upload-actions">
                <div class="upload-preview-list" v-if="uploadFiles.xray && uploadFiles.xray.length">
                  <div class="upload-preview" v-for="(file, index) in uploadFiles.xray" :key="index">
                    <img :src="file.url || file" alt="预览" class="preview-img" />
                    <div class="preview-delete" @click="removeFile('xray', index)">×</div>
                  </div>
                  <div class="preview-count" v-if="uploadFiles.xray.length > 0">
                    {{ uploadFiles.xray.length }}/5
                  </div>
                </div>
                <label class="upload-btn" v-if="uploadFiles.xray.length < 5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    @change="handleFileUpload($event, 'xray')" 
                    style="display:none" 
                  />
                  <i class="icon-plus"></i>
                </label>
              </div>
            </div>

            <div class="upload-item">
              <span class="upload-label">超声检查</span>
              <div class="upload-actions">
                <div class="upload-preview-list" v-if="uploadFiles.ultrasound && uploadFiles.ultrasound.length">
                  <div class="upload-preview" v-for="(file, index) in uploadFiles.ultrasound" :key="index">
                    <img :src="file.url || file" alt="预览" class="preview-img" />
                    <div class="preview-delete" @click="removeFile('ultrasound', index)">×</div>
                  </div>
                  <div class="preview-count" v-if="uploadFiles.ultrasound.length > 0">
                    {{ uploadFiles.ultrasound.length }}/5
                  </div>
                </div>
                <label class="upload-btn" v-if="uploadFiles.ultrasound.length < 5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    @change="handleFileUpload($event, 'ultrasound')" 
                    style="display:none" 
                  />
                  <i class="icon-plus"></i>
                </label>
              </div>
            </div>

            <div class="upload-item">
              <span class="upload-label">心电图</span>
              <div class="upload-actions">
                <div class="upload-preview-list" v-if="uploadFiles.ecg && uploadFiles.ecg.length">
                  <div class="upload-preview" v-for="(file, index) in uploadFiles.ecg" :key="index">
                    <img :src="file.url || file" alt="预览" class="preview-img" />
                    <div class="preview-delete" @click="removeFile('ecg', index)">×</div>
                  </div>
                  <div class="preview-count" v-if="uploadFiles.ecg.length > 0">
                    {{ uploadFiles.ecg.length }}/5
                  </div>
                </div>
                <label class="upload-btn" v-if="uploadFiles.ecg.length < 5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    @change="handleFileUpload($event, 'ecg')" 
                    style="display:none" 
                  />
                  <i class="icon-plus"></i>
                </label>
              </div>
            </div>

            <div class="upload-item">
              <span class="upload-label">CT</span>
              <div class="upload-actions">
                <div class="upload-preview-list" v-if="uploadFiles.ct && uploadFiles.ct.length">
                  <div class="upload-preview" v-for="(file, index) in uploadFiles.ct" :key="index">
                    <img :src="file.url || file" alt="预览" class="preview-img" />
                    <div class="preview-delete" @click="removeFile('ct', index)">×</div>
                  </div>
                  <div class="preview-count" v-if="uploadFiles.ct.length > 0">
                    {{ uploadFiles.ct.length }}/5
                  </div>
                </div>
                <label class="upload-btn" v-if="uploadFiles.ct.length < 5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    @change="handleFileUpload($event, 'ct')" 
                    style="display:none" 
                  />
                  <i class="icon-plus"></i>
                </label>
              </div>
            </div>

            <div class="upload-item">
              <span class="upload-label">其他</span>
              <div class="upload-actions">
                <div class="upload-preview-list" v-if="uploadFiles.other && uploadFiles.other.length">
                  <div class="upload-preview" v-for="(file, index) in uploadFiles.other" :key="index">
                    <img :src="file.url || file" alt="预览" class="preview-img" />
                    <div class="preview-delete" @click="removeFile('other', index)">×</div>
                  </div>
                  <div class="preview-count" v-if="uploadFiles.other.length > 0">
                    {{ uploadFiles.other.length }}/5
                  </div>
                </div>
                <label class="upload-btn" v-if="uploadFiles.other.length < 5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    @change="handleFileUpload($event, 'other')" 
                    style="display:none" 
                  />
                  <i class="icon-plus"></i>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 饮食禁忌 -->
      <div class="assessment-section">
        <h3 class="section-title">饮食禁忌</h3>
        <div class="section-content">
          <div class="diet-container">
            <div class="diet-row">
              <label class="diet-option">
                <input type="checkbox" v-model="diet.noSpicy">
                <span>无辣椒</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.liquidDiet">
                <span>流质</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.semiLiquidDiet">
                <span>半流质</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.softDiet">
                <span>软食</span>
              </label>
            </div>

            <div class="diet-row">
              <label class="diet-option">
                <input type="checkbox" v-model="diet.lowSalt">
                <span>低盐</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.lowSugar">
                <span>低糖</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.diabeticDiet">
                <span>糖尿病饮食</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.renalDiet">
                <span>肾食</span>
              </label>
            </div>

            <div class="diet-row">
              <label class="diet-option">
                <input type="checkbox" v-model="diet.highSalt">
                <span>高盐</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.highSugar">
                <span>高糖</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.highFat">
                <span>高脂</span>
              </label>
              
              <label class="diet-option">
                <input type="checkbox" v-model="diet.seafood">
                <span>海鲜</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 体检报告结论 -->
      <div class="assessment-section">
        <h3 class="section-title">体检报告结论<span class="required">*</span></h3>
        <div class="section-content">
          <textarea
            v-model="medicalForm.conclusion"
            placeholder="输入结论"
            class="conclusion-textarea"
          ></textarea>
        </div>
      </div>

      <!-- 入院决定 -->
      <div class="assessment-section">
        <div class="admission-decision">
          <label class="radio-option">
            <input type="radio" v-model="medicalForm.admissionDecision" value="admit">
            <span>同意入院</span>
          </label>
          
          <label class="radio-option">
            <input type="radio" v-model="medicalForm.admissionDecision" value="reject">
            <span>不同意入院</span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 首次照护评估内容 -->
    <div v-if="activeTab === 'care'" class="assessment-content">
      <!-- 生活自理能力评估 -->
      <div class="assessment-section">
        <div class="care-assessment-item">
          <div class="care-label">生活自理能力</div>
          <div class="care-content">
            <div class="care-slider-container">
              <div class="slider-label">生活料理能力</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.daily === 0 }"
                    @click="setCareLevel('selfCare', 'daily', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.daily === 1 }"
                    @click="setCareLevel('selfCare', 'daily', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.daily === 2 }"
                    @click="setCareLevel('selfCare', 'daily', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.daily === 3 }"
                    @click="setCareLevel('selfCare', 'daily', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('selfCare', 'daily') }"></div>
                </div>
              </div>
              
              <div class="slider-label">进食能力</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.eating === 0 }"
                    @click="setCareLevel('selfCare', 'eating', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.eating === 1 }"
                    @click="setCareLevel('selfCare', 'eating', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.eating === 2 }"
                    @click="setCareLevel('selfCare', 'eating', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.eating === 3 }"
                    @click="setCareLevel('selfCare', 'eating', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('selfCare', 'eating') }"></div>
                </div>
              </div>
              
              <div class="slider-label">如厕能力</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.toilet === 0 }"
                    @click="setCareLevel('selfCare', 'toilet', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.toilet === 1 }"
                    @click="setCareLevel('selfCare', 'toilet', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.toilet === 2 }"
                    @click="setCareLevel('selfCare', 'toilet', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.selfCare.toilet === 3 }"
                    @click="setCareLevel('selfCare', 'toilet', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('selfCare', 'toilet') }"></div>
                </div>
              </div>
              
              <div class="reason-label">评估说明</div>
              <div class="reason-textarea-container">
                <textarea 
                  class="reason-textarea" 
                  v-model="careForm.selfCare.notes" 
                  placeholder="输入评价"
                ></textarea>
                <div class="reason-note" v-if="careForm.selfCare.notes.length > 0">!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 认知能力评估 -->
      <div class="assessment-section">
        <div class="care-assessment-item">
          <div class="care-label">认知能力</div>
          <div class="care-content">
            <div class="care-slider-container">
              <div class="slider-label">环境认知</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.environment === 0 }"
                    @click="setCareLevel('cognition', 'environment', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.environment === 1 }"
                    @click="setCareLevel('cognition', 'environment', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.environment === 2 }"
                    @click="setCareLevel('cognition', 'environment', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.environment === 3 }"
                    @click="setCareLevel('cognition', 'environment', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('cognition', 'environment') }"></div>
                </div>
              </div>
              
              <div class="slider-label">时间认知</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.time === 0 }"
                    @click="setCareLevel('cognition', 'time', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.time === 1 }"
                    @click="setCareLevel('cognition', 'time', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.time === 2 }"
                    @click="setCareLevel('cognition', 'time', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.time === 3 }"
                    @click="setCareLevel('cognition', 'time', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('cognition', 'time') }"></div>
                </div>
              </div>
              
              <div class="slider-label">人物认知</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.people === 0 }"
                    @click="setCareLevel('cognition', 'people', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.people === 1 }"
                    @click="setCareLevel('cognition', 'people', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.people === 2 }"
                    @click="setCareLevel('cognition', 'people', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.cognition.people === 3 }"
                    @click="setCareLevel('cognition', 'people', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('cognition', 'people') }"></div>
                </div>
              </div>
              
              <div class="reason-label">评估说明</div>
              <div class="reason-textarea-container">
                <textarea 
                  class="reason-textarea" 
                  v-model="careForm.cognition.notes" 
                  placeholder="输入评价"
                ></textarea>
                <div class="reason-note" v-if="careForm.cognition.notes.length > 0">!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 情绪行为评估 -->
      <div class="assessment-section">
        <div class="care-assessment-item">
          <div class="care-label">情绪行为</div>
          <div class="care-content">
            <div class="care-slider-container">
              <div class="slider-label">焦虑程度</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.anxiety === 0 }"
                    @click="setCareLevel('emotion', 'anxiety', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.anxiety === 1 }"
                    @click="setCareLevel('emotion', 'anxiety', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.anxiety === 2 }"
                    @click="setCareLevel('emotion', 'anxiety', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.anxiety === 3 }"
                    @click="setCareLevel('emotion', 'anxiety', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('emotion', 'anxiety') }"></div>
                </div>
              </div>
              
              <div class="slider-label">抑郁程度</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.depression === 0 }"
                    @click="setCareLevel('emotion', 'depression', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.depression === 1 }"
                    @click="setCareLevel('emotion', 'depression', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.depression === 2 }"
                    @click="setCareLevel('emotion', 'depression', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.depression === 3 }"
                    @click="setCareLevel('emotion', 'depression', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('emotion', 'depression') }"></div>
                </div>
              </div>
              
              <div class="slider-label">行为异常</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.behavior === 0 }"
                    @click="setCareLevel('emotion', 'behavior', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.behavior === 1 }"
                    @click="setCareLevel('emotion', 'behavior', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.behavior === 2 }"
                    @click="setCareLevel('emotion', 'behavior', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.emotion.behavior === 3 }"
                    @click="setCareLevel('emotion', 'behavior', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('emotion', 'behavior') }"></div>
                </div>
              </div>
              
              <div class="reason-label">评估说明</div>
              <div class="reason-textarea-container">
                <textarea 
                  class="reason-textarea" 
                  v-model="careForm.emotion.notes" 
                  placeholder="输入评价"
                ></textarea>
                <div class="reason-note" v-if="careForm.emotion.notes.length > 0">!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 极端情况评估 -->
      <div class="assessment-section">
        <div class="care-assessment-item">
          <div class="care-label">极端情况</div>
          <div class="care-content">
            <div class="care-slider-container">
              <div class="slider-label">自伤倾向</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.selfHarm === 0 }"
                    @click="setCareLevel('extreme', 'selfHarm', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.selfHarm === 1 }"
                    @click="setCareLevel('extreme', 'selfHarm', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.selfHarm === 2 }"
                    @click="setCareLevel('extreme', 'selfHarm', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.selfHarm === 3 }"
                    @click="setCareLevel('extreme', 'selfHarm', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('extreme', 'selfHarm') }"></div>
                </div>
              </div>
              
              <div class="slider-label">攻击倾向</div>
              <div class="slider-container">
                <div class="slider-track">
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.aggression === 0 }"
                    @click="setCareLevel('extreme', 'aggression', 0)"
                  >正常</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.aggression === 1 }"
                    @click="setCareLevel('extreme', 'aggression', 1)"
                  >轻度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.aggression === 2 }"
                    @click="setCareLevel('extreme', 'aggression', 2)"
                  >中度</div>
                  <div 
                    class="slider-level" 
                    :class="{ active: careForm.extreme.aggression === 3 }"
                    @click="setCareLevel('extreme', 'aggression', 3)"
                  >重度</div>
                  <div class="slider-progress" :style="{ width: getProgressWidth('extreme', 'aggression') }"></div>
                </div>
              </div>
              
              <div class="reason-label">评估说明</div>
              <div class="reason-textarea-container">
                <textarea 
                  class="reason-textarea" 
                  v-model="careForm.extreme.notes" 
                  placeholder="输入评价"
                ></textarea>
                <div class="reason-note" v-if="careForm.extreme.notes.length > 0">!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 症状选择对话框 -->
    <symptom-dialog
      :visible="dialogVisible"
      :type="dialogType"
      :initial-selected="dialogInitialSelected"
      @confirm="confirmSymptoms"
      @cancel="cancelDialog"
    />
  </div>
</template>

<script>
import SymptomDialog from '../components/SymptomDialog.vue'
import { submitHealthAssessment, getHealthAssessmentDetail } from '@/api/healthAssessment'
import { getPatientInfoByAssessmentId } from '@/api/patient'

export default {
  name: 'HealthAssessment',
  components: {
    SymptomDialog
  },
  data() {
    return {
      activeTab: 'health',
      patient: {
        id: '',
        name: '',
        gender: '',
        age: '',
        idNumber: '',
        registrationTime: ''
      },
      dialogVisible: false,
      dialogType: '',
      dialogInitialSelected: [],
      currentIllnesses: [],
      pastIllnesses: [],
      currentSearchKeyword: '',
      pastSearchKeyword: '',
      showCurrentSuggestions: false,
      showPastSuggestions: false,
      currentFilteredSymptoms: [],
      pastFilteredSymptoms: [],
      medicalForm: {
        forbiddenMedicine: '',
        conclusion: '',
        admissionDecision: ''
      },
      uploadFiles: {
        biochemical: [],
        xray: [],
        ultrasound: [],
        ecg: [],
        ct: [],
        other: []
      },
      diet: {
        noSpicy: false,
        liquidDiet: false,
        semiLiquidDiet: false,
        softDiet: false,
        lowSalt: false,
        lowSugar: false,
        diabeticDiet: false,
        renalDiet: false,
        highSalt: false,
        highSugar: false,
        highFat: false,
        seafood: false
      },
      careForm: {
        selfCare: {
          daily: 0,
          eating: 0,
          toilet: 0,
          notes: ''
        },
        cognition: {
          environment: 0,
          time: 0,
          people: 0,
          notes: ''
        },
        emotion: {
          anxiety: 0,
          depression: 0,
          behavior: 0,
          notes: ''
        },
        extreme: {
          selfHarm: 0,
          aggression: 0,
          notes: ''
        }
      },
      isFormComplete: false
    }
  },
  created() {
    // 从路由参数中获取 assessment_id
    const assessmentId = this.$route.query.assessmentId;
    if (!assessmentId) {
      this.$message.error('缺少评估ID');
      this.goBack();
      return;
    }

    // 加载健康评估详情和患者信息
    this.loadAssessmentDetail(assessmentId);
    this.loadPatientInfo(assessmentId);
  },
  methods: {
    formatDateTime(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    
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
    
    async loadAssessmentDetail(assessmentId) {
      try {
        // 获取健康评估详情
        const assessmentResponse = await getHealthAssessmentDetail(assessmentId);
        console.log('原始响应:', assessmentResponse);
        
        if (assessmentResponse.code === 200) {
          const data = assessmentResponse.data;
          
          // 更新现病史
          this.currentIllnesses = data.currentIllness ? 
            data.currentIllness.map(name => ({ id: Date.now(), name })) : [];
          
          // 更新禁忌药品
          this.medicalForm.forbiddenMedicine = data.forbidden_medicines || '';
          
          // 更新饮食禁忌
          if (data.diet_restrictions) {
            data.diet_restrictions.forEach(restriction => {
              switch(restriction) {
                case '忌辣':
                  this.diet.noSpicy = true;
                  break;
                case '忌海鲜':
                  this.diet.seafood = true;
                  break;
                // 其他饮食禁忌项的处理...
              }
            });
          }
          
          // 初始化所有上传文件数组
          this.uploadFiles = {
            biochemical: data.biochemical_reports ? data.biochemical_reports.split(',').filter(Boolean) : [],
            xray: data.xray_reports ? data.xray_reports.split(',').filter(Boolean) : [],
            ultrasound: data.ultrasound_reports ? data.ultrasound_reports.split(',').filter(Boolean) : [],
            ecg: data.ecg_reports ? data.ecg_reports.split(',').filter(Boolean) : [],
            ct: data.ct_reports ? data.ct_reports.split(',').filter(Boolean) : [],
            other: data.other_reports ? data.other_reports.split(',').filter(Boolean) : []
          };
          
          // 更新体检报告结论
          this.medicalForm.conclusion = data.physical_conclusion || '';
          
          // 更新入院决定
          this.medicalForm.admissionDecision = data.admission_agreement === '同意入院' ? 'admit' : 'reject';

          // 检查表单是否完整
          this.checkFormComplete();
        } else {
          this.$message.error(assessmentResponse.message || '加载评估详情失败');
        }
      } catch (error) {
        console.error('加载评估详情失败:', error);
        this.$message.error('加载评估详情失败，请稍后重试');
      }
    },

    checkFormComplete() {
      // 检查必填项是否都已填写
      const isComplete = 
        this.currentIllnesses.length > 0 &&
        this.pastIllnesses.length > 0 &&
        this.medicalForm.forbiddenMedicine.trim() !== '' &&
        Object.values(this.uploadFiles).some(files => files.length > 0);
      
      this.isFormComplete = isComplete;
      return isComplete;
    },

    async saveAssessment() {
      try {
        const assessmentId = this.$route.query.assessmentId;
        // 准备提交的数据
        const assessmentData = {
          assessmentId,
          currentIllnesses: this.currentIllnesses.map(s => s.name).join(','),
          pastIllnesses: this.pastIllnesses.map(s => s.name).join(','),
          forbiddenMedicine: this.medicalForm.forbiddenMedicine,
          biochemicalReports: this.uploadFiles.biochemical.map(f => f.name).join(','),
          xrayReports: this.uploadFiles.xray.map(f => f.name).join(','),
          ultrasoundReports: this.uploadFiles.ultrasound.map(f => f.name).join(','),
          ecgReports: this.uploadFiles.ecg.map(f => f.name).join(','),
          ctReports: this.uploadFiles.ct.map(f => f.name).join(','),
          otherReports: this.uploadFiles.other.map(f => f.name).join(','),
          status: this.checkFormComplete() ? '完成' : '未完成'
        };

        // 调用保存接口
        const response = await submitHealthAssessment(assessmentData);
        
        if (response.code === 200) {
          this.$message.success('保存成功');
          if (assessmentData.status === '完成') {
            this.$message.success('评估已完成');
          }
          // 返回列表页面
          this.goBack();
        } else {
          this.$message.error(response.message || '保存失败');
        }
      } catch (error) {
        console.error('保存评估失败:', error);
        this.$message.error('保存失败：' + (error.response?.data?.message || error.message));
      }
    },

    goBack() {
      this.$router.push('/admission-assessment');
    },

    async loadPatientInfo(assessmentId) {
      try {
        const response = await getPatientInfoByAssessmentId(assessmentId);
        if (response.code === 200) {
          const patientInfo = response.data;
          this.patient = {
            id: patientInfo.patientId,
            name: patientInfo.name,
            gender: patientInfo.gender,
            age: this.calculateAge(patientInfo.idNumber),
            idNumber: patientInfo.idNumber,
            registrationTime: patientInfo.registrationDate
          };
        } else {
          this.$message.error(response.message || '加载患者信息失败');
        }
      } catch (error) {
        console.error('加载患者信息失败:', error);
        this.$message.error('加载患者信息失败，请稍后重试');
      }
    },

    handleSave() {
      this.saveAssessment();
    },

    confirmSymptoms(selectedSymptoms) {
      if (this.dialogType === 'current') {
        this.currentIllnesses = selectedSymptoms;
      } else {
        this.pastIllnesses = selectedSymptoms;
      }
      this.dialogVisible = false;
    },

    cancelDialog() {
      this.dialogVisible = false;
    },

    removeSymptom(type, id) {
      if (type === 'current') {
        this.currentIllnesses = this.currentIllnesses.filter(item => item.id !== id);
      } else {
        this.pastIllnesses = this.pastIllnesses.filter(item => item.id !== id);
      }
    },

    searchSymptoms(type) {
      const keyword = type === 'current' ? this.currentSearchKeyword : this.pastSearchKeyword;
      // 这里应该调用后端API进行搜索，现在先模拟一些数据
      const mockSymptoms = [
        { id: 1, name: '高血压' },
        { id: 2, name: '糖尿病' },
        { id: 3, name: '冠心病' }
      ].filter(s => s.name.includes(keyword));
      
      if (type === 'current') {
        this.currentFilteredSymptoms = mockSymptoms;
      } else {
        this.pastFilteredSymptoms = mockSymptoms;
      }
    },

    addSymptom(type, symptom) {
      if (type === 'current') {
        this.currentIllnesses.push(symptom);
        this.currentSearchKeyword = '';
        this.showCurrentSuggestions = false;
      } else {
        this.pastIllnesses.push(symptom);
        this.pastSearchKeyword = '';
        this.showPastSuggestions = false;
      }
    },

    hideSuggestionsDelayed(type) {
      setTimeout(() => {
        if (type === 'current') {
          this.showCurrentSuggestions = false;
        } else {
          this.showPastSuggestions = false;
        }
      }, 200);
    },

    handleFileUpload(event, type) {
      const file = event.target.files[0];
      if (file) {
        // 处理文件上传
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadFiles[type].push({
            name: file.name,
            url: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    },

    removeFile(type, index) {
      this.uploadFiles[type].splice(index, 1);
    },

    setCareLevel(category, type, level) {
      this.careForm[category][type] = level;
    },
    
    getProgressWidth(category, type) {
      const level = this.careForm[category][type];
      return `${(level + 1) * 25}%`;
    }
  }
}
</script>

<style scoped>
/* 定义莫兰迪配色变量 */
:root {
  --morandiBlue: #94b0b8;
  --morandiGreen: #8ba89f;
  --morandiTeal: #7da4a4;
  --morandiGray: #b4bcc0;
  --morandiLightBlue: #c5d5da;
  --morandiLightGreen: #cad7d3;
  --morandiBg: #f5f7f8;
  --morandiText: #5c6b73;
  --morandiDark: #445963;
  --morandiHover: #86a5ae;
}

.assessment-detail-container {
  padding: 24px;
  background-color: var(--morandiBg);
  min-height: 100vh;
}

.info-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(148, 176, 184, 0.1);
  transition: all 0.3s ease;
  background-color: #fff;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px 0 rgba(148, 176, 184, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--morandiLightBlue);
    
    .el-icon {
      margin-right: 12px;
      font-size: 20px;
      color: var(--morandiTeal);
    }

    span {
      font-size: 16px;
      font-weight: 600;
      color: var(--morandiDark);
    }
  }
  
  .patient-info {
    padding: 20px;
    
    .el-form-item {
      margin-bottom: 16px;
    }
    
    span {
      color: #606266;
      font-size: 14px;
    }
  }
}

.assessment-tabs {
  display: flex;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #f0f2f5;
  margin-bottom: 0;
  padding: 0 20px;
}

.tab-item {
  padding: 16px 32px;
  cursor: pointer;
  position: relative;
  font-size: 15px;
  color: var(--morandiText);
  transition: all 0.3s ease;

  &:hover {
    color: var(--morandiTeal);
  }

  &.active {
    color: var(--morandiTeal);
    font-weight: 500;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--morandiTeal);
      border-radius: 2px 2px 0 0;
    }
  }
}

.assessment-content {
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
}

.assessment-section {
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  position: relative;
  padding-left: 12px;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: var(--morandiTeal);
    border-radius: 2px;
  }
}

.section-content {
  padding: 0 12px;
}

.history-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.history-label {
  width: 90px;
  color: #606266;
  flex-shrink: 0;
  line-height: 32px;
  font-weight: 500;
}

.history-actions {
  flex: 1;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
}

.search-wrapper {
  position: relative;
  width: 320px;
  margin-right: 12px;
}

.search-symptom {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  height: 36px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--morandiTeal);
    box-shadow: 0 0 0 2px rgba(125, 164, 164, 0.2);
  }
}

.tip {
  font-size: 13px;
  color: var(--morandiText);
  margin-left: 8px;
  line-height: 36px;
}

.symptom-tag {
  background-color: var(--morandiLightBlue);
  border: 1px solid var(--morandiBlue);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--morandiDark);
  margin-right: 8px;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  height: 32px;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--morandiBlue);
    color: #fff;
  }

  .icon-close {
    margin-left: 6px;
    font-size: 12px;
    color: var(--morandiDark);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: #fff;
    }
  }
}

.history-textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--morandiTeal);
    box-shadow: 0 0 0 2px rgba(125, 164, 164, 0.2);
  }
}

.upload-tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 20px;
  padding: 8px 16px;
  background-color: #f4f4f5;
  border-radius: 4px;
  display: flex;
  align-items: center;

  &:before {
    content: "!";
    width: 16px;
    height: 16px;
    background-color: #909399;
    color: #fff;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-size: 12px;
    font-weight: bold;
  }
}

.upload-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.upload-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f2f6fc;
  }
}

.upload-label {
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
  font-size: 14px;
}

.upload-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.upload-preview {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid var(--morandiLightBlue);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--morandiTeal);
  }
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(245, 108, 108, 0.9);
  }
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--morandiTeal);
    background-color: #f2f6fc;

    .icon-plus {
      color: var(--morandiTeal);
    }
  }

  .icon-plus {
    font-size: 24px;
    color: #909399;
    transition: all 0.3s ease;
  }
}

.diet-container {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

.diet-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.diet-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;

  input[type="checkbox"] {
    margin-right: 8px;
    cursor: pointer;
  }

  span {
    color: #606266;
    font-size: 14px;
  }

  &:hover span {
    color: var(--morandiTeal);
  }
}

.conclusion-textarea {
  width: 100%;
  min-height: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--morandiTeal);
    box-shadow: 0 0 0 2px rgba(125, 164, 164, 0.2);
  }
}

.required {
  color: var(--morandiDark);
  margin-left: 4px;
}

.admission-decision {
  display: flex;
  gap: 32px;
  margin: 24px 0;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  input[type="radio"] {
    margin-right: 8px;
    cursor: pointer;
  }

  span {
    color: #606266;
    font-size: 14px;
  }

  &:hover span {
    color: var(--morandiTeal);
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--morandiLightBlue);
    color: var(--morandiDark);
  }
}

/* 照护评估部分的样式优化 */
.care-assessment-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid var(--morandiLightBlue);
}

.care-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--morandiDark);
  padding: 16px 20px;
  background-color: var(--morandiBg);
  border-bottom: 1px solid var(--morandiLightBlue);
}

.care-content {
  padding: 20px;
}

.slider-container {
  margin: 16px 0 24px;
}

.slider-track {
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.slider-level {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  background-color: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--morandiLightBlue);
  }

  &.active {
    color: #fff;
  }
}

.slider-progress {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 为不同的级别设置渐变色背景 */
.slider-level:nth-child(1).active ~ .slider-progress {
  background: linear-gradient(45deg, var(--morandiGreen), var(--morandiLightGreen));
}

.slider-level:nth-child(2).active ~ .slider-progress {
  background: linear-gradient(45deg, var(--morandiBlue), var(--morandiLightBlue));
}

.slider-level:nth-child(3).active ~ .slider-progress {
  background: linear-gradient(45deg, var(--morandiTeal), var(--morandiBlue));
}

.slider-level:nth-child(4).active ~ .slider-progress {
  background: linear-gradient(45deg, var(--morandiDark), var(--morandiGray));
}

.reason-textarea {
  width: 100%;
  min-height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--morandiTeal);
    box-shadow: 0 0 0 2px rgba(125, 164, 164, 0.2);
  }
}

.reason-note {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 24px;
  height: 24px;
  background: linear-gradient(45deg, var(--morandiBlue), var(--morandiTeal));
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(255, 179, 0, 0.3);
}

/* 按钮样式 */
.el-button--primary {
  background-color: var(--morandiTeal);
  border-color: var(--morandiTeal);
  
  &:hover, &:focus {
    background-color: var(--morandiHover);
    border-color: var(--morandiHover);
  }
}

.el-button {
  &:hover, &:focus {
    color: var(--morandiTeal);
    border-color: var(--morandiLightBlue);
    background-color: var(--morandiBg);
  }
}

/* 表单控件 */
.el-input:focus, .el-textarea:focus {
  border-color: var(--morandiTeal);
}

/* 上传组件 */
.upload-preview {
  border: 2px solid var(--morandiLightBlue);
  
  &:hover {
    border-color: var(--morandiTeal);
  }
}

/* 复选框和单选框 */
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-radio__input.is-checked .el-radio__inner {
  background-color: var(--morandiTeal);
  border-color: var(--morandiTeal);
}
</style> 