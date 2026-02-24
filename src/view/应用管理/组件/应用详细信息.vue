<template>
  <div style="height: 95%">
    <el-dialog v-model="is对话框可见2" :title="'编辑应用配置AppID:'+Props.id"
               :width="is移动端()?'90%':'60%'"
               @close="on对话框被关闭"
               top="5vh"
               draggable
    >

      <div style="height:72vh;overflow:auto;padding:0 12px;" v-loading="is加载中">
        <el-form :inline="false" style="min-width: 80px;min-height: 100%" label-width="160px" :rules="on表单校验"
                 :model="data"
                 :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
          <el-tabs class="应用详细信息顶部标签" v-model="应用详细信息顶部标签现行选项">
            <el-tab-pane label="应用设置" name="应用设置">

              <el-form-item label="应用名称" prop="AppName">
                <el-input v-model.trim="data.AppName" placeholder="请输入应用名称"/>
              </el-form-item>

              <el-form-item label="应用主页" prop="UrlHome">
                <el-input v-model.trim="data.UrlHome"/>
              </el-form-item>
              <el-form-item label="公告" prop="AppGongGao">
                <el-input type="textarea" autosize v-model="data.AppGongGao"/>
              </el-form-item>
              <el-popconfirm
                  :trigger-keys="[]"
                  confirm-button-text="查看详细描述"
                  placement="top"
                  cancel-button-text=" "
                  width="30%"
                  icon-color="#626AEF"
                  title="一行一个,格式使用[1.2.5],大版本号.小版本号.编译版本号,第一行为最新版本,后面为可用版本,各版本号末尾支持通配符[*]通配0-9,推荐自动更新只判断提示大小版本号,主动更新才判断检测编译版本号,非可用版本,强制更新"
                  @confirm="on打开版本信息详细描述"
              >
                <template #reference>
                  <el-form-item label="可用版本" prop="AppVer">
                    <el-input type="textarea" autosize v-model="data.AppVer" style="width: 200px"/>
                    <div>
                      <div style="display: flex;flex-wrap: wrap;flex-direction: row">
                        <el-button @click="on增加版本号(1,1)"
                                   style="display: flex;width: 90px;padding: 0;margin-left :5px">大版本号+1
                        </el-button>
                        <el-button @click="on增加版本号(1,-1)"
                                   style="display: flex;width: 20px;padding: 0;margin-left :5px">-1
                        </el-button>
                      </div>
                      <div style="display: flex;flex-wrap: wrap;flex-direction: row">
                        <el-button @click="on增加版本号(2,1)"
                                   style="display: flex;width: 90px;padding: 0;margin-left :5px">小版本号+1
                        </el-button>
                        <el-button @click="on增加版本号(2,-1)"
                                   style="display: flex;width: 20px;padding: 0;margin-left :5px">-1
                        </el-button>
                      </div>
                      <div style="display: flex;flex-wrap: wrap;flex-direction: row">
                        <el-button @click="on增加版本号(3,1)"
                                   style="display: flex;width: 90px;padding: 0;margin-left :5px">编译版本号+1
                        </el-button>
                        <el-button @click="on增加版本号(3,-1)"
                                   style="display: flex;width: 20px;padding: 0;margin-left :5px">-1
                        </el-button>
                      </div>
                    </div>

                  </el-form-item>
                </template>
              </el-popconfirm>
              <el-form-item icon="icon" label="更新下载地址json" prop="UrlDownload">
                <el-tooltip
                    :trigger-keys="[]"
                    class="box-item"
                    effect="light"
                    content="支持使用变量 最新版本号: {{AppVer}}  {{云存储_取外链('10001/app2.apk',0)}} "
                    placement="top-end"
                >
                  <el-input class="no-inherit" type="textarea" autosize v-model="data.UrlDownload"/>
                </el-tooltip>
                <div class="toolbar">
                  <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="上传文件"
                      placement="top-start"
                  >
                    <el-icon @click="is显示上传界面=true" size="24" color="#409EFC" class="复制按钮 no-inherit">
                      <UploadFilled/>
                    </el-icon>
                  </el-tooltip>
                </div>
              </el-form-item>

              <el-popover
                  :trigger-keys="[]"
                  placement="top-end"
                  :width="200"
                  trigger="hover"
                  :content="isVipType?'只有会员时间未到期才可以读取,需要更多请使用专属云变量,效果相同':'只有剩余点数>0才可以读取,需要更多请使用专属云变量,效果相同'"
              >
                <template #reference>
                  <el-form-item label="Vip数据" prop="VipData">
                    <el-input type="textarea" autosize v-model="data.VipData"/>
                  </el-form-item>
                </template>
              </el-popover>
              <el-form-item label="运营状态" prop="Status">
                <el-radio-group v-model="data.Status" :size="is移动端()?'small':''">
                  <el-popover placement="left" trigger="hover" content="所有用户禁止登录">
                    <template #reference>
                      <el-radio-button :value="1">停止运营</el-radio-button>
                    </template>
                  </el-popover>
                  <el-popover placement="top" trigger="hover" content="非Vip也可正常登录">
                    <template #reference>
                      <el-radio-button :value="2">免费运营</el-radio-button>
                    </template>
                  </el-popover>
                  <el-radio-button :value="3">正常运营</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="状态提示" prop="AppStatusMessage">
                <el-input v-model.trim="data.AppStatusMessage"/>
              </el-form-item>
              <el-form-item label="绑定模式" prop="VerifyKey">
                <el-popover placement="right" trigger="hover"
                            content="登录是否验证绑定信息,是否允许更换绑定信息">
                  <template #reference>
                    <el-select v-model="data.VerifyKey" clear>
                      <el-option key="1" label="免验证可以换绑" :value="1"/>
                      <el-option key="2" label="免验证禁止换绑" :value="2"/>
                      <el-option key="3" label="验证可以换绑" :value="3"/>
                      <el-option key="4" label="验证禁止换绑" :value="4"/>
                    </el-select>
                  </template>
                </el-popover>
              </el-form-item>

              <el-form-item label="绑定相同" prop="IsUserKeySame">
                <el-popover placement="right" trigger="hover"
                            content="不同用户绑定信息可否相同,绑定(账号、机器码,等)可防止重复试用">
                  <template #reference>
                    <el-select v-model="data.IsUserKeySame" clear>
                      <el-option key="1" label="不同用户可以相同" :value="1"/>
                      <el-option key="2" label="不同用户不可相同" :value="2"/>
                    </el-select>
                  </template>
                </el-popover>
              </el-form-item>

              <el-form-item label="注册送卡" prop="RegisterGiveKaClassId">
                <el-popover placement="right" trigger="hover"
                            :content="data.AppType<=2?'设置一个注册送卡类,注册送时间,点数,余额,积分都可以在设置,用户注册就会自动充值这个卡类简单方便':'设置一个卡类可以通过取注册送卡获取试用卡'">
                  <template #reference>
                    <el-select v-model="data.RegisterGiveKaClassId" clear placeholder="选择卡类">
                      <el-option key="0" label="无赠送" :value="0"/>
                      <el-option v-for="(值,index) in 对象_卡类型" :key="index" :label="对象_卡类型[index]"
                                 :value="Number(index)"/>
                    </el-select>
                  </template>
                </el-popover>
              </el-form-item>

              <el-divider content-position="left">换绑/解绑</el-divider>
              <el-form-item label="免费间隔">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <el-select v-model="data.FreeUpKeyTime" placeholder="Select" style="width: 240px">
                    <el-option label="1小时内" :value="3600"/>
                    <el-option label="24小时内" :value="86400"/>
                    <el-option label="1周内" :value="604800"/>
                    <el-option label="1月内" :value="2592000"/>
                    <el-option label="1年内" :value="31536000"/>
                    <el-option label="316年内" :value="9999999999"/>
                  </el-select>
                  <span>免费换绑</span>
                  <el-input-number
                      v-model="data.FreeUpKeyInterval"
                      :min="0"
                      style="width: 120px;"
                  />
                  <span>次</span>
                </div>
              </el-form-item>

              <el-form-item label="换绑频率">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <el-select v-model="data.UpKeyTime" placeholder="Select" style="width: 240px">
                    <el-option label="1分钟内" :value="60"/>
                    <el-option label="1小时内" :value="3600"/>
                    <el-option label="24小时内" :value="86400"/>
                    <el-option label="1周内" :value="604800"/>
                    <el-option label="1月内" :value="2592000"/>
                    <el-option label="1年内" :value="31536000"/>
                    <el-option label="316年内" :value="9999999999"/>
                  </el-select>
                  <span>允许换绑</span>
                  <el-input-number
                      v-model="data.UpKeyInterval"
                      :min="0"
                      style="width: 120px;"
                  />
                  <span>次</span>
                </div>
              </el-form-item>



              <el-form-item :label="isVipType?'换绑扣秒':'换绑扣点'" prop="UpKeyData">
                <el-tooltip
                    :trigger-keys="[]"
                    class="box-item"
                    effect="light"
                    :content="时间_计算天时分秒提示 (data.UpKeyData)"
                    placement="left"
                    :disabled="isAppType计点()"
                >
                  <el-input-number v-model="data.UpKeyData" :step="10" :value-on-clear="10" :min="0"/>
                </el-tooltip>
              </el-form-item>
              <el-divider content-position="left">代理相关</el-divider>
              <el-form-item label="代理卡充值" prop="Status">
                <el-radio-group v-model="data.AgentKaUseModel" :size="is移动端()?'small':''">
                  <el-radio-button :value="0">无限制</el-radio-button>
                  <el-popover placement="right" trigger="hover" content="只能充值自己的归属用户,或无归属用户">
                    <template #reference>
                      <el-radio-button :value="1">限归属用户</el-radio-button>
                    </template>
                  </el-popover>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="归属代理送卡" prop="RegisterGiveKaClassId" v-if ="data.AppType<=2">
                <el-popover placement="right" trigger="hover"
                            content="用户归属代理时自动充值该卡,可以激励用户主动联系代理,代理也可以用来宣传">
                  <template #reference>
                    <el-select v-model="data.AgentGiftKaClassId" clear placeholder="选择卡类" :style="{ width: is移动端() ? '100%' : '280px' }">
                      <el-option key="0" label="无赠送" :value="0"/>
                      <el-option v-for="(值,index) in 对象_卡类型" :key="index" :label="对象_卡类型[index]"
                                 :value="Number(index)"/>
                    </el-select>
                  </template>
                </el-popover>
              </el-form-item>


            </el-tab-pane>
            <el-tab-pane label="安全设置" name="安全设置">
              <el-form-item label="用户Api地址" prop="AppWeb">
                <el-input v-model="data.AppWeb" class="只读编辑框" readonly="readonly" style="background: #889aa4">

                  <template #prepend>
                    {{ SerVerUrl }}
                  </template>

                  <template #append>
                    <el-popover
                        placement="top-start"
                        trigger="hover"
                        content="复制App配置到剪辑版"
                    >
                      <template #reference>
                        <el-button type="primary" @click="on置剪辑版配置信息" icon="DocumentCopy">复制App配置
                        </el-button>
                      </template>
                    </el-popover>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="通讯加密类型" prop="CryptoType">
                <el-radio-group v-model="data.CryptoType" :size="is移动端()?'small':''">
                  <el-radio-button :value="1">明文</el-radio-button>
                  <el-popover
                      placement="top"
                      trigger="hover"
                      content="AES_192CBC_IV0"
                  >
                    <template #reference>
                      <el-radio-button :value="2">Md5签名Aes加密</el-radio-button>
                    </template>
                  </el-popover>
                  <el-popover
                      placement="top"
                      trigger="hover"
                      content="RSA交换AES密钥,重要数据RSA通讯防山寨服务器或客户端,一般数据AES加密通讯提高性能,混合使用性能安全兼顾,Rsa_1024位PKCS1"
                  >
                    <template #reference>
                      <el-radio-button :value="3">Rsa交换Aes密匙后混合使用</el-radio-button>
                    </template>
                  </el-popover>

                </el-radio-group>
                <div class="重置密钥" v-show="data.CryptoType>1">
                  <el-tooltip content="重置密钥"
                              effect="dark"
                              placement="top">
                    <el-icon @click="on重置密钥">
                      <Refresh/>
                    </el-icon>
                  </el-tooltip>
                </div>
              </el-form-item>


              <el-form-item v-show="data.CryptoType===2" label="加解密密匙" prop="CryptoKeyAes">
                <el-input type="text" v-model="data.CryptoKeyAes"/>
              </el-form-item>

              <el-form-item v-show="data.CryptoType===3" label="Rsa私钥" prop="CryptoKeyPrivate">
                <el-input type="textarea" v-model="data.CryptoKeyPrivate"/>
              </el-form-item>

              <el-form-item v-show="data.CryptoType===3" label="Rsa公钥" prop="CryptoKeyPublic">
                <el-input type="textarea" v-model="data.CryptoKeyPublic"/>
              </el-form-item>
              <el-form-item label="封包超时">
                <el-tooltip
                    :trigger-keys="[]"
                    class="box-item"
                    effect="light"
                    :content="时间_计算天时分秒提示 (data.PackTimeOut)"
                    placement="left"
                >
                  <div style="display: flex; align-items: center">
                    <el-input-number v-model="data.PackTimeOut" :step="10" :value-on-clear="10" :min="0"/>
                    秒
                    <el-button @click="data.PackTimeOut=5*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "5分钟" }}
                    </el-button>
                    <el-button @click="data.PackTimeOut=15*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "15分" }}
                    </el-button>
                    <el-button @click="data.PackTimeOut=30*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "30分" }}
                    </el-button>
                    <el-button @click="data.PackTimeOut=60*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "60分" }}
                    </el-button>
                  </div>
                </el-tooltip>
                <el-tooltip content="封包时间戳校验,超过后报错封包超时,0不校验"
                            effect="dark"
                            placement="top">
                  <el-icon size="24" color="#409EFC" class="no-inherit">
                    <QuestionFilled/>
                  </el-icon>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="心跳超时" prop="OutTime">

                <el-tooltip
                    :trigger-keys="[]"
                    class="box-item"
                    effect="light"
                    :content="时间_计算天时分秒提示 (data.OutTime)"
                    placement="left"
                >
                  <div style="display: flex; align-items: center">
                    <el-input-number v-model="data.OutTime" :step="10" :value-on-clear="10" :min="0"/>
                    秒

                    <el-button @click="data.OutTime=5*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "5分钟" }}
                    </el-button>
                    <el-button @click="data.OutTime=15*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "15分" }}
                    </el-button>
                    <el-button @click="data.OutTime=30*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "30分" }}
                    </el-button>
                    <el-button @click="data.OutTime=60*60" :style="is移动端()?'width: 9vh':'width: 4vh'">
                      {{ "60分" }}
                    </el-button>

                    <el-tooltip content="超过时间没调用接口或心跳的的在线Token,自动注销在线状态"
                                effect="dark"
                                placement="top">
                      <el-icon size="24" color="#409EFC" class="no-inherit">
                        <QuestionFilled/>
                      </el-icon>
                    </el-tooltip>

                  </div>
                </el-tooltip>


              </el-form-item>


              <el-form-item label="超在线最大数处理方式" prop="ExceedMaxOnlineOut">
                <el-radio-group v-model="data.ExceedMaxOnlineOut" :size="is移动端()?'small':''">
                  <el-radio-button :value="1">注销在线中最先登录的记录</el-radio-button>
                  <el-radio-button :value="2">提示登录数量超过限制</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="需要英数验证码接口" prop="Captcha">
                <el-select
                    v-model="数组_验证码英数"
                    multiple
                    placeholder="选择接口"
                    style="width: 100%"
                    @change="on验证码多选发生变化"
                >
                  <el-option
                      v-for="item in 数组_用户Api"
                      :key="item[0]"
                      :label="item[1]+'('+item[0]+')'"
                      :value="item[0]"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="需要行为验证码接口" prop="Captcha">
                <el-select
                    v-model="数组_验证码行为"
                    multiple
                    placeholder="选择接口"
                    style="width: 100%"
                    @change="on验证码多选发生变化"
                >
                  <el-option
                      v-for="item in 数组_用户Api"
                      :key="item[0]"
                      :label="item[1]+'('+item[0]+')'"
                      :value="item[0]"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="短信验证码" prop="Captcha">
                <el-select
                    v-model="数组_验证码短信"
                    multiple
                    placeholder="选择接口"
                    style="width: 100%"

                >
                  <el-option
                      v-for="item in 数组_用户Api"
                      :key="item[0]"
                      :label="item[1]+'('+item[0]+')'"
                      :value="item[0]"
                  />
                </el-select>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="专属云变量" name="专属云变量">
              <el-radio-group v-if="专属变量" v-model="专属变量筛选器" size="small">
                <el-radio-button :value="3" border>全部</el-radio-button>
                <el-radio-button :value="1" border>限登陆</el-radio-button>
                <el-radio-button :value="0" border>任意</el-radio-button>
              </el-radio-group>

              <el-form-item v-for="(data, key) in sorted专属变量" :key="key" style="width: 100%" label-width="0">
                <div class="专属变量" style="display: inline-block; width: 100%; left: 100px"
                     v-if="专属变量筛选器 == 3 || Number(data.IsVip) ==专属变量筛选器"
                >
                  <div style="display: flex; align-items: center;">
                    <el-switch
                        :active-value="1"
                        :inactive-value="0"
                        v-model="data.IsVip"
                        width="60" style="margin-left: 5px;margin-right: 10px"
                        inline-prompt
                        active-text="限登录"
                        inactive-text="任意"
                    />
                    <el-divider content-position="left">
                      <el-text class="mx-1" :type="data.Sort>100?'primary':''">{{ data.Name }}</el-text>
                    </el-divider>
                    <div @click="data.Sort?data.Sort=0:data.Sort=时间_取现行时间戳()" class="工具栏">
                      <el-tooltip
                          class="box-item"
                          effect="dark"
                          :content="data.Sort>100?'取消':'置顶'"
                          placement="top-start"
                      >
                        <el-icon size="24" :color="data.Sort>100?'#409EFC':'#556375'" class="no-inherit">
                          <Star/>
                        </el-icon>
                      </el-tooltip>

                    </div>
                  </div>
                  <el-input v-if="data.Type === 1" type="text" v-model.trim="data.Value"
                            maxlength="16777215" style="width: calc(100% - 50px); margin-left: 5px"/>
                  <el-input v-if="data.Type === 2" type="textarea" v-model="data.Value"
                            placeholder="最长支持16777215长度"
                            maxlength="16777215"
                            :autosize="{ minRows: 2, maxRows: 23 }" style="width: calc(100% - 50px); margin-left: 5px"/>
                  <el-radio-group v-if="data.Type === 3" v-model="data.Value" style="margin-left: 5px">
                    <el-radio value="1" style="margin-right: 5px" border>开启</el-radio>
                    <el-radio value="0" style="margin-left: 5px" border>关闭</el-radio>
                  </el-radio-group>
                  <div style="float: right; padding-left: 5px">
                    <el-popconfirm :title="'确定删除?'+data.Name"
                                   placement="right"
                                   @confirm="on删除专属变量(data)" confirm-button-text="确定"
                                   cancel-button-text="取消">

                      <template #reference>
                        <el-button type="danger" size="small" :icon="Delete" circle style=" margin-left: 5px"/>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
              </el-form-item>
              <el-divider>
                <el-button type="primary" size="large" :icon="Plus" style="width: 110px" round
                           @click="is添加专属变量 = true">
                  添加专属变量
                </el-button>
              </el-divider>


              <el-dialog
                  v-model="is添加专属变量"
                  :width="is移动端()?'90%':'30%'"
                  title="选择变量类型"
                  append-to-body
              >
                <el-form :inline="false" style="min-width: 80px ;top: 10px" label-width="130px"
                         :model="添加专属变量"
                         label-position="top" ref="ruleFormRef">
                  <el-form-item label="变量名称" prop="Name">
                    <el-input v-model.trim="添加专属变量.Name" placeholder="请输入变量名称" style="width: 263px"/>
                  </el-form-item>

                  <el-form-item label="变量类型" prop="Status">
                    <el-radio-group v-model="添加专属变量.Type" :size="is移动端()?'small':''">
                      <el-radio-button :value="1">单行文本</el-radio-button>
                      <el-radio-button :value="2">多行文本</el-radio-button>
                      <el-radio-button :value="3">逻辑开关</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" text @click="on添加专属变量(false)">取消</el-button>
                    <el-button size="small" type="primary" @click="on添加专属变量(true)"
                    >确定
                    </el-button
                    >
                  </div>
                </el-form>
              </el-dialog>
            </el-tab-pane>

            <el-tab-pane label="ApiHook" name="ApiHook">
              <div v-for="(data,key) in 数组_ApiHook" :key="key" class="内容div">
                <el-form-item label="APi接口:" style="width: 100%">
                  <el-select
                      v-model="data[0]"
                      placeholder="Api接口"
                      :style="is移动端()?' width: calc(90% - 32px )':' width: 30%'"
                      @change="on验证码多选发生变化"
                  >
                    <el-option
                        v-for="item in 数组_用户Api"
                        :key="item[0]"
                        :label="item[1]+'('+item[0]+')'"
                        :value="item[0]"
                    />
                  </el-select>
                  <div style="float: right;padding-left: 5px">
                    <el-popconfirm title="确定删除?"
                                   placement="right"
                                   @confirm="数组_ApiHook.splice(key, 1)" confirm-button-text="确定"
                                   cancel-button-text="取消">
                      <template #reference>
                        <el-button type="danger" size="small" :icon="Delete" circle style=" margin-left: 5px"/>
                      </template>
                    </el-popconfirm>
                  </div>
                </el-form-item>
                <el-form-item label="执行前hook函数:" style="width: 100%">
                  <el-input type="text" v-model.trim="data[1]"
                            maxlength="200"
                            placeholder="直接填写公共hook函数名即可,不存在自动按模板创建,可空"
                            style="width: calc(90% )"/>
                </el-form-item>
                <el-form-item label="执行后hook函数:" style="width: 100%">
                  <el-input type="text" v-model.trim="data[2]"
                            maxlength="200"
                            placeholder="直接填写公共hook函数名即可,不存在自动按模板创建,可空"
                            style="width: calc(90% )"/>

                </el-form-item>
              </div>


              <el-divider>
                <el-button type="primary" size="large" :icon="Plus" style="width: 110px" round
                           @click="数组_ApiHook.push([])">
                  添加ApiHook
                </el-button>
              </el-divider>
            </el-tab-pane>
            <el-tab-pane label="网页用户中心" name="网页用户中心">
              <el-form v-loading="is加载中" :inline="false" style="min-width: 80px" label-width="160px" :model="dataWebUser"
                       :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
                <el-divider content-position="left">基础配置</el-divider>

                  <el-form-item label="网页用户中心" prop="是否启用">
                    <el-radio-group v-model="dataWebUser.status">
                      <el-radio-button :value="1" size="" border>开启</el-radio-button>
                      <el-radio-button :value="2" size="" border>关闭</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="网页用户中心地址"  >
                    <el-input v-model="dataWebUser.webUserDomain"  placeholder="单独域名,需要将该域名解析到本服务器,方便单独套高防服务器,或者套cdn"  >
                      <template #append>/user/{{data.AppId}}/</template>
                    </el-input>
                    <el-link :href="dataWebUser.webUserDomain+'/user/'+data.AppId+'/'" target="_blank">
                      <el-icon size="24">
                        <Link/>
                      </el-icon>
                      {{dataWebUser.webUserDomain}}/user/{{data.AppId}}/
                    </el-link>
                  </el-form-item>

                <el-divider content-position="left">网页点选验证码配置</el-divider>
                <el-form-item label="登陆防爆阈值"  >
                  <el-tooltip content="账号登陆失败多少次必须输入验证码"
                              effect="dark"
                              placement="top">
                    <el-input-number v-model="dataWebUser.captchaLogin" :precision="0" :step="1" :value-on-clear="0" :min="0"/>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="注册验证码"  >
                  <el-switch
                      :active-value="1"
                      :inactive-value="2"
                      v-model="dataWebUser.captchaReg"
                      class="ml-2"
                      inline-prompt
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                      active-text="开启"
                      inactive-text="关闭"
                  />
                </el-form-item>
                <el-form-item label="发短信(如找回密码)"  >

                  <el-switch
                      :active-value="1"
                      :inactive-value="2"
                      v-model="dataWebUser.captchaSendSms"
                      class="ml-2"
                      inline-prompt
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                      active-text="开启"
                      inactive-text="关闭"
                  />
                </el-form-item>
                <el-divider content-position="center">下载页配置</el-divider>
                <el-form-item label="下载地址"  >
                  <el-tooltip content="可以是直链,可以是网址,支持变量 最新版本号: {{AppVer}} {{云存储_取外链('10001/app2.apk',0)}}"
                              effect="dark"
                              placement="top">
                    <el-input v-model="dataWebUser.urlDownload" :precision="0" :step="1" :value-on-clear="0" :min="0"/>
                  </el-tooltip>
                </el-form-item>
                <el-divider content-position="center">其他设置</el-divider>
                <el-form-item label="限代理用户充值"  >
                  <el-switch
                      :active-value="1"
                      :inactive-value="2"
                      v-model="dataWebUser.agentOnlyOrder"
                      class="ml-2"
                      inline-prompt
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                      active-text="开启"
                      inactive-text="关闭"
                  />
                  <el-tooltip  v-if="!is移动端()"   content="有归属代理才可以购卡,防止用户中心,注册就充值,未在客户端置代理标识,导致代理无分成的问题">
                    <el-icon size="24" color="#73C0E7FF"  >
                      <QuestionFilled/>
                    </el-icon>
                  </el-tooltip>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" v-loading="is加载中">
          <el-button @click="is对话框可见2=false">取 消</el-button>
          <el-button type="primary" @click="on确定按钮被点击(ruleFormRef)">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <uplode v-if="is显示上传界面" :path="Props.id+'/'" @on对话框详细信息关闭="on对话框上传界面关闭"/>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {SaveApp信息, GetApp详细信息, Get全部用户APi} from "@/api/应用列表api";
import {Get网页用户中心详细信息} from "@/api/网页用户中心api";
import {New, DeleteInfo, GetList} from "@/api/公共变量api";
import {ElMessage, FormInstance} from "element-plus";
import {is移动端, 时间_取现行时间戳, 时间_计算天时分秒提示, 置剪辑版文本} from "@/utils/utils";
import {Rsa密匙对校验, Rsa生成密匙对} from "@/utils/Rsa工具";
import uplode from "@/view/二开扩展/组件/云存储上传.vue";
import {CirclePlus, Plus, Refresh} from "@element-plus/icons";
import {Delete} from "@element-plus/icons-vue";

const Props = defineProps({
  id: {
    type: Number,
    default: 0
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])

const isVipType = ref(true)  // 真是件  假点数
const 应用详细信息顶部标签现行选项 = ref("应用设置")

const is加载中 = ref(false)
const 专属变量筛选器 = ref(3)

const sorted专属变量 = computed(() => {
  return 专属变量.value.slice().sort((a, b) => {
    if (a.Sort !== 0 && b.Sort !== 0) {
      return b.Sort - a.Sort;
    } else if (a.Sort !== 0) {
      return -1;
    } else if (b.Sort !== 0) {
      return 1;
    } else {
      return 0;
    }
  });
});
const is对话框可见2 = ref(true)
const 对象_卡类型 = ref({})
const SerVerUrl = ref("http://127.0.0.1:18888")
const data = ref({
  "AppId": 0,
  "AppWeb": "/Api?AppId=10001",
  "AppName": "测试应用",
  "Status": 3,
  "AppStatusMessage": "正常运营中",
  "AppVer": "1.1.2\n1.1\n1.0",
  "RegisterGiveKaClassId": 0,
  "VerifyKey": 1,
  "IsUserKeySame": 1,
  "UpKeyData": 10,
  "OutTime": 1800,
  "UrlHome": "https://www.baidu.com/",
  "UrlDownload": "{\n    \"htmlurl\": \"www.baidu.com(自动下载失败打开指定网址,手动更新地址\",\n    \"data\": [{\n        \"WenJianMin\": \"文件名.exe\",\n        \"md5\": \"e10adc3949ba59abbe56e057f20f883e(小写文件md5可选,有就校验,空就只校验文件名)\",\n        \"Lujing\": \"/(下载本地相对路径)\",\n        \"size\": \"12345\",\n        \"url\": \"https://www.baidu.com/文件名.exe(下载路径)\",\n        \"YunXing\": \"1(值为更新完成后会运行这个文件,只能有一个文件值为1)\"\n\n    }, {\n        \"WenJianMin\": \"文件名.dll\",\n        \"md5\": \"e10adc3949ba59abbe56e057f20f883e(小写文件md5可选,有就校验,没有就文件名校验)\",\n        \"Lujing\": \"/(下载本地相对路径)\",\n        \"size\": \"12345\",\n        \"url\": \"https://www.baidu.com/文件名.dll(下载路径)\",\n        \"YunXing\": \"0\"\n    }]\n}",
  "AppGongGao": "我是一条公告",
  "VipData": "{\n\"VipData\":\"这里的数据,只有登录成功并且账号会员不过期才会传输出去的数据\",\n\"VipData2\":\"这里的数据,只有登录成功并且账号会员不过期才会传输出去的数据\"\n}",
  "CryptoType": 1,
  "CryptoKeyAes": "aE0WDmhp3j84STssmc2EypU5",
  "CryptoKeyPrivate": "",
  "CryptoKeyPublic": "",
  "MaxOnline": 1,
  "ExceedMaxOnlineOut": 1,
  "AppType": 1,
  "AgentKaUseModel": 0,
  "AgentGiftKaClassId": 0,
  "Captcha": "",
  "ApiHook": "",
  PackTimeOut: 0,
  FreeUpKeyTime: 0,
  FreeUpKeyInterval: 0,
  UpKeyTime: 0,
  UpKeyInterval: 0,
})
const dataWebUser = ref({
  status: 2,
  urlDownload: "",
  captchaLogin: 3,
  captchaReg: 2,
  captchaSendSms: 1,
  webUserDomain: "",
  agentOnlyOrder: 2,
})



const on验证码多选发生变化 = () => {
  console.info(数组_验证码英数.value)
  console.info(数组_验证码行为.value)
}

const isAppType计点 = () => {
  return data.value.AppType === 2 || data.value.AppType === 4
}
const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)
const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {
  console.info("on确定按钮被点击")
  console.info(formEl)
  if (!formEl) return

  let 表单验证结果 = await formEl.validate((valid, fields) => {
    if (!valid) {
      console.log('参数验证失败', fields)
    } else {
      console.log('参数验证通过')
      console.info(valid)
      console.info(fields)
    }
  })
  console.info("表单验证结果")

  console.info(表单验证结果)


  if (!表单验证结果) return   //如果是假直接返回
  let 返回;
  if (Props.id === 0) {

  } else {
    is加载中.value = true
    let 验证码JSon: object = {} as any[];

    for (let 索引 in 数组_验证码短信.value) {
      let Api: string = 数组_验证码短信.value[索引]
      验证码JSon[Api] = 3
    }
    for (let 索引 in 数组_验证码行为.value) {
      let Api: string = 数组_验证码行为.value[索引]
      验证码JSon[Api] = 2
    }

    for (let 索引 in 数组_验证码英数.value) {
      let Api: string = 数组_验证码英数.value[索引]
      验证码JSon[Api] = 1
    }

    data.value.Captcha = JSON.stringify(验证码JSon)
    data.value.ApiHook = JSON.stringify(取ApiHook整理json(数组_ApiHook.value))
    返回 = await SaveApp信息({"AppData": data.value, "PublicData": 专属变量.value,"AppInfoWebUser":dataWebUser.value});
    is加载中.value = false
  }

  console.log(返回)
  if (返回.code == 10000) {
    is重新读取.value = true
    is对话框可见2.value = false
    ElMessage.success(返回.msg)
  }
}
const on打开版本信息详细描述 = () => {
  window.open('https://zhidao.baidu.com/question/818814935849090692.html', '版本信息详细描述')
}
const on重置密钥 = () => {
  if (data.value.CryptoType === 2) {
    let e = 24;
    let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++) {
      n += t.charAt(Math.floor(Math.random() * a));
    }
    data.value.CryptoKeyAes = n
  }

  if (data.value.CryptoType === 3) {
    Rsa生成密匙对(function (privateKey, publicKey) {
      // 替换\r\n 为\n
      data.value.CryptoKeyPublic = publicKey.replace(/\r\n/g, '\n');
      data.value.CryptoKeyPrivate = privateKey.replace(/\r\n/g, '\n');
      console.log(privateKey, publicKey);
    })
  }
}
const on增加版本号 = (位数, 增减值) => {
  const 版本号行 = data.value.AppVer.split('\n');
  const 版本号数组 = 版本号行[0].split('.');
  const 新版本号数组 = 版本号数组.map((item, index) => {
    if (index === 位数 - 1) {
      return parseInt(item) + 增减值;
    } else {
      return item;
    }
  });
  const 新版本号行 = 新版本号数组.join('.');
  data.value.AppVer = 新版本号行 + '\n' + 版本号行.slice(1).join('\n');
}
const on校验表单重置 = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
onMounted(() => {
  console.info("用户详细信息对话框加载完毕了")
  is重新读取.value = false
  console.info("on对话框被打开id:" + Props.id)
  on校验表单重置(ruleFormRef.value)

  读取详细信息(Props.id)
})
onUnmounted(() => {
  console.info("应用详细信息对话框被关闭了")
  localStorage.setItem(Props.id + '应用详细信息顶部标签现行选项', 应用详细信息顶部标签现行选项.value)
  localStorage.setItem(Props.id + '专属变量筛选器', 专属变量筛选器.value)
})

const 校验是否json = (rule: any, value: any, callback: any) => {

  let c: string = ""
  try {
    JSON.parse(value.toString())
  } catch (d: any) {
    let str = d.toString()
    //校验UrlDownload是否json失败SyntaxError: Unexpected non-whitespace character after JSON at position 597
    //console.error("校验UrlDownload是否json失败"+d)
    str = str.match(/JSON at position (\d+)/)[1]
    c = "json格式错误,位置(" + str + ")字符处:" + value.substring(Number(str))
    //console.error(c)
  }
  if (c != "") {
    callback(new Error(c))
  } else {
    callback()
  }
}
const 校验Rsa密匙对校验 = (rule: any, value: any, callback: any) => {
  if (!Rsa密匙对校验(data.value.CryptoKeyPrivate, data.value.CryptoKeyPublic)) {
    callback(new Error("Rsa公私密钥对不匹配"))
  } else {
    callback()
  }
}


const on表单校验 = ref({
  AppName: [
    {required: true, message: '请输入应用名称', trigger: 'blur'},
    {min: 4, message: '最低4位字符', trigger: ''}
  ],
  CryptoKeyAes: [
    {min: 24, max: 24, message: 'Aes_cbc_192密匙长度为24位字符', trigger: 'blur'},
  ],
  Phone: [
    {pattern: /^1([38][0-9]|4[014-9]|[59][0-35-9]|6[2567]|7[0-8])\d{8}$/, message: '请输入合法手机号', trigger: 'blur'},
  ],
  VipData: [{validator: 校验是否json, trigger: 'blur'}],
  UrlDownload: [{validator: 校验是否json, trigger: 'blur'}],
  CryptoKeyPrivate: [{validator: 校验Rsa密匙对校验, trigger: 'blur'}],
})


const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    is加载中.value = true
    let 返回 = await GetApp详细信息({"Id": id})
    is加载中.value = false
    if (返回.code == 10000) {
      let 局_临时文本 = localStorage.getItem(Props.id + '应用详细信息顶部标签现行选项') ?? "应用设置";
      console.info("读取本地存储应用详细信息顶部标签现行选项:" + 局_临时文本)
      应用详细信息顶部标签现行选项.value = 局_临时文本
      let 局_临时整数 = localStorage.getItem(Props.id + '专属变量筛选器') ?? 3;
      console.info("读取本地存储专属变量筛选器:" + 局_临时文本)
      专属变量筛选器.value = Number(局_临时整数)


      data.value = 返回.data.AppInfo
      SerVerUrl.value = 返回.data.ServerUrl
      //判断是否已经有了端口,没有在添加 有端口可能是内网映射
      if (!SerVerUrl.value.indexOf(":") && 返回.data.Port > 0) {
        SerVerUrl.value += +":" + 返回.data.Port
      }
      对象_卡类型.value = 返回.data.KaClass
      if (返回.data.AppType === 2 || 返回.data.AppType === 4) {
        isVipType.value = false
      } else {
        isVipType.value = true
      }


      await on读取用户Api数组()

      //必须选读取下拉框后再填入已选择数据,不然不显示
      数组_验证码英数.value = []
      数组_验证码行为.value = []
      数组_验证码短信.value = []

      try {
        //防止不是json,导致报错
        let 验证码Json = JSON.parse(data.value.Captcha)
        for (let Api in 验证码Json) {
          console.log("枚举验证码json:" + Api)
          if (验证码Json.hasOwnProperty(Api)) {
            if (验证码Json[Api] === 1) {
              数组_验证码英数.value.push(Api)
            } else if (验证码Json[Api] === 2) {
              数组_验证码行为.value.push(Api)
            } else if (验证码Json[Api] === 3) {
              数组_验证码短信.value.push(Api)
            }
          }
        }
        console.log(数组_验证码英数.value)
        数组_ApiHook.value = []
        数组_ApiHook.value = 取ApiHook反向整理数组(data.value.ApiHook)
      } catch (e) {

      }

      await on读取专属变量()
      await on读取网页用户中心配置()


    } else {
      is重新读取.value = false
      is对话框可见2.value = false
    }

  } else {
    data.value = {
      "AppId": 10001,
      "AppWeb": "/Api?AppId=10001",
      "AppName": "测试应用",
      "Status": 3,
      "AppStatusMessage": "正常运营中",
      "AppVer": "1.1.2\n1.1\n1.0",
      "RegisterGiveKaClassId": 0,
      "VerifyKey": 1,
      "IsUserKeySame": 1,
      "UpKeyData": 10,
      "OutTime": 1800,
      "UrlHome": "https://www.baidu.com/",
      "UrlDownload": "{\n    \"htmlurl\": \"www.baidu.com(自动下载失败打开指定网址,手动更新地址\",\n    \"data\": [{\n        \"WenJianMin\": \"文件名.exe\",\n        \"md5\": \"e10adc3949ba59abbe56e057f20f883e(小写文件md5可选,有就校验,空就只校验文件名)\",\n        \"Lujing\": \"/(下载本地相对路径)\",\n        \"size\": \"12345\",\n        \"url\": \"https://www.baidu.com/文件名.exe(下载路径)\",\n        \"YunXing\": \"1(值为更新完成后会运行这个文件,只能有一个文件值为1)\"\n\n    }, {\n        \"WenJianMin\": \"文件名.dll\",\n        \"md5\": \"e10adc3949ba59abbe56e057f20f883e(小写文件md5可选,有就校验,没有就文件名校验)\",\n        \"Lujing\": \"/(下载本地相对路径)\",\n        \"size\": \"12345\",\n        \"url\": \"https://www.baidu.com/文件名.dll(下载路径)\",\n        \"YunXing\": \"0\"\n    }]\n}",
      "AppGongGao": "我是一条公告",
      "VipData": "{\n\"VipData\":\"这里的数据,只有登录成功并且账号会员不过期才会传输出去的数据\",\n\"VipData2\":\"这里的数据,只有登录成功并且账号会员不过期才会传输出去的数据\"\n}",
      "CryptoType": 2,
      "CryptoKeyAes": "aE0WDmhp3j84STssmc2EypU5",
      "CryptoKeyPrivate": "",
      "CryptoKeyPublic": "",
      "MaxOnline": 1,
      "ExceedMaxOnlineOut": 1,
      "AppType": 1,
      "RmbToVipNumber": 1,
      "Captcha": "",
      "ApiHook": ""
    }

  }
}

const 数组_用户Api = ref([])
const 数组_验证码英数 = ref(["未定义"])
const 数组_验证码行为 = ref(["未定义"])
const 数组_验证码短信 = ref(["未定义"])

const on读取用户Api数组 = async () => {
  console.log(数组_用户Api.value.length)
  数组_验证码英数.value = []
  if (数组_用户Api.value.length === 0) {
    is加载中.value = true
    const res = await Get全部用户APi()
    is加载中.value = false
    if (res.code == 10000) {
      数组_用户Api.value = res.data
    }
  }
  console.log(数组_用户Api.value)
  return
}
const on读取网页用户中心配置 = async () => {
    const res = await Get网页用户中心详细信息({"id": Props.id})
    if (res.code == 10000) {
      dataWebUser.value = res.data
      if (!dataWebUser.value.webUserDomain) {
        dataWebUser.value.webUserDomain=SerVerUrl.value
      }
    }
}


const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见2.value = false
  emit('on对话框详细信息关闭', is重新读取.value)

}
const on置剪辑版配置信息 = () => {
  let appINfo = {}
  if (data.value.CryptoType === 1) {
    appINfo = {
      "AppWeb": SerVerUrl.value + data.value.AppWeb,
      "CryptoType": data.value.CryptoType
    }
  } else if (data.value.CryptoType === 2) {
    appINfo = {
      "AppWeb": SerVerUrl.value + data.value.AppWeb,
      "CryptoKeyAes": data.value.CryptoKeyAes,
      "CryptoType": data.value.CryptoType
    }
  } else if (data.value.CryptoType === 3) {
    appINfo = {
      "AppWeb": SerVerUrl.value + data.value.AppWeb,
      "CryptoKeyPublic": data.value.CryptoKeyPublic,
      "CryptoType": data.value.CryptoType
    }
  }

  置剪辑版文本(JSON.stringify(appINfo), "已复制:" + JSON.stringify(appINfo))

}
//================================================================应用专属变量开始==================================================
const 专属变量 = ref([
  {
    "AppId": 1,
    "Name": "测试逻辑开关",
    "Value": "1",
    "Type": 3,
    "IsVip": 1,
    "Sort": 0
  },
  {
    "AppId": 1,
    "Name": "系统名称",
    "Value": "应用管理系统",
    "Type": 1,
    "IsVip": 1,
    "Sort": 0
  },
  {
    "AppId": 1,
    "Name": "系统地址",
    "Value": "www.baidu.com",
    "Type": 1,
    "IsVip": 1,
    "Sort": 0
  },
  {
    "AppId": 1,
    "Name": "超长1w+变量",
    "Value": "const on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})\nconst on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})\nconst on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})const on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})\nconst on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})const on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})const on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})\nconst on表单校验 = ref({\n  Name: [\n    {required: true, message: '请输入变量名称', trigger: 'blur'},\n    {min: 1, message: '最低1位字符', trigger: ''}\n  ],\n  Value: [\n    {min: 1, message: '最低1位字符', trigger: ''},\n    {max: 20000, message: '最长20000位字符', trigger: ''}\n  ],\n})",
    "Type": 2,
    "IsVip": 1,
    "Sort": 0
  }
])
let is添加专属变量 = ref(false)
const 添加专属变量 = ref({
  "AppId": 1,
  "Name": "",
  "Value": "",
  "Type": 1,
  "IsVip": 0,
  "Sort": 0
})
const on读取专属变量 = async () => {
  专属变量.value = []
  is加载中.value = true
  const res = await GetList({AppId: data.value.AppId, Type: 1, Size: 500, Order: 1, Page: 1, Keywords: ""})
  is加载中.value = false
  if (res.code == 10000) {
    专属变量.value = res.data.List
    专属变量.value.reverse()
    ElMessage.success(res.msg)
  }
}
const on添加专属变量 = async (是否添加: boolean) => {
  if (!是否添加) {
    is添加专属变量.value = false
    return
  }
  添加专属变量.value.Name = 添加专属变量.value.Name.replace(/\s/g, "");
  if (添加专属变量.value.Name === "") {
    ElMessage.error("名称不能为空")
    return
  }

  let NewPublicData = {
    "AppId": data.value.AppId,
    "Name": 添加专属变量.value.Name,
    "Value": 添加专属变量.value.Type == 3 ? "1" : "",
    "Type": 添加专属变量.value.Type,
    "IsVip": 0,
    "Sort": 0
  }

  is加载中.value = true
  const res = await New(NewPublicData)
  is加载中.value = false
  if (res.code == 10000) {
    is添加专属变量.value = false
    专属变量.value.push(NewPublicData)
    ElMessage.success(res.msg)
  }
}

const on删除专属变量 = async (data: object) => {
  is加载中.value = true
  const res = await DeleteInfo({
    "data": [{
      "AppId": data.AppId,
      "Name": data.Name
    }]
  })
  is加载中.value = false

  if (res.code == 10000) {
    is添加专属变量.value = false
    let 数组索引 = 专属变量.value.findIndex((item) => item.Name === data.Name)
    专属变量.value.splice(数组索引, 1)
    ElMessage.success(res.msg)
  }
}
//================================================================应用专属变量结束==================================================
//================================================================ApiHook相关==================================================
const 数组_ApiHook = ref([])

const 取ApiHook整理json = (数组) => {
  //补充这里 最后返回对象{"UserLogin":{"Before":"hook登录前","After":"hook登录之后"},"UseKa":{"Before":"hook使用充值卡前","After":"hook使用充值卡后后"}}
  const result = {};
  for (const item of 数组) {
    const [key, before, after] = item;
    if (key) {
      result[key] = {Before: before ? before : "", After: after ? after : ""};
    }
  }
  return result;
}
const 取ApiHook反向整理数组 = (str) => {
  let obj = JSON.parse(str)
  const result: any = [];
  for (const key in obj) {
    let {Before, After} = obj[key];
    result.push([key, Before, After]);
  }

  return result;
}
//================================================================ApiHook相关结束==================================================
//======================================上传文件相关====================================
const is显示上传界面 = ref(false)
const on对话框上传界面关闭 = (is重新读取: boolean) => {
  // console.info("父组件收到对话框被关闭了")
  is显示上传界面.value = false
}
</script>

<style scoped lang="scss">

.li展示不可修改信息 {
  font-size: 16px;
  margin-left: 10px;
  float: left;
  clear: right;
  width: 100%;
  height: 30px;
  word-wrap: break-word;
  word-break: normal;
}

.重置密钥 {
  margin: 0;

  color: #606266;
  float: right;
  padding: 0;

  .el-icon {
    /*设置边框阴影*/
    font-size: 18px;
    margin-left: 10px;
    margin-top: 5px;
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

.内容div {
  min-height: 20%;
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #f2f6fc;
}

.input-container {
  display: flex;
  align-items: flex-start; /* 确保输入框和工具栏在同一行 */
  position: relative;
}

.toolbar {
  position: absolute;
  top: 0;
  right: 10px; /* 调整工具栏的位置 */
}
</style>
