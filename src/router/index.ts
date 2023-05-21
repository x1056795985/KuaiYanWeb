import {createRouter, createWebHashHistory, RouteRecordRaw,} from "vue-router";
import path from "path";
import 权限json from "@/store/权限.json"
import Nprogress from 'nprogress'
// @ts-ignore
// @ts-ignore
// @ts-ignore
const routes: Array<RouteRecordRaw> = [
    {
        path: '/init',
        name: 'Init',
        component: () => import('@/view/init/index.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/view/login/login.vue')
    },
    {
        path: "/",
        name: "/",
        redirect: "/控制面板/仪表台",
        component: () => import("@/view/layout/layout.vue"),
        children: [
            {
                path: "控制面板/仪表台",
                name: "仪表台",
                component: () => import("@/view/控制面板/仪表台.vue"),
            }, {
                path: "控制面板/分析页",
                name: "分析页",
                component: () => import("@/view/控制面板/分析页.vue"),
            }, {
                path: "控制面板/监控页",
                name: "监控页",
                component: () => import("@/view/控制面板/监控页.vue"),
            },
            {
                path: "用户管理/在线用户",
                name: "在线用户",
                component: () => import("@/view/用户管理/在线用户.vue"),
            },
            {
                path: "用户管理/用户账号",
                name: "用户账号",
                component: () => import("@/view/用户管理/用户账号.vue"),
            },
            {
                path: "应用管理/应用列表",
                name: "应用列表",
                component: () => import("@/view/应用管理/应用列表.vue"),
            },
            {
                path: "应用管理/软件用户",
                name: "软件用户",
                component: () => import("@/view/应用管理/软件用户.vue"),
            },
            {
                path: "应用管理/卡类列表",
                name: "卡类列表",
                component: () => import("@/view/应用管理/卡类列表.vue"),
            },
            {
                path: "应用管理/卡号列表",
                name: "卡号列表",
                component: () => import("@/view/应用管理/卡号列表.vue"),
            },
            {
                path: "应用管理/用户类型",
                name: "用户类型",
                component: () => import("@/view/应用管理/用户类型.vue"),
            },
            {
                path: "系统管理/系统设置",
                name: "系统设置",
                component: () => import("@/view/系统管理/系统设置.vue"),
            },
            {
                path: "二开扩展/公共变量",
                name: "公共变量",
                component: () => import("@/view/二开扩展/公共变量.vue"),
            },
            {
                path: "二开扩展/公共函数",
                name: "公共函数",
                component: () => import("@/view/二开扩展/公共函数.vue"),
            },
            {
                path: "二开扩展/任务池",
                name: "任务池",
                component: () => import("@/view/二开扩展/任务池.vue"),
            },
            {
                path: "日志管理/登录日志",
                name: "登录日志",
                component: () => import("@/view/日志管理/登录日志.vue"),
            },
            {
                path: "日志管理/余额日志",
                name: "余额日志",
                component: () => import("@/view/日志管理/余额日志.vue"),
            },
            {
                path: "日志管理/积分点数",
                name: "积分点数",
                component: () => import("@/view/日志管理/积分点数.vue"),
            },
            {
                path: "日志管理/制卡日志",
                name: "制卡日志",
                component: () => import("@/view/日志管理/制卡日志.vue"),
            },
            {
                path: "日志管理/用户消息",
                name: "用户消息",
                component: () => import("@/view/日志管理/用户消息.vue"),
            },
            {
                path: "财务管理/余额充值订单",
                name: "余额充值订单",
                component: () => import("@/view/财务管理/余额充值订单.vue"),
            },

        ]
    }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})


var isF = false; //这个是用于判断动态路由是否已经被获取
const 递归添加路由 = (result: any) => {
    let currenRoutes = router.options.routes
    if (result) {
        result.forEach((item: any) => {
            router.addRoute("layout", {
                path: item.path,
                name: item.name,
                meta: {
                    title: item.name,
                },
                component: () => import(`/* @vite-ignore */ @/view${item.component}`),
            });

            if (item.children && item.children.length) {
                递归添加路由(item.children);
            }
        });
    }
};
const 路由守卫白名单 = ['/Login', '/Init']
//路由守卫
router.beforeEach(async (to, from) => {
    Nprogress.start()
    console.log("路由守卫:" + localStorage.getItem("Token"))
    if (to.path == "/Login") {
        return true;
    }

    //console.log(to)
    if (路由守卫白名单.indexOf(to.path) > -1) {
        return true
    }
    //如果没有 token  跳转登录
    if (!localStorage.getItem("Token")) {

        return {path: "/Login"};
    } else {
        if (isF) {
            return true;
        } else {
            //let add = Store.getters.menuList || "";
            //routerData(add);
            isF = true;
            return {...to, replace: true};
        }
    }
});


//递归添加路由(权限json)

//最后添加404路由
router.addRoute({
    path: "/:catchAll(.*)",
    component: () => import("@/view/layout/layout.vue"),
    children: [{
        path: "/:catchAll(.*)",
        component: () => import("@/view/error/index.vue")
    }]
})

// router.beforeEach((to, from, next) => {
//     next();
// })
// router.afterEach((to, from) => {
//     console.log(from)
// })
router.afterEach(() => {
    // 路由加载完成后关闭进度条
    Nprogress.done()
})

router.onError(() => {
    // 路由发生错误后销毁进度条
    Nprogress.remove()
})

export default router
