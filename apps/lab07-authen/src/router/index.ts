import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import LoginPage from "@/views/LoginPage.vue";
import TabsPage from '../views/TabsPage.vue';
import { authService } from '@/auth/auth-service';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },

  // ✅ เพิ่ม login route
  {
    path: '/login',
    component: LoginPage,
  },

  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue'),
        meta: { requiresAuth: true } // ⭐ สำคัญ
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});


// ✅ Auth Guard (ต้องอยู่ก่อน export)
router.beforeEach(async (to) => {
  const user = await authService.getCurrentUser();

  // login แล้ว ห้ามเข้า /login
  if (to.path === "/login" && user) {
    return "/tabs/tab1";
  }

  // ยังไม่ login แต่จะเข้าหน้าที่ต้อง auth
  if (to.meta.requiresAuth && !user) {
    return "/login";
  }

  return true;
});

export default router;
