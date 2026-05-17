import {createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw,} from "vue-router";
import Nprogress from 'nprogress'
import {取url根入口路径} from "@/utils/utils";
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
                path: "代理管理/代理账号",
                name: "代理账号",
                component: () => import("@/view/代理管理/代理账号.vue"),
            },
            {
                path: "代理管理/库存管理",
                name: "库存管理",
                component: () => import("@/view/代理管理/库存管理.vue"),
            },
            {
                path: "代理管理/销售统计",
                name: "销售统计",
                component: () => import("@/view/代理管理/销售统计.vue"),
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
                path: "营销管理/活动列表",
                name: "活动列表",
                component: () => import("@/view/营销管理/活动列表.vue"),
            },
            {
                path: "营销管理/签到日志",
                name: "签到日志",
                component: () => import("@/view/营销管理/签到日志.vue"),
            },
            {
                path: "应用管理/用户类型",
                name: "用户类型",
                component: () => import("@/view/应用管理/用户类型.vue"),
            },
            {
                path: "应用管理/黑名单",
                name: "黑名单",
                component: () => import("@/view/应用管理/黑名单.vue"),
            },
            {
                path: "系统管理/系统设置",
                name: "系统设置",
                component: () => import("@/view/系统管理/系统设置3改.vue"),
            },
            {
                path: "二开扩展/用户云配置",
                name: "用户云配置",
                component: () => import("@/view/二开扩展/用户云配置.vue"),
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
                path: "二开扩展/任务池数据",
                name: "任务池数据",
                component: () => import("@/view/二开扩展/任务池数据.vue"),
            },
            {
                path: "二开扩展/定时任务",
                name: "定时任务",
                component: () => import("@/view/二开扩展/定时任务.vue"),
            },
            {
                path: "二开扩展/云存储",
                name: "云存储",
                component: () => import("@/view/二开扩展/云存储.vue"),
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
                path: "日志管理/库存日志",
                name: "库存日志",
                component: () => import("@/view/日志管理/库存日志.vue"),
            },
            {
                path: "日志管理/积分点数",
                name: "积分点数",
                component: () => import("@/view/日志管理/积分点数.vue"),
            },
            {
                path: "日志管理/制卡日志",
                name: "制卡日志",
                component: () => import("@/view/日志管理/卡号操作日志.vue"),
            },
            {
                path: "日志管理/定时任务日志",
                name: "定时任务日志",
                component: () => import("@/view/日志管理/定时任务日志.vue"),
            },
            {
                path: "日志管理/用户消息",
                name: "用户消息",
                component: () => import("@/view/日志管理/用户消息.vue"),
            },
            {
                path: "日志管理/代理操作日志",
                name: "代理操作日志",
                component: () => import("@/view/日志管理/代理操作日志.vue"),
            },
            {
                path: "日志管理/绑定日志",
                name: "绑定日志",
                component: () => import("@/view/日志管理/绑定日志.vue"),
            },
            {
                path: "财务管理/支付充值订单",
                name: "支付充值订单",
                component: () => import("@/view/财务管理/支付充值订单.vue"),
            },
            {
                path: "营销管理/cps佣金订单",
                name: "cps佣金订单",
                component: () => import("@/view/营销管理/cps佣金订单.vue"),
            },
            {
                path: "工具/apk加验证",
                name: "apk加验证",
                component: () => import("@/view/工具/apk加验证.vue"),
            },
            {
                path: "工具/exe加验证",
                name: "exe加验证",
                component: () => import("@/view/工具/exe加验证.vue"),
            },
            {
                path: "个人中心",
                name: "个人中心",
                component: () => import("@/view/个人中心/个人中心.vue"),
            },

        ]
    }
]

//修改为二级目录Admin下
const router = createRouter({
    history: createWebHistory(取url根入口路径()+'/#'),  // createWebHistory必须有＃ 分割路径和本地单页路由,否则容易404
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
    console.log(to.path)


    if (to.path.indexOf('%') !== -1) {
        //中文路由坑点, 正常跳转没问题,但是刷新后路由会是url编码后 所以会找不到路由 跳404,必须解码一次才能找到正确路由,英文就没这个问题,但是我还是喜欢中文,
        const decodedPath = decodeURI(to.path)
        //如果解码后的路径与原路径不同，进行重定向
        if (decodedPath !== to.path) {
            return { path: decodedPath, repLace: true }; //使用replace 进行重定向
        }
    }

    console.log("路由守卫:" + localStorage.getItem("AdminToken"))
    if (to.path == "/Login") {
        return true;
    }

    //console.log(to)
    if (路由守卫白名单.indexOf(to.path) > -1) {
        return true
    }

    //如果没有 token  跳转登录
    if (!localStorage.getItem("AdminToken")) {
        return {path: "/Login"};
    } else {
        if (isF) {
            return true;
        } else {
            //递归添加路由(routes);
            isF = true;
            return true;
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
