import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PatientAssessment from '../views/PatientAssessment.vue'
import HealthAssessment from '../views/HealthAssessment.vue'
import Discharge from '../views/Discharge.vue'
import HealthRecord from '../views/HealthRecord.vue'
import MedicalManagement from '../views/MedicalManagement.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/admission-assessment'
  },
  {
    path: '/',
    component: HomeView,
    children: [
      {
        path: '/admission-assessment',
        name: 'PatientAssessment',
        component: PatientAssessment,
        meta: { title: '入院评估' }
      },
      {
        path: '/health-assessment',
        name: 'HealthAssessment',
        component: HealthAssessment,
        meta: { title: '健康评估' }
      },
      {
        path: '/discharge',
        name: 'Discharge',
        component: Discharge,
        meta: { title: '离院办理' }
      },
      {
        path: '/health-record',
        name: 'HealthRecord',
        component: HealthRecord,
        meta: { title: '健康档案' }
      },
      {
        path: '/medical-management',
        name: 'MedicalManagement',
        component: MedicalManagement,
        meta: { title: '医嘱管理' }
      },
    ]
  },
  {
    path: '/prescription-detail/:id',
    name: 'PrescriptionDetail',
    component: () => import('@/views/PrescriptionDetail.vue'),
    meta: { title: '处方详情' }
  }
]

const router = new VueRouter({
  routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 护理管理系统` : '护理管理系统'
  next()
})

export default router