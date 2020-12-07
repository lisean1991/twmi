import oRequest  from 'request';
import {cacheDta} from '../constants.js';

import SyncOpp from './syncOpp.js';

import SyncAcc from './syncAcc.js';

const testConnect = async () => {
    return new Promise((resolve,reject)=>{
        let options = {};
        options.url = cacheDta.host,
        options.json = true;
        options.headers = { "Content-Type": "application/json", "Cookie": cacheDta.TWMI_COOKIE};
        options.method = 'GET';

        oRequest(options, async (error, response, data) => {
    
          if(error || response.statusCode === 401){
            console.log(error)
            resolve(false);
            return;
          }
        //   console.log(data)
        //   console.log(cacheDta.TWMI_COOKIE)
          resolve(true);
        })
    })
}

const start = async (runFlag) => {
    SyncOpp.start(runFlag);
}

const startAcc = async (runFlag) => {
    SyncAcc.start(runFlag);
}


export default {
    testConnect,
    start,
    startAcc
}