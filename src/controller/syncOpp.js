import oRequest  from 'request';
import {cacheDta} from '../constants.js';
import {writeMessage} from '../logs/manager.js';

const handleReAsync = async (oldData, newData, time) => {
    let msg = "";
    for(let i = 0; i < oldData.value.length; i++) {
        let find = null;
        for(let j = 0; j < newData.length; j++) {
            if(oldData.value[i].new_opportunity === newData[j].TACTWMIOpportunityID_KUT) {
                find = newData[j];
                break;
            }
        }

        if (find) {
            msg = msg + `CRM: ${find.ID} <====> TWMI: ${find.TACTWMIOpportunityID_KUT}\n`;
        } else {
            msg = msg + `WARNING: CRM: null <====> TWMI: ${oldData.value[i].new_opportunity} 同步失败！\n`;
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
        item.name = item.name.replace(/[&, @,#,$,%,^,*]/g, "");

        return item;
    })
    // console.log(options)

    return await new Promise(resolve => {
        oRequest(options, async (error, response, data) => {
    
            if(error){
              console.log(error);

              let newRes = {OpportunityCollection: {Opportunity: []}};

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
            if(data.OpportunityCollection && data.OpportunityCollection.Opportunity){
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
    
          if(error || response.statusCode === 401){
            console.log(error);
            writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行停止，cookie失效！\n*****************************`)
            // console.log("运行停止，cookie失效！");
            return;
          }

          let nextUrl = data['@odata.nextLink'];
          let crmRes = await sync(data);

        //   console.log(data);
          handleReAsync(data, crmRes.OpportunityCollection.Opportunity, time);

          if(nextUrl) {
            console.log("*************request end*****************")
            execute(nextUrl, time, runFlag);
          } else {
              writeMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
              setTimeout(() => {
                execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
              }, 2 * 3600 * 1000)
          }
         
        })
    }else {

        options.url = `${cacheDta.host}opportunities?$select=new_opportunity,name,opportunityid,createdon,statuscode,estimatedclosedate,estimatedvalue&$expand=parentaccountid($select=new_uniqueid,name,accountid,statuscode),owninguser($select=fullname)&$filter=createdon ge 2020-09-24T00:00:00Z&$orderby=createdon asc`;
        oRequest(options, async (error, response, data) => {
            if(error || response.statusCode === 401){
                console.log(error)
                writeMessage('system.log', `\n\nERROR: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----运行停止，cookie失效！\n*****************************`)
                // console.log("运行停止，cookie失效！")
                return;
              }
    
              let nextUrl = data['@odata.nextLink'];
              let crmRes = await sync(data);

            //   console.log(crmRes);
              handleReAsync(data, crmRes.OpportunityCollection.Opportunity, time);

              if(nextUrl) {
                console.log("*************request end*****************")
                execute(nextUrl, time, runFlag);
              } else {
                writeMessage('system.log', `\n\nINFO: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----等待下一轮执行！\n*****************************`)
                setTimeout(() => {
                    execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
                }, 2 * 3600 * 1000)
              }
        })
    }
}

const start = async (runFlag) => {
    execute(null, new Date(Date.now() + 8 * 3600 * 1000).toISOString().substr(0, 16).replace(":", ""), runFlag);
}

export default {
    start
}