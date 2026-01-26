import { createRouter, createWebHashHistory } from 'vue-router'
import ReportGenerator from '../views/report/ReportGenerator.vue'
import TodoList from '../views/todo/TodoList.vue'
import Calculator from '../views/tools/Calculator.vue'

const routes = [
  {
    path: '/',
    name: 'ReportGenerator',
    component: ReportGenerator
  },
  {
    path: '/todo',
    name: 'TodoList',
    component: TodoList
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: Calculator
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
