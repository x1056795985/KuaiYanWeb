const fs = require('fs');
const path = require('path');

const apiDir = process.argv[2];
if (!apiDir) { console.log("Usage: node replace_routes.js <api_dir>"); process.exit(1); }

const replacements = [
  // Base paths
  ['"/User/"', '"/user/"'], ['"/App/"', '"/app/"'], ['"/AppUser/"', '"/appUser/"'],
  ['"/Ka/"', '"/ka/"'], ['"/KaClass/"', '"/kaClass/"'], ['"/Agent/"', '"/agent/"'],
  ['"/AgentInventory/"', '"/agentInventory/"'], ['"/UserConfig/"', '"/userConfig/"'],
  ['"/PublicData/"', '"/publicData/"'], ['"/PublicJs/"', '"/publicJs/"'],
  ['"/TaskPool/"', '"/taskPool/"'], ['"/SetSystem/"', '"/setSystem/"'],
  ['"/LogRMBPayOrder/"', '"/logRMBPayOrder/"'], ['"/UserClass/"', '"/userClass/"'],
  ['"/LogMoney/"', '"/logMoney/"'], ['"/LogUserMsg/"', '"/logUserMsg/"'],
  ['"/Panel/"', '"/panel/"'], ['"/KuaiYan/"', '"/kuaiYan/"'],
  // Endpoints
  ["+'GetList'", "+'getList'"], ["+'GetListAll'", "+'getListAll'"],
  ["+'GetInfo'", "+'getInfo'"], ["+'SaveInfo'", "+'saveInfo'"],
  ["+'New'", "+'new'"], ["+'Delete'", "+'delete'"],
  ["+'DeleteBatch'", "+'deleteBatch'"], ["+'SetStatus'", "+'setStatus'"],
  ["+'Create'", "+'create'"], ["+'Update'", "+'update'"],
  ["+'Info'", "+'info'"], ["+'GetAdminInfo'", "+'getAdminInfo'"],
  ["+'OutLogin'", "+'outLogin'"], ["+'AdminNewPassword'", "+'adminNewPassword'"],
  ["+'GetUserList'", "+'getUserList'"], ["+'GetUserInfo'", "+'getUserInfo'"],
  ["+'SaveUser'", "+'saveUser'"], ["+'NewUser'", "+'newUser'"],
  ["+'SetUserStatus'", "+'setUserStatus'"], ["+'SetBatchAddRMB'", "+'setBatchAddRMB'"],
  ["+'DeleteUser'", "+'deleteUser'"], ["+'GetLinkUserList'", "+'getLinkUserList'"],
  ["+'NewWebApiToken'", "+'newWebApiToken'"], ["+'SetTokenOutTime'", "+'setTokenOutTime'"],
  ["+'DeleteLogout'", "+'deleteLogout'"], ["+'GetAppIdNameList'", "+'getAppIdNameList'"],
  ["+'GetAllUserApi'", "+'getAllUserApi'"], ["+'GetAllWebApi'", "+'getAllWebApi'"],
  ["+'GetAppIdMax'", "+'getAppIdMax'"], ["+'SetAppSort'", "+'setAppSort'"],
  ["+'SetBatchAddVipTime'", "+'setBatchAddVipTime'"],
  ["+'SetBatchAddVipNumber'", "+'setBatchAddVipNumber'"],
  ["+'SetBatchSetUserConfig'", "+'setBatchSetUserConfig'"],
  ["+'SetBatchUserClass'", "+'setBatchUserClass'"],
  ["+'SetBatchAllUserVipTime'", "+'setBatchAllUserVipTime'"],
  ["+'BatchSetAppUserKey'", "+'batchSetAppUserKey'"],
  ["+'BatchSetAppUserNote'", "+'batchSetAppUserNote'"],
  ["+'GetKaTemplate'", "+'getKaTemplate'"], ["+'SetKaTemplate'", "+'setKaTemplate'"],
  ["+'SetAdminNote'", "+'setAdminNote'"], ["+'Recover'", "+'recover'"],
  ["+'GetAgentUserList'", "+'getAgentUserList'"],
  ["+'GetAgentUserInfo'", "+'getAgentUserInfo'"],
  ["+'SaveAgentUser'", "+'saveAgentUser'"], ["+'NewAgentUser'", "+'newAgentUser'"],
  ["+'SetAgentUserStatus'", "+'setAgentUserStatus'"],
  ["+'GetAgentKaClassAuthority'", "+'getAgentKaClassAuthority'"],
  ["+'SetAgentKaClassAuthority'", "+'setAgentKaClassAuthority'"],
  ["+'DeleteAgentUser'", "+'deleteAgentUser'"],
  ["+'GetKaSalesStatistics'", "+'getKaSalesStatistics'"],
  ["+'SetSort'", "+'setSort'"],
  ["+'GetAgentTreeAndKaClassTree'", "+'getAgentTreeAndKaClassTree'"],
  ["+'Withdraw'", "+'withdraw'"], ["+'SetUserConfig'", "+'setUserConfig'"],
  ["+'GetPublicAppList'", "+'getPublicAppList'"], ["+'TestRunJs'", "+'testRunJs'"],
  ["+'DeleteTaskQueueTid'", "+'deleteTaskQueueTid'"],
  ["+'UuidAddQueue'", "+'uuidAddQueue'"],
  ["+'BatchUuidAddQueue'", "+'batchUuidAddQueue'"],
  ["+'GetInfoSystem'", "+'getInfoSystem'"],
  ["+'GenerateAPIEncryptedSDK'", "+'generateAPIEncryptedSDK'"],
  ["+'SaveInfoSystem'", "+'saveInfoSystem'"], ["+'GetInfoPay'", "+'getInfoPay'"],
  ["+'SaveInfoPay'", "+'saveInfoPay'"], ["+'GetInfoSMS'", "+'getInfoSMS'"],
  ["+'SaveInfoSMS'", "+'saveInfoSMS'"], ["+'TestSendSMS'", "+'testSendSMS'"],
  ["+'GetInfoCaptcha2'", "+'getInfoCaptcha2'"],
  ["+'SaveInfoCaptcha2'", "+'saveInfoCaptcha2'"],
  ["+'SaveInfoCloudStorage'", "+'saveInfoCloudStorage'"],
  ["+'GetInfoCloudStorage'", "+'getInfoCloudStorage'"],
  ["+'SaveUserMsgConfig'", "+'saveUserMsgConfig'"],
  ["+'GetUserMsgConfig'", "+'getUserMsgConfig'"],
  ["+'GetInfoAiConfig'", "+'getInfoAiConfig'"],
  ["+'SaveInfoAiConfig'", "+'saveInfoAiConfig'"],
  ["+'SetPayOrderNote'", "+'setPayOrderNote'"], ["+'Out'", "+'out'"],
  ["+'GetIdNameList'", "+'getIdNameList'"], ["+'SetIsRead'", "+'setIsRead'"],
  ["+'DeleteDuplicateMsg'", "+'deleteDuplicateMsg'"],
  ["+'StopSystem'", "+'stopSystem'"],
  ["+'ChartLinksUser'", "+'chartLinksUser'"],
  ["+'ChartLinksUserIPCity'", "+'chartLinksUserIPCity'"],
  ["+'ChartLinksUserLoginTime'", "+'chartLinksUserLoginTime'"],
  ["+'ChartEveryHourLinksCount'", "+'chartEveryHourLinksCount'"],
  ["+'ChartAppUserClass'", "+'chartAppUserClass'"],
  ["+'ChartUser'", "+'chartUser'"], ["+'ChartRMBAddSub'", "+'chartRMBAddSub'"],
  ["+'ChartVipNumberAddSub'", "+'chartVipNumberAddSub'"],
  ["+'ChartAppUser'", "+'chartAppUser'"], ["+'ChartAppKa'", "+'chartAppKa'"],
  ["+'ChartAppKaClass'", "+'chartAppKaClass'"],
  ["+'ChartKaRegister'", "+'chartKaRegister'"],
  ["+'ChartAppUserRegister'", "+'chartAppUserRegister'"],
  ["+'ChartAgentLevel'", "+'chartAgentLevel'"],
  ["+'ChartTidTaskData'", "+'chartTidTaskData'"],
  ["+'GetCaptchaApiList'", "+'getCaptchaApiList'"],
  ["+'GetCaptcha'", "+'getCaptcha'"], ["+'GetSmsCaptcha'", "+'getSmsCaptcha'"],
  ["+'SetPassword'", "+'setPassword'"], ["+'Register'", "+'register'"],
  ["+'Login'", "+'login'"], ["+'GetIsBuyKaList'", "+'getIsBuyKaList'"],
  ["+'GetPurchasedKaList'", "+'getPurchasedKaList'"],
  ["+'GetPayStatus'", "+'getPayStatus'"], ["+'Updater'", "+'updater'"],
  ["+'PayMoneyToKa'", "+'payMoneyToKa'"], ["+'UseKa'", "+'useKa'"],
  ["+'GetPayPC'", "+'getPayPC'"], ["+'SetVipLimit'", "+'setVipLimit'"],
];

let count = 0;
const files = fs.readdirSync(apiDir);
for (const file of files) {
  if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
  const filePath = path.join(apiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  for (const [old, rep] of replacements) {
    content = content.split(old).join(rep);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', file);
    count++;
  }
}
console.log('Done! Updated', count, 'files.');
