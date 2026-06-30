import axios from 'axios' // 引入axios
import {ElMessage, ElMessageBox} from 'element-plus'
import {store} from '@/store/store.ts'
import router from '@/router/index'


const service = axios.create({

    //baseURL: axios.defaults.baseURL,
    //判断host 如果是127.0.0.1:18080 修改为后端接口,否则线上后端接口
    baseURL: window.location.protocol + "//" + (window.location.host === "localhost:18080"||window.location.host === "127.0.0.1:18081" ? window.location.hostname + ":18888" : window.location.host),
    timeout: 99999
})

// http request 拦截请求 写入token
service.interceptors.request.use(
    config => {
        config.url+="?time="+new Date().getTime().toString();
        config.headers = {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("AdminToken"),
            ...config.headers
        }
        return config
    },
    error => {
        ElMessage.error(error)
        return error
    }
)


// http response 拦截响应
service.interceptors.response.use(
    response => {
        //console.info(response)
        if (response.config?.responseType === 'blob') {
            return response
        }
        // 响应成功 返回data内容
        if (response.data.code === 10000) {
            return response.data
        } else {
            //判断失败原因

            // 101登录状态失效 清除token 本地数据 跳转登陆页
            if (response.data.code === 202 && response.data.data.KuaiYan === true) {

                console.info("快验个人中心未登录")

                router.push('/个人中心')
                if (response.data.msg!==""){
                    ElMessage.success(response.data.msg || decodeURI(response.headers.msg))
                }
            } else if (response.data.code === 202) {

                console.info("登录token被注销了")
                console.info(response)
                store.commit("setToken", "")
                localStorage.clear()
                router.replace('Login')

            } else {
                ElMessage.error(response.data.msg || decodeURI(response.headers.msg))
            }


            return response.data.msg ? response.data : response
        }
    },
    error => {
        // if (!error.config.donNotShowLoading) {
        //   closeLoading()
        // }

        if (!error.response) {
            ElMessageBox.confirm(`
        <p>检测到请求错误</p>
        <p>${error}</p>
        `, '请求报错', {
                dangerouslyUseHTMLString: true,
                distinguishCancelAndClose: true,
                confirmButtonText: '稍后重试',
                cancelButtonText: '取消'
            })
            return
        }

        switch (error.response.status) {
            case 500:
                ElMessageBox.confirm(`
        <p>检测到接口错误${error}</p>
        <p>错误码<span style="color:red"> 500 </span>：此类错误内容常见于后台panic，请先查看后台日志，如果影响您正常使用可强制登出清理缓存</p>
        `, '接口报错', {
                    dangerouslyUseHTMLString: true,
                    distinguishCancelAndClose: true,
                    confirmButtonText: '清理缓存',
                    cancelButtonText: '取消'
                })
                    .then(() => {
                        // localStorage.clear()
                        // router.push( 'Login')
                    })
                break
            case 404:
                ElMessageBox.confirm(`
          <p>检测到接口错误${error}</p>
          <p>错误码<span style="color:red"> 404 </span>：此类错误多为接口未注册（或未重启）或者请求路径（方法）与api路径（方法）不符--如果为自动化代码请检查是否存在空格</p>
          `, '接口报错', {
                    dangerouslyUseHTMLString: true,
                    distinguishCancelAndClose: true,
                    confirmButtonText: '我知道了',
                    cancelButtonText: '取消'
                })
                break
        }

        return error
    }
)
export default service
