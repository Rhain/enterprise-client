import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/users',
    component: Layout,
    redirect: '/users/list',
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/users/index'),
        meta: { title: '用户', icon: 'user', roles: ['ROLE_ADMIN'] }
      }
    ]
  },

  {
    path: '/products',
    component: Layout,
    meta: { title: '产品', icon: 'products' },
    children: [
      {
        path: 'category',
        name: 'Categories',
        component: () => import('@/views/category/index'),
        meta: { title: '类别', icon: 'category' }
      },
      {
        path: 'carousel',
        name: 'Carousel',
        component: () => import('@/views/carousels/index'),
        meta: { title: '轮播图', icon: 'list' }
      },
      {
        path: 'index',
        name: 'Products',
        component: () => import('@/views/products/index'),
        meta: { title: '产品列表', icon: 'list' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]