
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import  path from 'path'
//element plus 使用的按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 引入 vite-plugin-cdn-import 插件
import { Plugin as importToCDN } from 'vite-plugin-cdn-import'


// https://vitejs.dev/config/
export default defineConfig({

    base: './',
    resolve:{
        alias:{
            '@': path.resolve(__dirname, 'src'),
            '@/*': path.resolve(__dirname, 'src/*'),
            'com': path.resolve(__dirname, 'src/components')  // tsconfig.json 里也必须配置路径别名
        }
    },
    build: {
        outDir:'E:\\yun\\project\\TY通用后台管理系统\\server2\\app\\web\\VueAdmin',
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    css: {
        //css预处理
        preprocessorOptions: {
            scss: {
/*                引入全局预定义变量 需要设置 lang="scss" */
                additionalData: `@import "./src/styles/variables.scss";`,
            }
        }
    },
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        // 配置 CDN  打包时会自动替换
        importToCDN({
            modules: [
/*                {     //vue 正确应该引入 3.3.8  但是网站暂时没有,这个引入会失败,所以放弃
                    name: 'vue',
                    var: 'Vue',
                    path: `https://cdn.bootcdn.net/ajax/libs/vue/3.3.4/vue.runtime.global.prod.min.js`,
                },*/
                // {
                //     name: "echarts",
                //     var: "echarts",
                //     path: "https://cdn.bootcdn.net/ajax/libs/echarts/5.4.2/echarts.min.js", //预防投毒,避免被攻击改为本地化
                // },
/*                {
                    name: "element-plus", // 依赖名称,
                    var: "ElementPlus",  // 全局变量名
                    path: "https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.1/index.full.min.js", // CDN 链接
                    css: "https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.1/index.min.css", // 依赖有css就填，没有就去掉这个
                },*/
            ],
        }),
    ],
    server: {
        hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
        // 服务配置
        port: 18080, // 类型： number 指定服务器端口;
        open: true, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
        cors: true, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
        //proxy look for https://vitejs.cn/config/#server-proxy
        proxy: {
            '/dev': {
                target: 'http://127.0.0.1:18888',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/dev/, '')
            }
        }
    }
})
