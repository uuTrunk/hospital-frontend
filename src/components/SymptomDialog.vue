<template>
  <div class="dialog-container" v-if="visible">
    <div class="dialog-mask" @click="cancel"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
        <i class="icon-close" @click="cancel"></i>
      </div>
      
      <div class="dialog-body">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索疾病名称" 
            class="search-input"
          />
        </div>
        
        <div class="symptoms-list">
          <div class="category" v-for="(items, category) in filteredSymptoms" :key="category">
            <div class="category-title">{{ category }}</div>
            <div class="symptoms-grid">
              <div
                v-for="symptom in items"
                :key="symptom.id"
                class="symptom-item"
                :class="{ selected: isSelected(symptom.id) }"
                @click="toggleSymptom(symptom)"
              >
                {{ symptom.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="cancel-btn" @click="cancel">取消</button>
        <button class="confirm-btn" @click="confirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SymptomDialog',
  props: {
    visible: Boolean,
    type: String,
    initialSelected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchKeyword: '',
      selectedSymptoms: [],
      commonSymptoms: {
        '心脏类': [
          { id: 1, name: '高血压' },
          { id: 2, name: '心脏病' },
          { id: 3, name: '心绞痛' },
          { id: 4, name: '冠心病' },
          { id: 5, name: '心律不齐' }
        ],
        '神经类': [
          { id: 6, name: '头痛' },
          { id: 7, name: '偏头痛' },
          { id: 8, name: '癫痫' },
          { id: 9, name: '帕金森' },
          { id: 10, name: '失眠' }
        ],
        '消化系统': [
          { id: 11, name: '胃病' },
          { id: 12, name: '胃炎' },
          { id: 13, name: '胃溃疡' },
          { id: 14, name: '肠炎' },
          { id: 15, name: '十二指肠溃疡' }
        ],
        '呼吸系统': [
          { id: 16, name: '哮喘' },
          { id: 17, name: '支气管炎' },
          { id: 18, name: '肺炎' },
          { id: 19, name: '肺结核' },
          { id: 20, name: '肺气肿' }
        ],
        '代谢类': [
          { id: 21, name: '糖尿病' },
          { id: 22, name: '高血脂' },
          { id: 23, name: '痛风' },
          { id: 24, name: '肥胖' },
          { id: 25, name: '甲状腺功能亢进' }
        ]
      }
    }
  },
  computed: {
    title() {
      return `添加${this.type}`;
    },
    filteredSymptoms() {
      if (!this.searchKeyword) {
        return this.commonSymptoms;
      }
      
      const result = {};
      
      for (const [category, symptoms] of Object.entries(this.commonSymptoms)) {
        const filtered = symptoms.filter(s => 
          s.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
        
        if (filtered.length > 0) {
          result[category] = filtered;
        }
      }
      
      return result;
    }
  },
  methods: {
    isSelected(id) {
      return this.selectedSymptoms.includes(id);
    },
    toggleSymptom(symptom) {
      const index = this.selectedSymptoms.indexOf(symptom.id);
      if (index === -1) {
        this.selectedSymptoms.push(symptom.id);
      } else {
        this.selectedSymptoms.splice(index, 1);
      }
    },
    getSelectedSymptomsData() {
      const result = [];
      
      for (const category of Object.values(this.commonSymptoms)) {
        for (const symptom of category) {
          if (this.selectedSymptoms.includes(symptom.id)) {
            result.push(symptom);
          }
        }
      }
      
      return result;
    },
    confirm() {
      this.$emit('confirm', this.getSelectedSymptomsData());
    },
    cancel() {
      this.$emit('cancel');
    }
  },
  created() {
    this.selectedSymptoms = [...this.initialSelected];
  }
}
</script>

<style scoped>
.dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: relative;
  width: 660px;
  max-width: 90%;
  max-height: 80%;
  background-color: white;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  z-index: 1001;
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
}

.icon-close {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.icon-close:hover {
  background-color: #f0f0f0;
}

.icon-close:after {
  content: "×";
  font-size: 20px;
  color: #999;
}

.dialog-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.category {
  margin-bottom: 24px;
}

.category-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.symptoms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.symptom-item {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.symptom-item:hover {
  border-color: #2196f3;
  color: #2196f3;
}

.symptom-item.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.dialog-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 12px;
}

.confirm-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 