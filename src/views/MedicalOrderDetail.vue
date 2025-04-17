<template>
  <div class="medical-order-detail-container">
    <el-card class="order-form-card">
      
      <el-form ref="orderForm" :model="formData" label-width="120px">
<!--        <el-form-item label="患者信息">-->
<!--          <div class="patient-info">-->
<!--            <span>{{ patientId }}</span>-->
<!--          </div>-->
<!--        </el-form-item>-->

        <div v-for="(order, index) in formData.orders" :key="index" class="order-item">
          <el-row :gutter="20">
            <el-col :span="22">
              <el-input
                v-model="order.content"
                placeholder="请输入医嘱内容"
                class="content-input"
                :class="{ 'required-input': !order.content }"
              />
            </el-col>
            <el-col :span="2">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeOrder(index)"
                :disabled="formData.orders.length === 1"
              />
            </el-col>
          </el-row>

          <el-row :gutter="20" class="sub-params">
            <el-col :span="6">
              <el-input v-model.number="order.patientId" placeholder="患者Id" />
            </el-col>
            <el-col :span="6">
              <el-input v-model.number="order.doctorId" placeholder="医生Id" />
            </el-col>
            <el-col :span="6">
              <el-select v-model="order.orderType" placeholder="医嘱类型">
                <el-option
                  v-for="option in orderTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input v-model="order.dosage" placeholder="单次剂量（如：0.5g）" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="order.medicalUsage" placeholder="用法（如：口服）" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="order.frequency" placeholder="频次（如：每天3次）" />
            </el-col>
            <el-col :span="6">
              <el-date-picker
                  v-model="order.stoppingTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-col>
            <el-col :span="6" v-if="orderType === '临时'">
              <el-input v-model="order.validityPeriod" placeholder="有效期（如：24小时内）" />
            </el-col>
            <el-col :span="6" v-else>
              <el-date-picker
                v-model="order.stopTime"
                type="datetime"
                placeholder="选择停止时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-col>
          </el-row>
        </div>

        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addNewOrder"
          class="add-order-btn"
        >新增医嘱项</el-button>

        <el-row type="flex" justify="end" class="mt-20">
          <el-button @click="$router.back()">取消</el-button>
          <el-button type="primary" @click="submitOrders">提交医嘱</el-button>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      formData: {
        orders: [{ patientId: 0, doctorId: 0, orderType:'', content: '', dosage: '', medicalUsage: '', frequency: '', startingTime:'', validityPeriod:'', stoppingTime:'' }]
      },
      orderTypeOptions: [
        { value: '长期', label: '长期' },
        { value: '临时', label: '临时' }
      ]
    };
  },
  computed: {
    orderTypeLabel() {
      return this.orderType === '临时' ? '临时' : '长期';
    }
  },
  methods: {
    addNewOrder() {
      this.formData.orders.push({
        content: '',
        dosage: '',
        usage: '',
        frequency: ''
      });
    },
    removeOrder(index) {
      this.formData.orders.splice(index, 1);
    },
    async submitOrders() {
      try {
        // 遍历每个订单并发送请求
        for (const order of this.formData.orders) {
          // 可选：映射字段名（根据后端需求）
          const backendOrder = {
            patientId: order.patientId,
            doctorId: order.doctorId,
            orderType: order.orderType,
            content: order.content,
            dosage: order.dosage,
            usage: order.usage,
            medicalUsage: order.medicalUsage,
            frequency: order.frequency,
            validityPeriod: order.validityPeriod,
            startingTime: order.startingTime,
            stoppingTime: order.stoppingTime
          };

          // 发送请求并设置 Content-Type
          await axios.post(
              '/api/medical-order/create',
              backendOrder,
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
          );
        }
        this.$message.success('医嘱创建成功');
        this.$router.back();
      } catch (error) {
        const errorMessage = error.response?.data?.message || '提交失败';
        this.$message.error(errorMessage);
        console.error('错误详情:', error);
      }
    }
  },
  mounted() {
    // 初始化时获取患者信息（需根据实际API调整）
    // this.fetchPatientInfo(this.patientId);
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
.medical-order-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.order-form-card {
  border-radius: 4px;
  margin-bottom: 20px;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.order-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.content-input {
  width: 100%;
}

.required-input {
  border-color: #f56c6c;
}

.sub-params {
  margin-top: 15px;
}

.sub-params .el-input {
  margin-bottom: 10px;
}

.add-order-btn {
  margin-top: 20px;
  width: 100%;
}

.mt-20 {
  margin-top: 20px;
}

.el-form-item__label {
  font-weight: bold;
}

.el-date-editor.el-input {
  width: 100%;
}
</style>