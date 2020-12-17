import oRequest  from 'request';
import {cacheDta} from '../constants.js';
import {writeMessage} from '../logs/manager.js';
import {getCookie}  from '../controller/common.js';

const runCycle = 3600 * 1000;

const Mapping = {
    279640000:	'001',
    279640001:	'002',
    279640002:	'003',
    279640003:	'Z09',
    279640004:	'004',
    279640005:	'005',
    279640006:	'006',
    279640008:	'Z01',
    279640007:	'Z02',
    279640010:	'Z03',
    279640009:	'Z07',
    279640011:	'Z08'
}

const Mapping1 = {
    279640000:'101',
    279640001:'111',
    279640002:'121',
    279640003:'131',
    279640004:'141'
}


const Mapping2 = {
    279640000:'101',
    279640001:'111',
    279640002:'121',
    279640003:'131',
    279640004:'141',
    279640005:'151',
    279640006:'171',
    279640007:'181',

}

let startDate = '2019-01-01T00:00:00Z';
let lastStart = '';

const writeBack = async (data, dataBack) => {
    let options = {};
    options.json = true;
    options.url = cacheDta.host + 'opportunities(' + data.opportunityid + ')';
    options.headers = { 
        "Content-Type": "application/json", 
        "Cookie": cacheDta.TWMI_COOKIE,
    };
    options.method = 'PATCH';

    options.body = {       
        "new_teco_confidence": dataBack.Confidence_KUTText,
        "new_teco_crmopportunity_id": dataBack.ID,
        "new_teco_opportunity_type": dataBack.OpportunityType_KUTText,
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
            if(oldData.value[i].new_opportunity === newData[j].TACTWMIOpportunityID_KUT) {
                find = newData[j];
                break;
            }
        }

        if (find) {
            allReq.push(writeBack(oldData, find));
        } else {
            msg = msg + `WARNING: CRM: null <====> TWMI: ${oldData.value[i].new_opportunity} 同步失败！\n`;
        }
          
    }

    let ares = await Promise.all(allReq);

    for(let k = 0; k < ares.length;  k++) {
        if(ares[k].code === 0) {
            msg = msg + `CRM: ${ares[k].dataBack.ID} <====> TWMI: ${ares[k].dataBack.TACTWMIOpportunityID_KUT} 同步成功！时间：${ares[k].dataBack.LastChangeDateTime}\n`;
        }else {
            msg = msg + `CRM: ${ares[k].dataBack.ID} <====> TWMI: ${ares[k].dataBack.TACTWMIOpportunityID_KUT} 同步成功，回写TWMI失败！\n`;
        }
        
    }

    writeMessage(time + '.log', msg)
}

const sync = async (data, repeat) => {
    let oldData = data;
    let options = {};
    options.json = true;
    options.url = cacheDta.cpihost;
    options.headers = { 
        "Content-Type": "application/json", 
        'Authorization': 'Basic UzAwMTg1ODI1NTk6SXR0czEyMzRANQ=='
        // "Connection":"keep-alive"
    };
    options.method = 'POST';
    options.body = data;

    options.body.value = options.body.value.map(item => {
        item.name = item.name.replace(/[&, @,#,$,%,^,*]/g, " ").substr(0,99);
        item.createdon = item.createdon || new Date().toISOString();
        item.estimatedvalue = item.estimatedvalue || 0.00;
        item.statuscode = item.statuscode || 1;
        item.new_teco_confidence = Mapping2[item.new_teco_confidence] || '';
        item.new_teco_opportunity_type = Mapping1[item.new_teco_opportunity_type] || '';
        item.new_teco_sales_phase = Mapping[item.new_teco_sales_phase] || '';

        return item;
    })
    // console.log(options)

    return await new Promise(resolve => {
        oRequest(options, async (error, response, data) => {
    
            if(error){
              console.log(error);

              let newRes = {OpportunityCollection: {Opportunity: []}};

            //   //错误重发
            //   if(!repeat) {
            //     newRes = await new Promise(resolve => {
            //         setTimeout(async () => {
            //            let res =  await sync(oldData, true);
            //            resolve(res);
            //         }, 2000)
            
            //     }) 
            //   }

              resolve(newRes);
              return;
            }
            // console.log(data)
            if(data && data.OpportunityCollection && data.OpportunityCollection.Opportunity){
                resolve(data);     
            }else {
                console.log(data);
                resolve({OpportunityCollection: {Opportunity: []}});
            }
                 
        })
    })
}

const execute = async (url, time, runFlag) => {

    if(runFlag !== cacheDta.runFlag) {
        // console.log("新的同步已运行，终止旧操作！");
        writeMessage('system.log', `\n\nWORNING: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----新的同步已运行，终止旧操作！\n*****************************`)
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
            writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行停止！\n*****************************`);
            nextCycle(time,runFlag)
            // console.log("运行停止，cookie失效！");
            return;
          }

          if(response.statusCode === 401) {
            writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行暂停，cookie失效！\n*****************************`)
            let Cookie = await getCookie();
            if(Cookie) {
                cacheDta.TWMI_COOKIE = Cookie
                writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie，同步继续！\n*****************************`)
                execute(url, time, runFlag);
                return;
            }
            writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie失败，同步终止！\n*****************************`)
            return;
          }

          if(!data || !data.value) {
            nextCycle(time,runFlag)
            return;
          }

          lastStart = data.value.length > 0 ? data.value[data.value.length - 1].createdon : '';

          let nextUrl = data['@odata.nextLink'];
          let crmRes = await sync(data);

        //   console.log(data);
          await handleReAsync(data, crmRes.OpportunityCollection.Opportunity, time);

          if(nextUrl) {
            console.log("*************request end*****************")
            execute(nextUrl, time, runFlag);
          } else {
            nextCycle(time,runFlag)
            //   writeMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
            //   setTimeout(() => {
            //     execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
            //   }, 2 * 3600 * 1000)
          }
         
        })
    }else {

        options.url = `${cacheDta.host}opportunities?$select=new_teco_confidence,new_teco_opportunity_type,new_teco_sales_phase,new_opportunity,_customerid_value,name,opportunityid,createdon,statuscode,estimatedclosedate,estimatedvalue&$expand=parentaccountid($select=new_uniqueid,name,accountid,statuscode),owninguser($select=fullname)&$filter=createdon gt ${startDate}&$orderby=createdon asc`;
        oRequest(options, async (error, response, data) => {
            if(error){
                console.log(error)
                writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行停止！\n*****************************`);
                nextCycle(time,runFlag)
                // console.log("运行停止，cookie失效！")
                return;
            }

            if(response.statusCode === 401) {
                writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行暂停，cookie失效！\n*****************************`)
                let Cookie = await getCookie();
                if(Cookie) {
                    cacheDta.TWMI_COOKIE = Cookie
                    writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie，同步继续！\n*****************************`)
                    execute(null, time, runFlag);
                    return;
                }
                writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----重新获取cookie失败，同步终止！\n*****************************`)
                return;
            }

            if(!data || !data.value) {
                nextCycle(time,runFlag)
                return;
            }

            lastStart = data.value.length > 0 ? data.value[data.value.length - 1].createdon : '';

            let nextUrl = data['@odata.nextLink'];
            let crmRes = await sync(data);

        //   console.log(crmRes);
            await handleReAsync(data, crmRes.OpportunityCollection.Opportunity, time);

            if(nextUrl) {
                console.log("*************request end*****************")
                execute(nextUrl, time, runFlag);
            } else {
                nextCycle(time,runFlag)
                // writeMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
                // setTimeout(() => {
                //     execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
                // }, 2 * 3600 * 1000)
            }
        })
    }
}

const nextCycle = (time, runFlag) => {
    writeMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
    if(lastStart) {
        startDate = lastStart;
        lastStart = '';
        execute(null, time, runFlag);
        return;
    }

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