
import axios from 'axios'
import { ref } from 'vue'

const weatherInfo = ref('今日晴，0℃ - 10℃，天气寒冷，注意添加衣物。')
const amapKey = '73039201104d5e8a200b9b689d5b7be7'

export const useWeatherInfo = () => {
    ip()
    return weatherInfo
}

export const ip = async() => {
    // key换成你自己的 https://console.amap.com/dev/index
    if (amapKey === '') {
        return false
    }
    const res = await axios.get('https://restapi.amap.com/v3/ip?key=' + amapKey)
    console.log('ip查地址')
    console.log(res)
    if (res.data.adcode) {
        await getWeather(res.data.adcode)
    }
}

const getWeather = async(code) => {
    const response = await axios.get('https://restapi.amap.com/v3/weather/weatherInfo?key=' + amapKey + '&extensions=base&city=' + code)
    //https://restapi.amap.com/v3/weather/weatherInfo?key=73039201104d5e8a200b9b689d5b7be7&extensions=base&city=210200
    console.log('地址查天气')
    console.log(response)
    if (response.data.status === '1') {
        const s = response.data.lives[0]
        weatherInfo.value = s.city + ' 天气：' + s.weather + ' 温度：' + s.temperature + '摄氏度 风向：' + s.winddirection + ' 风力：' + s.windpower + '级 空气湿度：' + s.humidity
    }
}

