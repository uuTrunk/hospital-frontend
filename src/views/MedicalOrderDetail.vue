// 修改说明：添加表单提交接口对接
import axios from 'axios';

export default {
  // ...原有代码...
  methods: {
    async submitOrders() {
      try {
        await axios.post('/api/medical-order/create', {
          patientId: this.patientId,
          doctorId: this.$store.state.userId,
          orderType: this.orderType,
          orders: this.orderList.map(order => ({
            content: order.content,
            dosage: order.dosage,
            usage: order.usage,
            frequency: order.frequency
          }))
        });
        this.$message.success('医嘱已发送');
        this.$router.back();
      } catch (e) {
        this.$message.error('提交失败');
      }
    },
    async printCurrentOrderList() {
      try {
        await axios.get('/api/medical-order/print', {
          params: {
            orderIds: this.selectedOrders.map(o => o.orderId).join(',')
          }
        });
        this.$message.success('打印任务已生成');
      } catch (e) {
        this.$message.error('打印失败');
      }
    }
  }
}
