<template>
  <el-dialog
    :title="isEdit ? '编辑医嘱' : '新增医嘱'"
    :visible.sync="dialogVisible"
    width="60%"
    :before-close="handleClose"
  >
    <el-form :model="orderForm" :rules="rules" ref="orderForm" label-width="100px">
      <el-form-item label="医嘱类型" prop="type">
        <el-radio-group v-model="orderForm.type">
          <el-radio label="temp">临时医嘱</el-radio>
          <el-radio label="long">长期医嘱</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="组号" prop="group">
        <el-input v-model="orderForm.group" placeholder="请输入组号"></el-input>
      </el-form-item>
      
      <el-form-item label="医嘱内容" prop="content" required>
        <el-input
          type="textarea"
          v-model="orderForm.content"
          :rows="3"
          placeholder="请输入医嘱内容"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="单次剂量" prop="dosage">
        <el-input v-model="orderForm.dosage" placeholder="请输入单次剂量"></el-input>
      </el-form-item>
      
      <el-form-item label="用法" prop="usage" required>
        <el-input v-model="orderForm.usage" placeholder="请输入用法/频次/嘱托"></el-input>
      </el-form-item>
      
      <el-form-item label="天数" prop="days">
        <el-input-number v-model="orderForm.days" :min="1"></el-input-number>
      </el-form-item>
      
      <el-form-item label="总量" prop="total">
        <el-input v-model="orderForm.total" placeholder="请输入总量"></el-input>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'OrderDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      orderForm: {
        type: 'temp',
        group: '',
        content: '',
        dosage: '',
        usage: '',
        days: 1,
        total: ''
      },
      rules: {
        content: [
          { required: true, message: '请输入医嘱内容', trigger: 'blur' }
        ],
        usage: [
          { required: true, message: '请输入用法/频次/嘱托', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.isEdit) {
        this.orderForm = { ...this.orderData }
      }
    }
  },
  methods: {
    handleClose() {
      this.$refs.orderForm?.resetFields()
      this.orderForm = {
        type: 'temp',
        group: '',
        content: '',
        dosage: '',
        usage: '',
        days: 1,
        total: ''
      }
      this.$emit('update:visible', false)
    },
    submitForm() {
      this.$refs.orderForm.validate(valid => {
        if (valid) {
          const data = {
            ...this.orderForm,
            time: new Date().toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\//g, '-')
          }
          this.$emit('submit', data)
          this.handleClose()
        }
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 