import oRequest  from 'request';

export const  htmlDecode = (a) => {
    a = "" + a;
    return a.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

export const generateUUid = () => {
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var chars = CHARS,
        uuid = new Array(36),
        rnd = 0,
        r;
    for (var i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        } else if (i == 14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('').replace(/-/g, "");
}

export const getCookie = async () => {
    return new Promise(resolve => {
        let uuid = generateUUid();

        let wct = encodeURIComponent(new Date(Date.now() + 3600 * 8000).toISOString())
        let url = `https://sts.tecowestinghouse.ca/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2fauth.crm.tecowestinghouse.ca%3a444%2f&wctx=rm%3d1%26id%3d${uuid}%26ru%3dhttps%253a%252f%252fauth.crm.tecowestinghouse.ca%253a444%252fdefault.aspx&wct=${wct}&wauth=urn%3aoasis%3anames%3atc%3aSAML%3a1.0%3aam%3apassword`;
        let options = {};
        options.url = url,
        options.headers = { "Content-Type": "application/x-www-form-urlencoded"};
        options.method = 'POST';
        options.form = {
          'UserName': 'kwattnick@tecowestinghouse.ca',
          'Password': '#Tec0Crm*19-8',
          'AuthMethod': 'FormsAuthentication'
        }
  
        oRequest(options, async (error, response, data) => {
    
          if(error || response.statusCode === 401){
            console.log(error)
            return;
          }
          
          console.log(response.statusCode)
          console.log(response.headers['set-cookie'])
  
  
          
          let url1 = `https://sts.tecowestinghouse.ca/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2ftwmi.crm.tecowestinghouse.ca%3a444%2f&wctx=rm%3d1%26id%3d${uuid}%26ru%3dhttps%253a%252f%252ftwmi.crm.tecowestinghouse.ca%253a444%252fdefault.aspx&wct=${wct}&wauth=urn%3aoasis%3anames%3atc%3aSAML%3a1.0%3aam%3apassword`;
          let options1 = {};
          let authCookies = (response.headers['set-cookie'] || []).filter(item => item.indexOf("MSISAuth=") > -1)[0];
          options1.url = url1;
          options1.headers = { "Content-Type": "application/x-www-form-urlencoded", Cookie: authCookies.split(';')[0]};
          options1.method = 'GET';
  
          oRequest(options1, async (error, response, data) => {
    
                if(error || response.statusCode === 401){
                    console.log(error)
                    return;
                }
                // console.log(response.headers['set-cookie'][0].split(';')[0])
                // console.log(data)
                console.log(response.statusCode)
                console.log(response.headers['set-cookie'])

                let wresult = data && data.split('name="wresult" value="')[1] ? data.split('name="wresult" value="')[1].split('" /><')[0] : "";
                console.log(wresult)

                let url1 = `https://auth.crm.tecowestinghouse.ca:444`;
                let options2 = {};
                options2.url = url1,
                options2.headers = { "Content-Type": "application/x-www-form-urlencoded"};
                options2.method = 'POST';
                options2.form = {
                    'wa': 'wsignin1.0',
                    'wresult': htmlDecode(wresult),
                    'wctx': `rm=1&id=${uuid}&ru=https%3a%2f%2ftwmi.crm.tecowestinghouse.ca%3a444%2fdefault.aspx`
                }
        
                oRequest(options2, async (error, response, data) => {
            
                    if(error || response.statusCode === 401){
                        console.log(error)
                        resolve("")
                        return;
                    }
                    // console.log(response.headers['set-cookie'][0].split(';')[0])
                    console.log(response.statusCode)
                    console.log(response.headers['set-cookie'])
                    let cookies = (response.headers['set-cookie'] || []).filter(item => item.indexOf("MSISAuth") === 0);
                    let sCookie = 'ReqClientId=e6a964df-a06d-490d-80fa-7b11216257e4; ';
                    let tmpCookie = ''
                    if (cookies.length > 0) {
                        for(let i = cookies.length -1; i > 0; i--) {
                            let str  = "MSISAuth" + i + "=";
                            tmpCookie = cookies.filter(item => item.indexOf(str) === 0)[0].split(';')[0].replace(str, "") + tmpCookie;
                        }

                        tmpCookie = cookies.filter(item => item.indexOf('MSISAuth=') === 0)[0].split(';')[0] + tmpCookie;
                        sCookie = sCookie + tmpCookie;
                        resolve(sCookie);
                        return;
                    }
                    
                    resolve("");
                })  
        
  
          // res.status(200).send(response.headers['set-cookie']);
        }) 
    })


    })
}