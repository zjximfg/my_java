import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/opc/connection',
      name: 'connection',
      component: ()=> import('./views/opc/Connection.vue')
    },
    {
      path: '/opc/group/:id',
      name: 'group',
      component: ()=> import('./views/opc/Group.vue')
    },
    {
      path: '/',
      redirect: '/opc/connection'
    }
  ]
})
