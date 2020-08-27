import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import MenuManage from '../components/menuManage/menuManage.vue'
import Dict from '../components/dictionary/dict.vue'
import Cminfo from '../components/cminfo/cminfo.vue'
import CmSideInfo from '../components/cminfo/cmSideInfo.vue'
import MarkRecord from '../components/marketManage/markRecord.vue'
import Member from '../components/member/member.vue'
import Cinfo from '../components/marketManage/cinfo.vue'
import CmRegular from '../components/dailyWorkManagement/cmRegular.vue'
import WorkManagement from '../components/dailyWorkManagement/workManagement.vue'
import Report from '../components/report/report.vue'
import LearnGarden from '../components/learnGarden/learnGarden.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {path: '/', redirect: '/login'},
    {path: '/login', component: Login},
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {path: '/welcome', component: Welcome},
        {path: '/menuManage', component: MenuManage},
        {path: '/dict', component: Dict},
        {path: '/cminfo', component: Cminfo},
        {path: '/markRecord', component: MarkRecord},
        {path: '/member', component: Member},
        {path: '/cinfo', component: Cinfo},
        {path: '/cmRegular', component: CmRegular},
        {path: '/report', component: Report},
        {path: '/learnGarden', component: LearnGarden},
        {path: '/workManagement', component: WorkManagement},
        {path: '/cmSideInfo', component: CmSideInfo},
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转
  // 获取token
  const tokenStr = window.localStorage.getItem('token')
  if (to.path === '/login') {
    if (!tokenStr) {
      return next()
    } else {
      return next('/welcome')
    }
  } else {
    if (!tokenStr) {
      return next('/login')
    } else {
      next()
    }
  }
})

export default router
