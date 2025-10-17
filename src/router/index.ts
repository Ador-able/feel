import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LengthTraining from '../views/LengthTraining.vue'
import AngleTraining from '../views/AngleTraining.vue'
import ProportionTraining from '../views/ProportionTraining.vue'
import ProgressView from '../views/ProgressView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/length-training',
      name: 'length-training',
      component: LengthTraining,
    },
    {
      path: '/angle-training',
      name: 'angle-training',
      component: AngleTraining,
    },
    {
      path: '/proportion-training',
      name: 'proportion-training',
      component: ProportionTraining,
    },
    {
      path: '/progress',
      name: 'progress',
      component: ProgressView,
    },
  ],
})

export default router
