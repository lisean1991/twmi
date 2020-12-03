import oRequest  from 'request';

export const getCookie = async () => {
    return new Promise(resolve => {


        let wct = encodeURIComponent(new Date(Date.now() + 3600 * 8000).toISOString())
        let url = `https://sts.tecowestinghouse.ca/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2fauth.crm.tecowestinghouse.ca%3a444%2f&wctx=rm%3d1%26id%3d1a19e9c6-97f7-44be-bb75-4b826788889f%26ru%3dhttps%253a%252f%252fauth.crm.tecowestinghouse.ca%253a444%252fdefault.aspx&wct=${wct}&wauth=urn%3aoasis%3anames%3atc%3aSAML%3a1.0%3aam%3apassword`;
        let options = {};
        options.url = url,
        options.headers = { "Content-Type": "application/x-www-form-urlencoded"};
        options.method = 'POST';
        options.form = {
          'UserName': 'kwattnick@tecowestinghouse.ca',
          'Password': 'Tecopass.2016',
          'AuthMethod': 'FormsAuthentication'
        }
  
        oRequest(options, async (error, response, data) => {
    
          if(error || response.statusCode === 401){
            console.log(error)
            return;
          }
          
          console.log(response.statusCode)
          console.log(response.headers['set-cookie'])
  
  
          
          let url1 = `https://sts.tecowestinghouse.ca/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2ftwmi.crm.tecowestinghouse.ca%3a444%2f&wctx=rm%3d1%26id%3d1956a608-2bf4-4a44-b363-780e50344cc8%26ru%3dhttps%253a%252f%252ftwmi.crm.tecowestinghouse.ca%253a444%252fdefault.aspx&wct=${wct}&wauth=urn%3aoasis%3anames%3atc%3aSAML%3a1.0%3aam%3apassword`;
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
                console.log(response.statusCode)
                console.log(response.headers['set-cookie'])

                let url1 = `https://auth.crm.tecowestinghouse.ca:444`;
                let options2 = {};
                options2.url = url1,
                options2.headers = { "Content-Type": "application/x-www-form-urlencoded"};
                options2.method = 'POST';
                options2.form = {
                    'wa': 'wsignin1.0',
                    'wresult': '<t:RequestSecurityTokenResponse xmlns:t="http://schemas.xmlsoap.org/ws/2005/02/trust"><t:Lifetime><wsu:Created xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">2020-12-03T07:30:44.357Z</wsu:Created><wsu:Expires xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">2020-12-03T19:30:44.357Z</wsu:Expires></t:Lifetime><wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy"><wsa:EndpointReference xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Address>https://twmi.crm.tecowestinghouse.ca:444/</wsa:Address></wsa:EndpointReference></wsp:AppliesTo><t:RequestedSecurityToken><xenc:EncryptedData Type="http://www.w3.org/2001/04/xmlenc#Element" xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"><xenc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc" /><KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#"><e:EncryptedKey xmlns:e="http://www.w3.org/2001/04/xmlenc#"><e:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" /></e:EncryptionMethod><KeyInfo><o:SecurityTokenReference xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><X509Data><X509IssuerSerial><X509IssuerName>CN=Go Daddy Secure Certificate Authority - G2, OU=http://certs.godaddy.com/repository/, O="GoDaddy.com, Inc.", L=Scottsdale, S=Arizona, C=US</X509IssuerName><X509SerialNumber>15430269584781315172</X509SerialNumber></X509IssuerSerial></X509Data></o:SecurityTokenReference></KeyInfo><e:CipherData><e:CipherValue>j8TThyljPoPjYodwXzv9hzlZlJjReJu2GcgJjSeeg+yXjueuixB4M5GHTNNcOssqe5uCrT/XalODU91Jc/x2hhpj1zjPNhrzGW3JpCKieEE0R2RCy4qMmkKBE9tZTVALDIeuMirBM+YlHiXT3XfHE9l3873CoAzRTVxpr2S66pNPByrutsjpeMQXqXZ5vCzGJTR/HbhXFSEKdiikMEHPMwIRw5CLp6CA8dEZuYH0Qqsb35jNawhq2CMXje3QPXmTj8CTw01acZ8Ayrm0VuO4VkR5wlg8dzqOb8TLEy4LeUmPBUXGa2BS/nLT43JyEYkyVJlFAuVJ5eIvbKV/qmL7pQ==</e:CipherValue></e:CipherData></e:EncryptedKey></KeyInfo><xenc:CipherData><xenc:CipherValue>4lcCz3M0oZD9b2Ls5rh9EcvuvgOdi5dPDqdoGbzz31cqbMlR7djpY2wkyDiS51/pXeRaPS7gu5DNKDbP9tAhmMNYdjdCAQuPyRd6uXPvSRX+9X4G6eTH2wJuw0xIau2LHC82FAB98kDSen+linscbC5rjQR99eLc/+AWga9UcPla5DXpM++GmHYGt2R2yup/U3DdStt+vfhwe+plx5js52ajE1VwTIW8hIoJ8gyNZCn4TaEk5fEX41A3vQSzvXXkxO6Hw7duzdXRUC0zGMSjtBZoZhDReEikpvv8VQWvHDohgM5uKaWRX4oeSsJagfyMbYEhiLlk89+QyUNgUNg78AQFN7eOoSOw8zUhaASL1xa6hfDQh5MVdodQfLjQ37c9QY/Dhdg6qwVJPa0hnyN3S4o2YuLfh8rF85+SSem4t7DKp0wmjAAXDuAIk0ON7Mp0Jc8BXVCfkbJicaOQL7YbfjjgBmMpaabtbEkbRurfefvbSaCPuYl5TzrdvFhVZnxGIW6bG0EpeA2Pj97b+cQLqMNO5OpJIMpt0tDSzRto2sVPa7iZSclzo/EBX147UHDCVr4ErTkAZM4WhTfrjUcSCS4FyTKUBgm93N4jQMlU3nOO6qNEdedCAL1/AR1J0M/ZlFBjRcTDQ34oLotcDzvyv8fDtC65i7iDt/JO6G0dgOsirj1e38eDYdHvCr6L5Dod5tgQPju61aeeBnPKZAVj5ACkgD61DcLVFMZ7RijufIf7BkrFh0hYPUCpmetiSbwaOq9EEYu3n/KSnxJWj3iEyoFDJlcvG6C224qWTI7pTpOpWIb3IJCwJkKzwWSHc56JTcmhmPy29CWotYOUCIA1cWO840ZO/RvxkSAnQdB56eZO9vtpKS7HapviU8wul5mSYmiVKim+Y2xXO2rpVJNKYvCXpb1NDJELM6fF4Rt2q5yUFU71l2g7hmA4HjLP2X97NA63hB5KAgcxM1q3o1Sm3C5/8xvhcuax6hpAOmIp95gyLI2xraHxgWOv/VThT50ZitYUV8Py4Jmrj0B8Aq3g+h5sjWDkzVhn8bDn19nYzbf2RBSv4uBnzhHKTm4aPGp9efUCDvRBjbdlixzV9NViqQraa/CyWSEsL/W0voUa8pcB7FVlKwJMyxuK0XQV69POHefUMIMpY6lMZRHQTtBEVJAQu1+ueoPu02nsiQiKtDaUDta4jb6FALEq9JVbDlzlzsT+5Feh12bKlyezFfImWo1Euhg9Vy+tijdP05GADIcaDfi+xfYiD9WpGzW4HBKUL0kz0wvAVdSn/UmzlQVciiloncIsrpSoq/1YfV2wzO/MO7LXseP7OoeN5uA3xB5AjCg97pu/eJyjB4aEHkr71hc2Ykr0SIvkdOVTVHOOKlEVJrX8s8nJo80/6rbXDjSNyjununhUkwcCRn5kkv/UT9teoFg/77FT0E1zk3Cj8XmyCWd8K/Kr5pcJJ95fvGyoCqzhMGsXsG6EDjk5Z8eLS+8bJFF/Qaq20/b4L5FFu9UvDxmiS56Aa1NyMqesYj6u4kjHXEITEJCd44oJzgqh1TUholhZiSVwM/xugc0SGqj4mu49lIWp7/fT8Dumt8m9zig+9iijnqmhOKo9DJnioBLFCmHS/H9lJUeQsh1hTVIVPJ+sU4fuLkJc12Lo2+J3rv5++lDF0dHo4OWABpTZRLv63TzRryiUBWC5yDPYV/7M58hh2+9g3D0KjI8/8BXmf3G1z0vhL+fGxbfiW9qD7NJ8FSOLKfxkSkkc07dm7US6Balc78dBLVshM+AzgsKXjS0Uc6dLDGrgfw2x6Uki5aUdZqzZDvYZQk+7luNzqZUEu9hj7U1Wchxll2dVP/fPkdow+QzyiZA1dJeZg5zH1luhSHiYWbv2EdtwpWWpl7+/mFJcpXVL82k8nZGJsqPvIAVc1USg+K8Yp0C5+oYIcHn1IfPWcJfWRr9xyN+di3NKfmyuTMJebmgmVuR/LseDswAcVefUIPBk2gmcPDow6jichj/3rW/fR7rI5e9RKsI5KAiUQGlrUffkJzKoO4idgI/1SotQSp3Ph+0iUR1aErwX7fGRSgeuWOaG+M8gWIWpyxApIrNc/J9NYQL0SBXTfh6Khh6bcfwSo9qz+hb6Lc8DtYIepu4iZpdM3TVRC32/Ic7g2QUqmxiH7JKDZaHFm8GnHF4SBBBlbrWpPUIHW1v6p+AdfT6fMFiu+qhyAPLGzj9WILO2Y51WUccBhRjIH5M1sY2qg+puuCHe0Ar9FgjHJjKJGMNxWqnCKeIsmT9TmifJOZW21U4xUtzei6rws4ZnfX91FvCobWMGs8qdRmM/dhu/Ct6F3BdsCX1QAJc3n5IPV3qhAtW2tTAkF1Gy1/2cz0AdfN5o5JSzFMsUuw8Bzcl1Gp/V2wd+lgyVHzhpFvjN7XWmSW+Gf4jjUOBhFGV8QCapgwEWE0byJIdy4xeMEsd805l2IFL1/711U1A73kAn3Rj9PTYDclF4TAtMGF6xqHIgc2gCGO7B5h+upHqJ7hsaA0Gil7m2Yi09Wziwu0VDjRv99zm73HeQIeMAF7VcKBFknZzohS83XLmgrGAN+YOdyXFkdZ8+Fskl9uDXhUTvuX6QIfHjqK5gwhLhFWZjOwfO61/6XLsSd+03JdvQSaCDnmdhVIFDwqQb5VdEHjfdJspcCnwO1gNVXbsrZP6+6IC/INUF2X4l6QaKDHkDf9/iW9ZrCMcrcpitvGtM/GjC28yBVOwGpw8irG5i4ZoKnhXolH93g40vVndFuMhGYLZfrhCf+eIB2+VRzX/i65LuCIZaWpUcN8UVBPavajMUqU34sjka7a7obKFiBt4bwgdOfGu3hXx+W3HpRWtiZ0t0ATwj79ASq45pMPyb6ZOqH49fhQqvRqtxnQQ+qNKoIW6VhV2dYFu1PAPBtvp6ukEDpEJIZsGsg9tAzuE1QftuFNEc4d+6454UBEdEQSp7MQSmrVvUacRXkKbKO52Kp22h7jdIRyk+5fmu8BA7TfYL36BTM6sC5wW/NO4qp9WUf/GJ0mIHDibcgYeCIiXHwegI+D3RHWjgF66kDzMpYGWW/+7OB4qz3CJqy9QmuvBWKhoVwvNpwxGBNCecDIK4WMTRckOb1oSHPx/etckrrfKSVnaece60LgTdjCv273SMZPJXFIp64Y6MZ7iz4C25EOFmV5r5lHLw/c4sy7IDJgGS8D6RsLrjKZdBv1iKX8UBEI3CeuPxISlg7+aoPT29EYz+UUOWrsTQu6oOY53/l5Xj8tdJM7mvZBPNrGQMlQNW0fFEOwIfTAYl5byfpWPFh8IF6BDMCa/GG2TaSj+X4BhF+gnKtriMfjYbC1BcN4TQm055CHXvrlfObgW+5vNeSIjqIUhxwWzYp4NOiBMk0xs5123hkUshKlwnHTRX7t7dTvYvtCRqqAjMPkOrTJHkR65SZ8iP5KV7XBdX21aYIANbBQ+0Orytqo2qEXglFoPZhf9lfnI/nOtsEaDPZ837i2Af86VhXg7UQLLMc5g9fwxpAedFZUYTMvoSN2A5l++R+O7B7FV5dpYyJjoC0gQhdc0pISg6XE44Q1L3KdQVuM+WaxoIlB+TnXYsioB8D/3prZKQpZUw2uQzd9X3i++iU4F8wLdiJn43IG2GYnRpcT21UAyarARAQYvX/vFUxouLmpaHyjOR1HYEerJKtn9N261vq7mYFUTr8f2FmTX/X3EMlGRORnBWiajm+emIUdj3omrCJdQV6069ganjP930AN62+1NJWZZBOWcwTLUheE59O4Qu5Vxmb1u5SSBw5CQC2bBYI9xw97Gd0lvnebMWTJE2joiQUOsXpqEsMUxp8k6+yMcACNuj4cGzCD396mS6ktWJhJ/AsCAQbMkXwacboxKPuKjHC+SEu/6fJxvHOceKc14sJlKjJisEcxI7iwVjuA9MFdcXjFTdEYC23UvPkhKHoBQrCdlus+/S1BGV3BsAhKS/AOgCBs+OIvA1gkY+kTyBNSs6OpppuCQOK0Vl/gcVNW5ac4qQdVQzCa+Tlh8DsBZ8SOKCqDfUovbklk4sb4aCONfpl9A7jksJ7op50EFXMCyyyaWoTmNjcNvQupMOwjnNh2JevSRvCzoFlHjajt2Wgp+/tYP3F9UwbG3sQ8FfdBjSow/oyiwNPPFcLJQsokVL6Ue+dusM3qvEKO5bMtRSWYdG5vdy147TaBm2kksHc2a2qBik8GgUcAriWHqL+bWSQIV3FvgAJNN/K0N8wYEE1hiHH3mOJOcL2xBPTEavKisdHrAJV28BjhNTfwhLMszPhS57tK8nm5zjYVqo26IHRAAzuP6uyUREqDATEyMke238PZYY6ApRS+0+LrCF2W6iQ4OJ2GfZ8OSDGT/NYvVlY1iqqKE+lzoASTWMf8RagbZWYKD/iGQEdHsPG+7qZuMe5meAgLkakBZqyVEFzHxaSmaW5FD3uBH65Qe4AL0NFl3pcyIfxLW3NnpA2qA63BptxO2DToB0Eh9d+mr+NW/+6p27hQXe2aQkIdupYlk7zlKVCLzq5RK88WXo33Ci5XMghlGD0nN+DCf8tGyL70W/8CztlOq8Qhv+xS2oErsOqqRW1+RVgWQq4qHG4fcMIN8Ck3pxDAviQi7yBlsY52yqi6o/YjwfJauIAnifTf/YKsUNuHpvq1KI0nA3bPO+e2Nv4n45DXOvLQxP2FuokSjDCNVkVG+MdT3MBP9EO+X2uvpVCG3Yt9Abnd7cuVLiuQZ63gFNMwKvB8+lNk1TITuGDn/nbROLyTmlkHUBBl4ejOfGUn61JX2xpwXpGMj7iAggOawzM95iiqDPDqcdOKUT5fs4KybBxLH8WogKGrbO0gYC3QpG44SnGAVsHr2SNL0D3qlodzidYOUdOBfonC9pCN56/JcOQ7v3x3v+K6jRomNW89gtUQaGeou0rFy6F7WsAxO6fK0u2IP85tvIFAU3KPXcr0HtDwEC1iJ1HN/R5/U83ZQZKS2UACPCCyZCGhRaEpRaWCBMg16w+4Ai6LmsklBMewjjCSdMmE5bkKkWNv6wdZzvhoUzYTMAS9ZYScuhYS3hRCfAWzIVwePd1vRJdynG3qSCE8umCqF0qZh57MgKgaN1uKd3LlQhaqhvAsteLJyOyoCnJscmm0io7/uaqrU8trOfr+7kGLuq44TsgxX1VbM+/XKB6X9ml1Rpr/uKE0j1zawIUa0sSvNjur/i8VzKYO8B0l8BXhuJltD67rYL7ukqjpyTPokNPHx76xLfahtaQ/BY/gBLmP3GX03PUFup4oZtjKOhKMDLaV8SnVEMXS9OloW/m1Apeh8Yhb+DdqXo3oorKtgxo4bYfVE434opGF9eK68fJ6xKJ+BdUlyr9u69spVU2l7VdIQeyyOOmul42t3a7R/IJxfc7fTMO9RIME5SSJE6NRqvhazameU+NnOC0rd0shrwWC9h7SAMteH39aJdLYIMaX3Mz1nM5yK8J1k84wWYpydRmH0A/ik9k1Eh4kRrbL3ztkPa/iaRo3jM1o5aTHMsGw0NTKurbAJ/CDCjOLiMoCXnLfxdYGMc9ppcKJqqZMt3VLg5QlyjDMWcoM9NVOze9ZwaELLB0xBeKXRJMNDSnv0E4Pzo006M03OqsLWlzbaQlMWpCH96DBTGX2soVBQMzypBouUQNJPBof+/EXQRDRaKxO81tdkFrIyRAKSGHB6/ccIqXBOvkc0R1+jHdiKi6EWRSrmuJGqqyFy40C8V/g7mwXt8ue3OiDvEu/xeE9oP/4sPktUciBdtjTdqGaT6a/EX9TT1wdn1Dbjfj/khM2Z2WsNf4mKRL0xzFoCLTSxTGI3P3J+4prbsW5fjkAsmqxYnfUzcKycz5edCXf/Gt28pTe6oXLd2+qyXQ0NMHCjINO4RNDQn6up/FsGrpEHTf/027uLEDjyUJVWiigUChywqoSJeLbGgrHChdo/Wkt5jgOTAGq2jP0LZKdX9jic/sQUa1fgsMGVBbfWy119kEc7NBXnxnG4T2bVNTGcseJ81RlW3R6+pbUM8h2vykdg1o49lTtFBRVdS2ymWaYOIFKjD4Te6amRkWr61WpM1sgRaINPy5G1ee8Z7qrP4hhHOqVHcPc6A0sGCCiE1AKBwatOanPv6m2vuzODR1ipEmzp5Fucu01Zkx0O1XUr2T7zjCYaX5OfD95OS8XrSkBbzr92SmrDAprKcDrAPrz7E/wZhbsNotQ3q3AximxId+Mg/KYxB85dFC5A46xD9ZlZg9W+EHcbRGx7yieoEUh4xfPbwyceZkOGzIbZdxWYRUgdMYtdFcaUBWrV1Xq7XtjaDoGC/OFGE2yWVM69p12gtq+1tIVtLBcsL/9Igx3hVb1Op8iXCXIOiCzr8Z/qkmSCdwUJRIKz6F3lC0KesRRbEvo2+F4aqaH5RynvPCTl+Sj7PiMcuXzypy6wVLDDta+QakxVx/JBCRYV05+E2L2dhUtvS5/+3awVtint4/ZK3+GMYoq9VHg5mwZlyeoqa02YNCShOqsjlVqBB97gqnGRWD994S3PDV94aplg5ARIeL0A3VKW+9/KcTR0HKSM/m/OEOth/+Ua2L2CzuStzP3wWi/ZVb4k2b/8unzTOLzYohRJjFdE6zMVt7NMd3H9DG3tFE1Ccd6+b3rM3gZf2xfr7e4kqO7YAMM2FzsXZYd8b+whbcatuqsZW1XmO4epAKuxYNaF53r6KSUoczVDxJ6ozUkC/kGKnJEQs+Jf7I7hMdf6kH+OWx593FZpzuCtQfbszTJ4kX7/PFO+zISAss+E76l23MJVZFpFRmXLey5N3MCRS8cYTCsWKRclZAPLkQMdvm+t7qFx5aEBFxs9JonIV1hyLI5M49+jaPOPcFYn119kUDY3KUEP8HNtlB01+wnjTyOBpykkUBGI9EIoC3NaTr9d+gKe9vBMQtY71Z5tyuKFy3h9lpJl46iZWkLFCsOvpdI8AWFh5dD30IMW38EZHJHLQ</xenc:CipherValue></xenc:CipherData></xenc:EncryptedData></t:RequestedSecurityToken><t:TokenType>urn:oasis:names:tc:SAML:1.0:assertion</t:TokenType><t:RequestType>http://schemas.xmlsoap.org/ws/2005/02/trust/Issue</t:RequestType><t:KeyType>http://schemas.xmlsoap.org/ws/2005/05/identity/NoProofKey</t:KeyType></t:RequestSecurityTokenResponse>',
                    'wctx': 'rm=1&id=1956a608-2bf4-4a44-b363-780e50344cc8&ru=https%3a%2f%2ftwmi.crm.tecowestinghouse.ca%3a444%2fdefault.aspx'
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