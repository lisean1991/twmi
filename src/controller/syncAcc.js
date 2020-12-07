import oRequest  from 'request';
import {cacheDta} from '../constants.js';
import {writeAccMessage} from '../logs/manager.js';
import {getCookie}  from '../controller/common.js';

const runCycle = 3600 * 2000;


const writeBack = async (data, dataBack) => {
    let options = {};
    options.json = true;
    options.url = cacheDta.host + 'opportunities(' + data.CorporateAccountid + ')';
    options.headers = { 
        "Content-Type": "application/json", 
        "Cookie": cacheDta.TWMI_COOKIE,
    };
    options.method = 'PATCH';

    options.body = {       
        "new_teco_confidence": dataBack.Confidence_KUTText,
        "new_teco_crmCorporateAccount_id": dataBack.ID,
        "new_teco_CorporateAccount_type": dataBack.CorporateAccountType_KUTText,
        "new_teco_sales_phase": dataBack.SalesCyclePhaseCodeText
    }

    return {
        data, 
        dataBack,
        code: 0
    };

    return await new Promise(resolve => {
        oRequest(options, async (error, response, data) => {
    
            if(error) {
                resolve({
                    data, 
                    dataBack,
                    code: 1
                });
                return;
            }

            if(response.statusCode >= 200 && response.statusCode < 300) {
                resolve({
                    data, 
                    dataBack,
                    code: 0
                });
                return;
            }

            resolve({
                data, 
                dataBack,
                code: 1
            });
        })
    })
}

const handleReAsync = async (oldData, newData, time) => {
    let msg = "";

    let allReq = [];
    for(let i = 0; i < oldData.value.length; i++) {
        let find = null;
        for(let j = 0; j < newData.length; j++) {
            if(oldData.value[i].new_uniqueid === newData[j].TACTWMIAccountID_KUT) {
                find = newData[j];
                break;
            }
        }

        if (find) {
            allReq.push(writeBack(oldData, find));
        } else {
            msg = msg + `WARNING: Account Indo------CRM: null <====> TWMI: ${oldData.value[i].new_CorporateAccount} 同步失败！\n`;
        }
          
    }

    let ares = await Promise.all(allReq);

    for(let k = 0; k < ares.length;  k++) {
        if(ares[k].code === 0) {
            msg = msg + `Account Indo------CRM: ${ares[k].dataBack.AccountID} <====> TWMI: ${ares[k].dataBack.TACTWMIAccountID_KUT}同步成功！\n`;
        }else {
            msg = msg + `Account Indo------CRM: ${ares[k].dataBack.AccountID} <====> TWMI: ${ares[k].dataBack.TACTWMIAccountID_KUT}同步成功，回写TWMI失败！\n`;
        }
        
    }

    writeAccMessage(time + '.log', msg)
}

const sync = async (data, repeat) => {
    let oldData = data;
    let options = {};
    options.json = true;
    options.url = cacheDta.cpiAcchost;
    options.headers = { 
        "Content-Type": "application/json", 
        'Authorization': 'Basic UzAwMTg1ODI1NTk6SXR0czEyMzRANQ=='
        // "Connection":"keep-alive"
    };
    options.method = 'POST';
    options.body = data;

    options.body.value = options.body.value.map(item => {
        item.name = item.name.replace(/[&, @,#,$,%,^,*]/g, "");
        item.createdon = item.createdon || new Date().toISOString();

        return item;
    })
    // console.log(options)

    return await new Promise(resolve => {
        oRequest(options, async (error, response, data) => {
    
            if(error){
              console.log(error);

              let newRes = {CorporateAccountCollection: {CorporateAccount: []}};

              //错误重发
              if(!repeat) {
                newRes = await new Promise(resolve => {
                    setTimeout(async () => {
                       let res =  await sync(oldData, true);
                       resolve(res);
                    }, 2000)
            
                }) 
              }

              resolve(newRes);
              return;
            }
            // console.log(data)
            if(data && data.CorporateAccountCollection && data.CorporateAccountCollection.CorporateAccount){
                resolve(data);     
            }else {
                console.log(data);
                resolve({CorporateAccountCollection: {CorporateAccount: []}});
            }
                 
        })
    })
}

const execute = async (url, time, runFlag) => {

    if(runFlag !== cacheDta.runFlagAcc) {
        // console.log("新的同步已运行，终止旧操作！");
        writeAccMessage('system.log', `\n\nWORNING: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----新的同步已运行，终止旧操作！\n*****************************`)
        return;
    }

    console.log("*************start*****************")
    let options = {};
    options.json = true;
    options.headers = { 
        "Content-Type": "application/json", 
        "Cookie": cacheDta.TWMI_COOKIE, 
        // "Connection":"keep-alive",
        "Prefer": "odata.maxpagesize=50"
    };
    options.method = 'GET';

    if(url) {
        options.url = url;
        oRequest(options, async (error, response, data) => {
    
          if(error){
            console.log(error);
            writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行停止！\n*****************************`)
            // console.log("运行停止，cookie失效！");
            return;
          }

          if(response.statusCode === 401) {
            writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行暂停，cookie失效！\n*****************************`)
            let Cookie = await getCookie();
            if(Cookie) {
                cacheDta.TWMI_COOKIE = Cookie
                writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie，同步继续！\n*****************************`)
                execute(url, time, runFlag);
                return;
            }
            writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie失败，同步终止！\n*****************************`)
            return;
          }

          if(!data && !data.value) {
            nextCycle(runFlag);
            return;
          }

          let nextUrl = data['@odata.nextLink'];
          let crmRes = await sync(data);

        //   console.log(data);
          await handleReAsync(data, crmRes.CorporateAccountCollection.CorporateAccount, time);

          if(nextUrl) {
            console.log("*************request end*****************")
            execute(nextUrl, time, runFlag);
          } else {
            nextCycle(runFlag)
            //   writeAccMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
            //   setTimeout(() => {
            //     execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
            //   }, 2 * 3600 * 1000)
          }
         
        })
    }else {

        options.url = `${cacheDta.host}accounts?$select=new_uniqueid,name,accountid,createdon&$orderby=createdon asc`;
        oRequest(options, async (error, response, data) => {
            if(error){
                console.log(error)
                writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行停止！\n*****************************`)
                // console.log("运行停止，cookie失效！")
                return;
            }

            if(response.statusCode === 401) {
                writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行暂停，cookie失效！\n*****************************`)
                let Cookie = await getCookie();
                if(Cookie) {
                    cacheDta.TWMI_COOKIE = Cookie
                    writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie，同步继续！\n*****************************`)
                    execute(null, time, runFlag);
                    return;
                }
                writeAccMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie失败，同步终止！\n*****************************`)
                return;
            }

            if(!data && !data.value) {
                nextCycle(runFlag);
                return;
            }

            let nextUrl = data['@odata.nextLink'];
            let crmRes = await sync(data);

        //   console.log(crmRes);
            await handleReAsync(data, crmRes.CorporateAccountCollection.CorporateAccount, time);

            if(nextUrl) {
                console.log("*************request end*****************")
                execute(nextUrl, time, runFlag);
            } else {
                nextCycle(runFlag)
                // writeAccMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
                // setTimeout(() => {
                //     execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
                // }, 2 * 3600 * 1000)
            }
        })
    }
}

const nextCycle = (runFlag) => {
    writeAccMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
    setTimeout(() => {
        execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
    }, runCycle)
}

const start = async (runFlag) => {
    execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
}

export default {
    start
}