import {cacheDta} from '../constants.js';
import Starter from '../controller/starter.js';
import {writeAccMessage} from '../logs/manager.js';
import {getCookie}  from '../controller/common.js';

import fs from 'fs';

const setResponseHeader = (res)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type,language, authToken");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
}

const autoStart = async () => {
    // let cookie = fs.readFileSync(process.cwd()+'\\src\\cookieFile.txt','utf-8');
    let cookie = await getCookie();
    cacheDta.TWMI_COOKIE = cookie ? cookie : "";
    let canConnect = await Starter.testConnect();

    if(canConnect) {
        cacheDta.runFlagAcc = Date.now();
        Starter.startAcc(cacheDta.runFlagAcc);
        writeAccMessage('system.log', `\n\nSUCCESS: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----自动重启运行成功，开始同步！\n*****************************`)
    }else {
        writeAccMessage('system.log', `\n\nWARNING: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----自动重启运行失败，cookie过期！\n*****************************`)
    }
    return canConnect;
}

const route = (app)=>{

  autoStart();

  app.all('*', function(req, res, next) {
    setResponseHeader(res);
    if(req.method.toLocaleLowerCase() === 'options'){
      res.status(204);
      res.send({});   //直接返回空数据，结束此次请求
    }else{
      next();
    }

  });


  app.route("/api/refresh").post(async (req,res)=>{
    cacheDta.TWMI_COOKIE = req.body ? req.body.cookie : "";

    let canConnect = await Starter.testConnect();

    if(canConnect) {

        fs.writeFile(process.cwd()+'\\src\\cookieFile.txt', cacheDta.TWMI_COOKIE, (err) => {
            console.log(err)
        });

        cacheDta.runFlagAcc = Date.now();

        Starter.startAcc(cacheDta.runFlagAcc );
        writeAccMessage('system.log', `\n\nSUCCESS: ${new Date(Date.now() + 8000 * 3600).toISOString()}-----同步程序已启动！\n*****************************`)
        res.status(200).send({code: 0, msg:"同步程序已启动！"});
    }else {
        res.status(200).send({code: 1, msg:"连接失败，请重新获取cookie！"});
    }
  })

  app.route("/api/restart").post(async (req,res)=>{
        let suc = await autoStart();
        if(suc) {
            res.status(200).send({code: 0, msg:"同步程序已成功重启！"});
        }else {
            res.status(200).send({code: 1, msg:"同步程序启动失败！"});
        }
  })

  app.route("/log").get(async (req,res)=>{
    let files = fs.readdirSync(process.cwd()+'\\acclog\\');

    let sRes = `<!DOCTYPE html>
    <html lang="zh-cn">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="origin" />
    </head>
    <body class="has-navbar">
    <div style="width: 100%;  flex-wrap: wrap; display: flex;">
    ${files.map(name => {
        return "<a style='margin: 10px;' href=/download/log?file=" + name +" target='_blank'>"+ name +"</a>"
    })}
    </div>
    </body>
    </html>
    `
    res.header("Content-Type", "text/html;charset=utf-8");
    res.send(sRes)
  })

  app.route("/download/log").get(async (req, res) => {
      let fileName =  req.query.file;
      let realPath = process.cwd()+'\\acclog\\' + fileName;
      res.download(realPath, fileName, (err)=> {
        if (err) {
            logger.error(err);
            res.status(404).end();
        }

    });
  })


  app.route('/test').get((req,res) => {
      getCookie().then(cookie => {
        res.status(200).send(cookie)
      })
  })
}
module.exports = route;
