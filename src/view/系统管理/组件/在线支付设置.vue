<template>
  <div class="最底层div">
    <el-form v-loading="is加载中" :inline="false" style="min-width: 80px" label-width="130px" :model="Data"
             :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
      <div class="内容div">
        <el-divider content-position="left">余额支付</el-divider>
        <el-form-item label="开关" prop="余额支付开关">
          <el-radio-group v-model="Data.余额支付开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.余额支付开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.余额支付显示名称"/>
          </el-form-item>
        </div>
      </div>
      <div class="内容div">
        <el-divider content-position="left">支付宝PC ->
          <el-link href="https://b.alipay.com/signing/productDetailV2.htm?productId=I1011000290000001000"
                   target="_blank">电脑网页支付
          </el-link>
          <el-text  >-------</el-text>
          <el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/%E5%9C%A8%E7%BA%BF%E6%94%AF%E4%BB%98%E5%AF%B9%E6%8E%A5%E6%95%99%E7%A8%8B.html"
                   target="_blank">对接教程
          </el-link>
        </el-divider>
        <el-form-item label="开关" prop="支付宝开关">
          <el-radio-group v-model="Data.支付宝开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.支付宝开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.支付宝显示名称"/>
          </el-form-item>
          <el-form-item label="商户ID" disabled="disabled">
            <el-input v-model.trim="Data.支付宝商户ID"/>
          </el-form-item>
          <el-form-item label="商户应用私钥" disabled="disabled">
            <el-input v-model.trim="Data.支付宝商户私钥"/>
          </el-form-item>
          <!--        <el-form-item label="商户公钥" disabled="disabled">
                    <el-input v-model.trim="Data.支付宝商户公钥"/>
                  </el-form-item>-->
          <el-form-item label="支付宝公钥" disabled="disabled">
            <el-input v-model.trim="Data.支付宝公钥"/>
          </el-form-item>
          <el-form-item label="同步回调url" disabled="disabled">
            <el-row style="width: 100%">
              <el-col :span="18">
                <el-input v-model.trim="Data.支付宝同步回调url" placeholder="同步回调地址支持变量`{OrderId}`订单id,`{OrderId2}`第三方订单id,`{User}`用户名,`{Type}`支付方式"/>
              </el-col>
              <el-col :span="2">
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="配置为自己服务器地址教程"
                    placement="top"
                >
                  <el-link
                      href="http://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.html#添加自己的在线支付同步回调页"
                      target="_blank">
                    <el-icon size="24">
                      <Link/>
                    </el-icon>
                  </el-link>
                </el-tooltip>
              </el-col>
            </el-row>

          </el-form-item>
          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.支付宝单次最大金额"/>
          </el-form-item>
        </div>

      </div>
      <div class="内容div">
        <el-divider content-position="left">支付宝H5 ->
          <el-link href="https://b.alipay.com/page/product-mall/product-detail/I1080300001000041949"
                   target="_blank">手机网站支付
          </el-link>
        </el-divider>
        <el-form-item label="开关" prop="支付宝H5开关">
          <el-radio-group v-model="Data.支付宝H5开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.支付宝H5开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.支付宝H5显示名称"/>
          </el-form-item>
          <el-form-item label="商户ID" disabled="disabled">
            <el-input v-model.trim="Data.支付宝H5商户ID"/>
          </el-form-item>
          <el-form-item label="商户应用私钥" disabled="disabled">
            <el-input v-model.trim="Data.支付宝H5商户私钥"/>
          </el-form-item>

          <el-form-item label="支付宝H5公钥" disabled="disabled">
            <el-input v-model.trim="Data.支付宝H5公钥"/>
          </el-form-item>
          <el-form-item label="同步回调url" disabled="disabled">
            <el-input v-model.trim="Data.支付宝H5同步回调url" placeholder="同步回调地址支持变量`{OrderId}`订单id,`{OrderId2}`第三方订单id,`{User}`用户名,`{Type}`支付方式"/>
          </el-form-item>
          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.支付宝H5单次最大金额"/>
          </el-form-item>
        </div>

      </div>
      <div class="内容div">
        <el-divider content-position="left">支付宝当面付 ->
          <el-link href="https://b.alipay.com/signing/productDetailV2.htm?productId=I1011000290000001003"
                   target="_blank">当面付
          </el-link>

        </el-divider>
        <el-form-item label="开关" prop="支付宝当面付开关">
          <el-radio-group v-model="Data.支付宝当面付开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.支付宝当面付开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.支付宝当面付显示名称"/>
          </el-form-item>
          <el-form-item label="商户ID" disabled="disabled">
            <el-input v-model.trim="Data.支付宝当面付商户ID"/>
          </el-form-item>
          <el-form-item label="商户应用私钥" disabled="disabled">
            <el-input v-model.trim="Data.支付宝当面付商户私钥"/>
          </el-form-item>
          <el-form-item label="支付宝当面付公钥" disabled="disabled">
            <el-input v-model.trim="Data.支付宝当面付公钥"/>
          </el-form-item>
          <el-form-item label="同步回调url" disabled="disabled">
            <el-input v-model.trim="Data.支付宝当面付同步回调url" placeholder="同步回调地址支持变量`{OrderId}`订单id,`{OrderId2}`第三方订单id,`{User}`用户名,`{Type}`支付方式"/>
          </el-form-item>
          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.支付宝当面付单次最大金额"/>
          </el-form-item>
        </div>

      </div>

      <div class="内容div">
        <el-divider content-position="left">微信支付</el-divider>
        <el-link href="https://pay.weixin.qq.com/"
                 target="_blank">Native支付
        </el-link>
        <el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/%E5%9C%A8%E7%BA%BF%E6%94%AF%E4%BB%98%E5%AF%B9%E6%8E%A5%E6%95%99%E7%A8%8B.html#%E5%BE%AE%E4%BF%A1%E6%94%AF%E4%BB%98%E5%AF%B9%E6%8E%A5%E6%95%99%E7%A8%8B"
                 target="_blank">对接教程
        </el-link>
        <el-form-item label="开关" prop="微信支付开关">
          <el-radio-group v-model="Data.微信支付开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.微信支付开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.微信支付显示名称"/>
          </el-form-item>
          <el-form-item label="商户ID" disabled="disabled">
            <el-input v-model.trim="Data.微信支付商户ID"/>
          </el-form-item>
          <el-form-item label="商户AppId" disabled="disabled">
            <el-input v-model.trim="Data.微信支付AppId"/>
          </el-form-item>
          <el-form-item label="商户V3密钥" disabled="disabled">
            <el-input v-model.trim="Data.微信支付商户v3密钥"/>
          </el-form-item>
          <el-form-item label="商户证书序列号" disabled="disabled">
            <el-tooltip
                :trigger-keys="[]"
                class="box-item"
                effect="dark"
                content="微信支付下载的证书压缩包中apiclient_cert.pem文件全部文本,开头为-----BEGIN CERTIFICATE-----去https://myssl.com/cert_decode.html 解析证书信息->序列号"
                placement="top"
            >
              <el-input v-model="Data.微信支付商户证书序列号"/>
            </el-tooltip>

          </el-form-item>
          <el-form-item label="商户证书串" disabled="disabled">
            <el-tooltip
                :trigger-keys="[]"
                class="box-item"
                effect="dark"
                content="微信支付下载的证书压缩包中apiclient_key.pem文件全部文本,开头为-----BEGIN PRIVATE KEY-----"
                placement="top"
            >
              <el-input type="textarea" v-model="Data.微信支付商户证书串"/>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="微信支付公钥ID" disabled="disabled">
            <el-tooltip
                :trigger-keys="[]"
                class="box-item"
                effect="dark"
                content="在微信支付商户平台「API安全」->「微信支付公钥」中获取公钥ID，用于验证微信支付身份"
                placement="top"
            >
              <el-input v-model="Data.微信支付公钥ID"/>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="微信支付公钥" disabled="disabled">
            <el-tooltip
                :trigger-keys="[]"
                class="box-item"
                effect="dark"
                content="在微信支付商户平台「API安全」->「微信支付公钥」中下载的pub格式公钥文件全部文本"
                placement="top"
            >
              <el-input type="textarea" v-model="Data.微信支付公钥"/>
            </el-tooltip>
          </el-form-item>

          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.微信支付单次最大金额"/>
          </el-form-item>
        </div>
      </div>
      <div class="内容div">
        <el-divider content-position="left">小叮当
          <el-link href="https://www.xddpay.com/" target="_blank">www.xddpay.com</el-link>
        </el-divider>

        <el-form-item label="开关" prop="小叮当支付开关">
          <el-radio-group v-model="Data.小叮当支付开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.小叮当支付开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.小叮当支付显示名称"/>
          </el-form-item>
          <el-form-item label="App_id" disabled="disabled">
            <el-input v-model.trim="Data.小叮当app_id"/>
          </el-form-item>
          <el-form-item label="接口密钥" disabled="disabled">
            <el-input v-model.trim="Data.小叮当接口密钥"/>
          </el-form-item>
          <el-form-item label="支付类型" disabled="disabled">
            <el-input-number v-model.trim="Data.小叮当支付类型"/>
            <el-link href="https://www.xddpay.com/doc/pay.htm" target="_blank">43支付宝,44微信,其他看官网支付类型参数</el-link>
          </el-form-item>
          <el-form-item label="异步通知网址" disabled="disabled" class="只读编辑框">
            <el-input v-model="小叮当异步地址"/>
          </el-form-item>
          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.小叮当单次最大金额"/>
          </el-form-item>
        </div>
      </div>
      <div class="内容div">
        <el-divider content-position="left">虎皮椒
          <el-link href="https://www.xunhupay.com" target="_blank">www.xunhupay.com</el-link>
        </el-divider>
        <el-form-item label="开关" prop="虎皮椒支付开关">
          <el-radio-group v-model="Data.虎皮椒支付开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.虎皮椒支付开关">
          <el-form-item label="显示名称" >
            <el-input v-model.trim="Data.虎皮椒支付显示名称"/>
          </el-form-item>
          <el-form-item label="appId" >
            <el-input v-model.trim="Data.虎皮椒appId"/>
          </el-form-item>
          <el-form-item label="appSecret" >
            <el-input v-model.trim="Data.虎皮椒appSecret"/>
          </el-form-item>
          <el-form-item label="虎皮椒支付网关" >
            <el-input v-model.trim="Data.虎皮椒支付网关" placeholder="(可空)"/>
          </el-form-item>
          <el-form-item label="同步回调url" d>
            <el-input v-model.trim="Data.虎皮椒同步回调url" placeholder="(可空)同步回调地址支持变量`{OrderId}`订单id,`{OrderId2}`第三方订单id,`{User}`用户名,`{Type}`支付方式"/>
          </el-form-item>
          <el-form-item label="单次最大金额" >
            <el-input-number v-model="Data.虎皮椒单次最大金额"/>
          </el-form-item>
        </div>
      </div>

      <div class="内容div">
        <el-divider content-position="left">易支付
<!--          <el-link href="https://www.xddpay.com/" target="_blank">www.xddpay.com</el-link>-->
          <el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/%E5%9C%A8%E7%BA%BF%E6%94%AF%E4%BB%98%E5%AF%B9%E6%8E%A5%E6%95%99%E7%A8%8B.html#%E8%8E%B7%E5%8F%96-%E5%95%86%E6%88%B7%E8%AF%81%E4%B9%A6%E5%BA%8F%E5%88%97%E5%8F%B7"
                   target="_blank">对接教程
          </el-link>
        </el-divider>
        <el-form-item label="开关" prop="易支付开关">
          <el-radio-group v-model="Data.易支付开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.易支付开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.易支付显示名称"/>
          </el-form-item>
          <el-form-item label="网关" disabled="disabled" placeholder="https://www.baidu.com">
            <el-input v-model.trim="Data.易支付网关"/>
          </el-form-item>
          <el-form-item label="易支付商户ID" disabled="disabled">
            <el-input v-model.trim="Data.易支付商户ID"/>
          </el-form-item>
          <el-form-item label="接口密钥" disabled="disabled">
            <el-input v-model.trim="Data.易支付商户密钥KEY"/>
          </el-form-item>
          <el-form-item label="支付方式" disabled="disabled">
            <el-input v-model.trim="Data.易支付支付方式"/>
          </el-form-item>
          <el-form-item label="设备类型" disabled="disabled">
            <el-input v-model.trim="Data.易支付设备类型" placeholder="(可空)自动根据请求ua识别"/>
          </el-form-item>
          <el-form-item label="同步回调url" d>
            <el-input v-model.trim="Data.易支付同步回调url" placeholder="(可空)同步回调地址支持变量`{OrderId}`订单id,`{OrderId2}`第三方订单id,`{User}`用户名,`{Type}`支付方式"/>
          </el-form-item>
          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.易支付最大金额"/>
          </el-form-item>
        </div>
      </div>

      <div class="内容div">
        <el-divider content-position="left">易支付2
          <!--          <el-link href="https://www.xddpay.com/" target="_blank">www.xddpay.com</el-link>-->
        </el-divider>
        <el-form-item label="开关" prop="易支付2开关">
          <el-radio-group v-model="Data.易支付2开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="Data.易支付2开关">
          <el-form-item label="显示名称" disabled="disabled">
            <el-input v-model.trim="Data.易支付2显示名称"/>
          </el-form-item>
          <el-form-item label="网关" disabled="disabled" placeholder="https://www.baidu.com">
            <el-input v-model.trim="Data.易支付2网关"/>
          </el-form-item>
          <el-form-item label="易支付2商户ID" disabled="disabled">
            <el-input v-model.trim="Data.易支付2商户ID"/>
          </el-form-item>
          <el-form-item label="接口密钥" disabled="disabled">
            <el-input v-model.trim="Data.易支付2商户密钥KEY"/>
          </el-form-item>
          <el-form-item label="支付方式" disabled="disabled">
            <el-input v-model.trim="Data.易支付2支付方式"/>
          </el-form-item>
          <el-form-item label="设备类型" disabled="disabled">
            <el-input v-model.trim="Data.易支付2设备类型" placeholder="(可空)自动根据请求ua识别"/>
          </el-form-item>
          <el-form-item label="同步回调url" >
            <el-input v-model.trim="Data.易支付2同步回调url" placeholder="(可空)同步回调地址支持变量`{OrderId}`订单id,`{OrderId2}`第三方订单id,`{User}`用户名,`{Type}`支付方式"/>
          </el-form-item>
          <el-form-item label="单次最大金额" disabled="disabled">
            <el-input-number v-model="Data.易支付2最大金额"/>
          </el-form-item>
        </div>
      </div>


      <div class="内容div">
        <div style="text-align:center">
          <el-button style="width: 15vh; " type="primary" @click="on确定按钮被点击(ruleFormRef)">保存</el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetInfoPay, SaveInfoPay} from "@/api/系统设置api.js";
import {ElMessage, FormInstance} from 'element-plus'
import {is移动端} from "@/utils/utils";

const 小叮当异步地址 = ref("http://域名/WebApi/PayXiaoDingDangNotify")
const Data = ref({
  "支付宝开关": false,
  "支付宝商户ID": "20210088888818",
  "支付宝显示名称": "",
  "支付宝商户私钥": "xxxxxxx",
  "支付宝商户公钥": "666666666666",
  "支付宝公钥": "666666666666",
  "支付宝同步回调url": "https://www.baidu.com/s?wd=%E5%85%85%E5%80%BC%E6%88%90%E5%8A%9F%E6%9B%B4%E6%96%B0%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%9F%A5%E7%9C%8B",
  "支付宝单次最大金额": 2000,

  "支付宝当面付开关": false,
  "支付宝当面付显示名称": "",
  "支付宝当面付商户ID": "20210088888818",
  "支付宝当面付商户私钥": "xxxxxxx",
  "支付宝当面付商户公钥": "666666666666",
  "支付宝当面付公钥": "666666666666",
  "支付宝当面付同步回调url": "https://www.baidu.com/s?wd=%E5%85%85%E5%80%BC%E6%88%90%E5%8A%9F%E6%9B%B4%E6%96%B0%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%9F%A5%E7%9C%8B",
  "支付宝当面付单次最大金额": 2000,

  "支付宝H5开关": false,
  "支付宝H5显示名称": "",
  "支付宝H5商户ID": "20210088888818",
  "支付宝H5商户私钥": "xxxxxxx",
  "支付宝H5商户公钥": "666666666666",
  "支付宝H5公钥": "666666666666",
  "支付宝H5同步回调url": "https://www.baidu.com/s?wd=%E5%85%85%E5%80%BC%E6%88%90%E5%8A%9F%E6%9B%B4%E6%96%B0%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%9F%A5%E7%9C%8B",
  "支付宝H5单次最大金额": 2000,

  "微信支付开关": false,
  "微信支付显示名称": "",
  "微信支付商户ID": "1234567",
  "微信支付AppId": "1234567",
  "微信支付商户v3密钥": "66666666666",
  "微信支付商户证书串": "66666666666",
  "微信支付商户证书序列号": "66666666666",
  "微信支付异步回调Url": "6666666666666",
  "微信支付公钥ID": "",
  "微信支付公钥": "",
  "微信支付单次最大金额": 500,

  "虎皮椒支付开关": false,
  "虎皮椒支付显示名称": "",
  "虎皮椒appId": "",
  "虎皮椒appSecret": "",
  "虎皮椒支付类型": "",
  "虎皮椒单次最大金额": 500,
  "虎皮椒支付网关": "",
  "虎皮椒同步回调url": "",

  "易支付开关": false,
  "易支付显示名称": "",
  "易支付网关": "",
  "易支付最大金额": 500,
  "易支付商户ID": "",
  "易支付支付方式": "alipay",
  "易支付同步回调url": "",
  "易支付商户密钥KEY": "",
  "易支付设备类型": "",

  "易支付2开关": false,
  "易支付2显示名称": "",
  "易支付2网关": "",
  "易支付2最大金额": 500,
  "易支付2商户ID": "",
  "易支付2支付方式": "alipay",
  "易支付2同步回调url": "",
  "易支付2商户密钥KEY": "",
  "易支付2设备类型": "",
  "余额支付开关": false,
  "余额支付显示名称": "",
})

const ruleFormRef = ref<FormInstance>()
const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  const res = await GetInfoPay({})
  Data.value = res.data
  is加载中.value = false
}

onMounted(async () => {
  await onGetList()
})
const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {


  if (!formEl) return
  let 表单验证结果 = await formEl.validate((valid, fields) => {
    if (!valid) {
      console.log('参数验证失败', fields)
    } else {
      console.log('参数验证通过')
    }
  })
  console.info("表单验证结果")
  console.info(表单验证结果)
  if (!表单验证结果) return   //如果是假直接返回
  let 返回;
  is加载中.value = true
  返回 = await SaveInfoPay(Data.value);
  is加载中.value = false
  console.log(返回)
  if (返回.code == 10000) {
ElMessage.success(返回.msg)
  }
}
</script>

<style scoped lang="scss">
.el-table .cell {
  white-space: pre-wrap; /*这是重点。文本换行*/

}

/*.gva-search-box {*/
/*  padding: 24px;*/
/*  padding-bottom: 2px;*/
/*  background-color: #fff;*/
/*  border-radius: 2px;*/
/*  margin-bottom: 12px;*/
/*}*/
.最底层div {

  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #f0f2f5;
}

.内容div {
  min-height: 20%;
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #ffffff;
}

.搜索框 {
  top: -5px;
  padding: 0 0;
  margin: 0 0 10px;
  align-items: center;
}

.demo-pagination-block {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.el-statistic__number {
  font-size: 18px;
  color: #eebe77;
}

.gva-btn-list {
  border: 1px solid rgb(235, 238, 245);
}

.工具栏 {
  margin: 7px 8px 8px;
  background: #fafafa;
  color: #606266;
  float: right;
  padding-right: 1px;

  .el-icon {
    /*设置边框阴影*/

    font-size: 16px;
    margin-left: 10px;
    padding: 5px;
    ///*边框 1px  颜色 */
    border: 1px solid rgb(235, 238, 245);
    color: #0c0d0e;
    //box-shadow: 2px 2px 3px 0 rgba(45, 75, 74, 0.6);
    speak: none;
    font-style: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    cursor: pointer; //改变鼠标样式为手型
  }
}


.工具_更多 {
  background-color: #ffffff;
  width: 150px;
  margin: 0;
  /*边框 1px  颜色 */
  border: 1px solid #ccc;
  /*图层高度  3000  值大一点 会在顶层*/
  z-index: 3000;
  /*定位方式 绝对定位*/
  position: absolute;
  list-style-type: none;
  border-radius: 4px; //设置圆角
  /*设置边框阴影*/
  box-shadow: 2px 2px 3px 0 rgba(45, 75, 74, 0.6);
  padding: 5px 0;
  font-size: 12px;

  li {
    margin: 0;
    padding: 7px 16px;
    //设置 鼠标悬停时样式
    &:hover {
      background: #889aa4; //改变背景颜色
      cursor: pointer; //改变鼠标样式为手型
    }
  }

}

.工具_更多_li {
  list-style-type: none;
  font-size: 12px;
  margin: 0;
  padding: 7px 16px;
  //设置 鼠标悬停时样式
  &:hover {
    background: #889aa4; //改变背景颜色
    cursor: pointer; //改变鼠标样式为手型
  }
}

.el-form-item {
  padding: 0;
  margin: 0 15px 8px 0;
}

.el-table .cell {
  white-space: pre-line;
}

.编辑框 {
  width: 200px;
}

单条信息分组框 {
  padding: 20px 10px 10px 10px;

}
</style>
