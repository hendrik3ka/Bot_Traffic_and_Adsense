const path = require("path");
require('dotenv').config({
    path: path.join(__dirname, '.env')
});
const fs = require("fs");
const p = require("puppeteer-extra");
const proxyChain = require("proxy-chain");
const {
    randomListUser
} = require('./utils/randomListUser')

const {
    randomListAndroid
}= require('./utils/android')

const{
    randomListDesktop
}= require('./utils/desktop')
    
const{
    randomListIphone
}=require('./utils/iphone')

const pPlugin = require("puppeteer-extra-plugin-stealth");
p.use(pPlugin());

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const { log } = require("console");

const baseUrl = process.env.BASE_URL;
const ipUrl = process.env.IP_URL;
const ipSaya = process.env.IP_SAYA;
const ipHub = process.env.IP_HUB;
const timeout = process.env.TIMEOUT || 3000;

const spoof = path.join(process.cwd(), "extension/spoof/");
const UserAgent = require('user-agents') 

let browser;
let page;
let newProxyUrl;
let stopFlag = false

const startProccess = async (keyword, domain, anchor, logToTextarea, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys, ipsayas, anchorTexts, iphubs, tablets) => {
    stopFlag = false
    if (captchaApiKeys) {
        p.use(
            RecaptchaPlugin({
                provider: {
                    id: '2captcha',
                    token: captchaApiKeys
                },
                visualFeedback: true
            })
        )
    } 
let reachedproxy;
let rproxy;    
if (proxyC) {
    const se = proxys.split('\n')
    const randomProxyInfo = se[Math.floor(Math.random() * se.length)];
    const trims = randomProxyInfo.trim()
    reachedproxy = [host, port, username, password] = trims.split(":")
 rproxy = `${reachedproxy[0]}:${reachedproxy[1]}`
 logToTextarea('proxy : ' + reachedproxy[0])
}
let userAgent;
    if (desktops) {
         userAgent = new UserAgent({ deviceCategory:  'desktop' });
        // await page.setUserAgent(userAgent.toString());
    }else if (androids) {
      // userAgent = new UserAgent({ deviceCategory: 'mobile' });
      userAgent = new UserAgent({ deviceCategory: 'mobile' });
        // await page.setUserAgent(userAgent.toString());
    }else if (iphones) {
      userAgent = new UserAgent({ platform: 'iPhone' });
        // await page.setUserAgent(userAgent.toString());
    }else if (randoms) {
      userAgent = new UserAgent().random();
        // await page.setUserAgent(userAgent.toString());
    }else if (tablets){
      userAgent = new UserAgent({ deviceCategory: 'tablet' });
    }else{
      userAgent = new UserAgent().random();
    }
    const options = {
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        args: [
            proxyC ? `--proxy-server=${rproxy}` : null,
            `--load-extension=${spoof}`,
            `--user-agent=${userAgent.toString()}`,
            // `--disable-extensions-except=${spoof}`,
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-popup-blocking",
            "--allow-popups-during-page-unload",
            "--disable-setuid-sandbox",
            '--start-maximized'
        ].filter(Boolean)
    }

    browser = await p.launch({
        headless: view,
        ...options,
    })

    page = await browser.newPage()
    if (proxyC) {
        await page.authenticate({username: `${reachedproxy[2]}`,password: `${reachedproxy[3]}`}); 
    }

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };


    try {

        page.on('dialog', async dialog => {
            await dialog.dismiss();
            await closeClear(proxyC)
        })

        await checkErrorPage(logToTextarea)
       
        if (ipsayas) {
            await getipsaya(logToTextarea, proxyC)
        }
        if (iphubs) {
            await getipHub(logToTextarea, proxyC)
        }
        
        if (whoers) {
            await getIp(logToTextarea, proxyC)
        }
        if (googleSearchs) {
            await page.goto(baseUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000
            })
    
            await checkErrorPage(logToTextarea)
            if (captchaApiKeys) {
                await page.solveRecaptchas()
            }
            await page.sleep(5000)
    
            const accept = await page.$('#L2AGLb');
    
            if (accept) {
                logToTextarea("Accept Found ✅");
                const bahasa = await page.$('#vc3jof');
                await bahasa.click();
                await page.waitForSelector('li[aria-label="‪English‬"]');
                await page.click('li[aria-label="‪English‬"]');
                await page.sleep(5000)
                const accept = await page.$('#L2AGLb');
                await accept.click()
            } else {
                logToTextarea("Accept Not Found ❌");
            }
    
            const search = await page.$('[name="q"]')
            await search.type(keyword, {
                delay: 60
            })
            await search.press('Enter');
            // const elements = await page.$$('input[name="btnK"]');
            // if (elements.length > 1) {
            //     const submit = elements[1];
            //     await submit.click();
            // }
    
            await page.sleep(5000)
            if (captchaApiKeys) {
                try {
                    await page.waitForSelector('#captcha-form');
                    const tesElement = await page.$('#captcha-form');
                    if (tesElement !== null) {
                    logToTextarea("Solve Recaptchas")
                    } else {
                    logToTextarea('No Captcha');
                    }  
                } catch (error) {
                    logToTextarea('No Captcha');
                }
                await page.solveRecaptchas()
            }else{
                try {
                    await page.waitForSelector('#captcha-form');
                    const tesElement = await page.$('#captcha-form');
                    if (tesElement !== null) {
                    logToTextarea('Captcha Closing browser and retrying... ❗');
                    await closeClear(proxyC)
                    return
                    } else {
                    logToTextarea('No Captcha');
                    }  
                } catch (error) {
                    logToTextarea('No Captcha');
                }
            }
    
            await page.sleep(5000)
    
            logToTextarea('Find Article For ' + keyword);
    
            const startTime = Date.now();
            while (Date.now() - startTime < 10000) {
                await page.evaluate(() => {
                    window.scrollBy(0, 100);
                });
                await page.sleep(5000);
                await page.evaluate(() => {
                    window.scrollBy(0, -10);
                });
                await page.sleep(3000);
            }
    
            const hrefElements = await page.$$('[href]');
            const hrefs = await Promise.all(hrefElements.map(element => element.evaluate(node => node.getAttribute('href'))));
    
            let linkFound = false;
    
            for (const href of hrefs) {
                if (domain.includes(href)) {
                    logToTextarea("Article Found ✅");
                    try {
                        const element = await page.waitForXPath(`//a[@href="${href}"]`, {
                            timeout: 10000
                        });
                        await element.click();
                        linkFound = true;
                        break;
                    } catch (error) {
                        logToTextarea(`Error clicking the link: ${error}`);
                        break;
                    }
                }
            }
    
            if (!linkFound) {
                logToTextarea("Article Not Found ❌: " + domain);
                await closeClear(proxyC)
                return
            }
    
            await page.sleep(10000);
            try {
                await page.reload();
                await page.sleep(10000);
            } catch (error) {
                await page.sleep(30000);
                await page.evaluate(() => window.stop());
            }
           
            await autoScroll(page, scrollmins, scrollmaxs, logToTextarea)
        }

        if (directLinks) {
            try {
                await page.goto(keyword, { waitUntil: ['domcontentloaded', "networkidle2"],
                timeout: 120000 });
             } catch (error) {
               if (error.name === "TimeoutError") {                
               //await page.reload();
               await page.evaluate(() => window.stop());
               //page.sleep(10000)
               } else {
                 // Handle other errors
                 logToTextarea("An error occurred:", error);
               }
            }
            await page.sleep(10000);
            try {
                await page.reload();
                await page.sleep(10000);
              } catch (error) {
                if (error.name === "TimeoutError") {
                await page.evaluate(() => window.stop());
                } else {
                  logToTextarea("An error occurred:", error);
                }
              }
            logToTextarea("Go to " + keyword);
            await page.sleep(30000);
            await autoScroll(page, scrollmins, scrollmaxs, logToTextarea)
        }
        //logToTextarea(anchor + ' sdsd ' + 'ipsaya ' + ipsayas + 'achortwk ' + anchorTexts)
        if (anchorTexts) {
            await page.goto(baseUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000
            })
    
            await checkErrorPage(logToTextarea)
            if (captchaApiKeys) {
                await page.solveRecaptchas()
            }
            await page.sleep(5000)
    
            const accept = await page.$('#L2AGLb');
    
            if (accept) {
                logToTextarea("Accept Found ✅");
                const bahasa = await page.$('#vc3jof');
                await bahasa.click();
                await page.waitForSelector('li[aria-label="‪English‬"]');
                await page.click('li[aria-label="‪English‬"]');
                await page.sleep(5000)
                const accept = await page.$('#L2AGLb');
                await accept.click()
            } else {
                logToTextarea("Accept Not Found ❌");
            }
    
            const search = await page.$('[name="q"]')
            await search.type(keyword, {
                delay: 60
            })
            await search.press('Enter');
            // const elements = await page.$$('input[name="btnK"]');
            // if (elements.length > 1) {
            //     const submit = elements[1];
            //     await submit.click();
            // }
    
            await page.sleep(5000)
            if (captchaApiKeys) {
                logToTextarea("Solve Recaptchas")
                await page.solveRecaptchas()
            }else{
                try {
                    await page.waitForSelector('#captcha-form');
                    const tesElement = await page.$('#captcha-form');
                    if (tesElement !== null) {
                    logToTextarea('Captcha Closing browser and retrying... ❗');
                    await closeClear(proxyC)
                    return
                    } else {
                    logToTextarea('No Captcha');
                    }  
                } catch (error) {
                    logToTextarea('No Captcha');
                }
            }
    
            await page.sleep(5000)
    
            logToTextarea('Find Article For ' + keyword);
    
            const startTime = Date.now();
            while (Date.now() - startTime < 10000) {
                await page.evaluate(() => {
                    window.scrollBy(0, 100);
                });
                await page.sleep(5000);
                await page.evaluate(() => {
                    window.scrollBy(0, -10);
                });
                await page.sleep(3000);
            }
    
            const hrefElements = await page.$$('[href]');
            const hrefs = await Promise.all(hrefElements.map(element => element.evaluate(node => node.getAttribute('href'))));
    
            let linkFound = false;
    
            for (const href of hrefs) {
                if (domain.includes(href)) {
                    logToTextarea("Article Found ✅");
                    try {
                        const element = await page.waitForXPath(`//a[@href="${href}"]`, {
                            timeout: 10000
                        });
                        await element.click();
                        linkFound = true;
                        break;
                    } catch (error) {
                        logToTextarea(`Error clicking the link: ${error}`);
                        break;
                    }
                }
            }
    
            if (!linkFound) {
                logToTextarea("Article Not Found ❌: " + domain);
                await closeClear(proxyC)
                return
            }
    
            await page.sleep(10000);
    
            try {
                await page.reload();
                await page.sleep(10000);
            } catch (error) {
                await page.sleep(30000);
                await page.evaluate(() => window.stop());
            }
           
            await autoScroll(page, scrollmins, scrollmaxs, logToTextarea)
            
            // Cari tautan dengan teks tertentu
            //   const linkTextToFind = domain;
            const linkElement = await page.$x(`//a[contains(@href, "${anchor}")]`);

            if (linkElement.length > 0) {
                // Klik tautan jika ditemukan
                await linkElement[0].click();
                logToTextarea(anchor + ' ditemukan dan diklik ✅');
                await page.sleep(30000);
                const starttTimes = Date.now();
                const miscs = scrollmins * 60;
                const maxscs = scrollmaxs * 60;
                const ttimes = Math.floor(Math.random() * (maxscs - miscs + 1)) + 60;
                const cossfe = ttimes / 60;
                const numb = cossfe.toString().slice(0,4)
                const rNumb = parseFloat(numb);
                logToTextarea("Scrolling page tautan for random range " + rNumb + " minute 🕐");
                    while (Date.now() - starttTimes < ttimes * 1000) {
                        await page.evaluate(() => {
                            window.scrollBy(0, 100);
                    });
                    await page.sleep(3000);
                    await page.evaluate(() => {
                        window.scrollBy(0, -10);
                    });
                     await page.sleep(3000);
                }
            } else {
                logToTextarea('Tautan tidak ditemukan.');
            }      
        }

        if (recentPosts) {
            page.sleep(30000)
            logToTextarea("Klik Recent Posts");
            const postLinks = await page.$$('#recent-posts-2 ul li a');
            const randomIndex = Math.floor(Math.random() * postLinks.length);
            const randomLink = postLinks[randomIndex];
            page.sleep(10000)
            const linkUrl = await page.evaluate(link => link.href, randomLink);
            // logToTextarea('Url Recent Posts : ' + linkUrl)
            await page.goto(linkUrl, { waitUntil: ['domcontentloaded', "networkidle2"],
            timeout: 120000 });
            logToTextarea("Klik Recent Posts Found ✅");
           await autoScroll(page, scrollmins, scrollmaxs, logToTextarea)
        }

        if (visitAdss) {
            
            const ads = await page.$$('ins:not(.adsbygoogle-noablate)[data-ad-status="filled"][data-adsbygoogle-status="done"]');

            const randomIndex = Math.floor(Math.random() * ads.length);
            const ad = ads[randomIndex];

            const bungkus = await ad.$('[title="Advertisement"]');

            if (bungkus) {
                const iframe = await bungkus.$('iframe');
                const el = await iframe.contentFrame()

                if (el) {
                    const body = await el.$('body')

                    const adsImage = await body.$('a[data-asoch-targets="ad0,btnClk"]')
                    const adsClickTwo = await body.$('a[data-asoch-targets="ad0,ochButton"]')
                    const adsImageManeh = await body.$('a[data-asoch-targets="ad0,imageClk"]')
                    const adsImageManehEu = await body.$('a[data-asoch-targets="ad0"]')

                    if (adsImage) {
                        const url = await el.evaluate(element => {
                            return element.getAttribute('href');
                        }, adsImage);

                        const data = await el.evaluate(element => {
                            return element.getAttribute('data-asoch-targets');
                        }, adsImage);

                        const attSrc = await el.evaluate(element => {
                            return element.getAttribute('attributionsrc');
                        }, adsImage);

                        const attClass = await el.evaluate(element => {
                            return element.getAttribute('class');
                        }, adsImage);

                        if (url) {
                            await page.evaluate((url, data, attSrc, attClass) => {
                                const newElement = document.createElement('a');
                                newElement.setAttribute('attributionsrc', attSrc);
                                newElement.setAttribute('class', attClass);
                                newElement.setAttribute('href', url);
                                // newElement.setAttribute('target', '_blank')
                                newElement.setAttribute('data-asoch-targets', data);
                                document.body.appendChild(newElement);

                                newElement.click({
                                    clickCount: 2
                                });
                            }, url, data, attSrc, attClass);
                        }

                        await page.waitForTimeout(30000)
                        logToTextarea("Klik Adds Found ✅");
                        await autoScrolladds(page, scrollminAdss, scrollmaxAdss, logToTextarea)

                    } else if (adsClickTwo) {

                        const url = await el.evaluate(element => {
                            return element.getAttribute('href');
                        }, adsClickTwo);

                        const data = await el.evaluate(element => {
                            return element.getAttribute('data-asoch-targets');
                        }, adsClickTwo);

                        const attSrc = await el.evaluate(element => {
                            return element.getAttribute('attributionsrc');
                        }, adsClickTwo);

                        const attClass = await el.evaluate(element => {
                            return element.getAttribute('class');
                        }, adsClickTwo);

                        if (url) {
                            await page.evaluate((url, data, attSrc, attClass) => {
                                const newElement = document.createElement('a');
                                newElement.setAttribute('attributionsrc', attSrc);
                                newElement.setAttribute('class', attClass);
                                newElement.setAttribute('href', url);
                                // newElement.setAttribute('target', '_blank')
                                newElement.setAttribute('data-asoch-targets', data);
                                document.body.appendChild(newElement);

                                newElement.click({
                                    clickCount: 2
                                });
                            }, url, data, attSrc, attClass);
                        }

                        await page.waitForTimeout(30000)
                        logToTextarea("Klik Adds Found ✅");

                        await autoScrolladds(page, scrollminAdss, scrollmaxAdss, logToTextarea)

                    } else if (adsImageManeh) {

                        const url = await el.evaluate(element => {
                            return element.getAttribute('href');
                        }, adsImageManeh);

                        const data = await el.evaluate(element => {
                            return element.getAttribute('data-asoch-targets');
                        }, adsImageManeh);

                        const attSrc = await el.evaluate(element => {
                            return element.getAttribute('attributionsrc');
                        }, adsImageManeh);

                        const attClass = await el.evaluate(element => {
                            return element.getAttribute('class');
                        }, adsImageManeh);

                        if (url) {
                            await page.evaluate((url, data, attSrc, attClass) => {
                                const newElement = document.createElement('a');
                                newElement.setAttribute('attributionsrc', attSrc);
                                newElement.setAttribute('class', attClass);
                                newElement.setAttribute('href', url);
                                // newElement.setAttribute('target', '_blank')
                                newElement.setAttribute('data-asoch-targets', data);
                                document.body.appendChild(newElement);

                                newElement.click({
                                    clickCount: 2
                                });
                            }, url, data, attSrc, attClass);
                        }

                        await page.waitForTimeout(30000)
                        logToTextarea("Klik Adds Found ✅");
                        await autoScrolladds(page, scrollminAdss, scrollmaxAdss, logToTextarea)

                    } else if (adsImageManehEu) {

                        const url = await el.evaluate(element => {
                            return element.getAttribute('href');
                        }, adsImageManehEu);

                        const data = await el.evaluate(element => {
                            return element.getAttribute('data-asoch-targets');
                        }, adsImageManehEu);

                        const attSrc = await el.evaluate(element => {
                            return element.getAttribute('attributionsrc');
                        }, adsImageManehEu);

                        const attClass = await el.evaluate(element => {
                            return element.getAttribute('class');
                        }, adsImageManehEu);

                        if (url) {
                            await page.evaluate((url, data, attSrc, attClass) => {
                                const newElement = document.createElement('a');
                                newElement.setAttribute('attributionsrc', attSrc);
                                newElement.setAttribute('class', attClass);
                                newElement.setAttribute('href', url);
                                // newElement.setAttribute('target', '_blank')
                                newElement.setAttribute('data-asoch-targets', data);
                                document.body.appendChild(newElement);

                                newElement.click({
                                    clickCount: 2
                                });
                            }, url, data, attSrc, attClass);
                        }

                        await page.waitForTimeout(30000)
                        logToTextarea("Klik Adds Found ✅");
                        await autoScrolladds(page, scrollminAdss, scrollmaxAdss, logToTextarea)
                    }
                }
            } else {
                logToTextarea('Ads not found');
            }
        }
        logToTextarea('Done');
        await closeClear(proxyC)
    } catch (error) {
        logToTextarea(error)
        await closeClear(proxyC)
    }
}

const closeClear = async (proxyC) => {
    if (proxyC) {
        await browser.close()
        // await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
    } else {
        await browser.close()
    }
}

const checkErrorPage = async (logToTextarea, proxyC) => {
    const titles = await page.title();
    const bodyEl = await page.$('body');
    const bodyText = await page.evaluate(body => body.textContent, bodyEl);

    if (titles.includes("Error 403 (Forbidden)!!1")) {
        logToTextarea("Error Forbidden Page Close...");
        await closeClear(proxyC)
    } else if (bodyText.includes("This site can't be reached")) {
        logToTextarea("Error can't be reached");
        await closeClear(proxyC)
    }
}
async function autoScroll(page, scrollmins, scrollmaxs, logToTextarea) {
    const startTimes = Date.now();
    const min = parseInt(scrollmins);
    const max = parseInt(scrollmaxs);
    const duration = Math.round(Math.random() * (max-min)) + min;
    const sleepDuration = duration * 60 * 1000;
    const convertMinutes = Math.floor((sleepDuration / 1000 / 60) % 60);
    logToTextarea("Scrolling page  for random range " + convertMinutes + " minute 🕐");
        while (Date.now() - startTimes < sleepDuration) {
            await page.evaluate(() => {
            window.scrollBy(0, 100);
        });
        await page.sleep(3000);
        await page.evaluate(() => {
            window.scrollBy(0, -10);
        });
        await page.sleep(3000);
    }
    logToTextarea('Scrolling page ✅')
}
async function autoScrolladds(page, scrollminAdss, scrollmaxAdss, logToTextarea) {
    try {
    const startTimes = Date.now();
    const min = parseInt(scrollminAdss);
    const max = parseInt(scrollmaxAdss);
    const duration = Math.round(Math.random() * (max-min)) + min;
    const sleepDuration = duration * 60 * 1000;
    const convertMinutes = Math.floor((sleepDuration / 1000 / 60) % 60);
    logToTextarea("Scrolling page adds  for random range " + convertMinutes + " minute 🕐");
      while (Date.now() - startTimes < sleepDuration) {
          await page.evaluate(() => {
          window.scrollBy(0, 300);
          });
          await page.waitForTimeout(2000);
          await page.evaluate(() => {
              window.scrollBy(0, -210);
          });
          await page.waitForTimeout(2000);
      }
      logToTextarea('Scrolling page adds ✅')
    } catch (error) {
      logToTextarea('Scrolling page adds Not Found ❌')
    }  
}
const getipsaya = async (logToTextarea, proxyC) => {
    try {
        await page.goto(ipSaya, {
            waitUntil: "networkidle2",
            timeout: 60000
        });
        try {
          await page.waitForTimeout(10000);
          await page.waitForSelector("body > div.fc-consent-root > div.fc-dialog-container > div.fc-dialog.fc-choice-dialog > div.fc-choice-dialog-header > button", {timeout: 10000,});
          await page.click("body > div.fc-consent-root > div.fc-dialog-container > div.fc-dialog.fc-choice-dialog > div.fc-choice-dialog-header > button");
          logToTextarea('Pop up Found ✅');
        } catch (error) {
          logToTextarea('No pop up');
        }
        await page.waitForSelector("body");
  
        const accept = await page.$(".fc-button");
        accept && (await accept.click());
  
        await page.waitForSelector('input[id="btn-submit"]', {
            timeout: 60000,
        });
  
        const data = await page.$('input[id="btn-submit"]');
        data && (await data.click());
        await page.waitForTimeout(40000);
  
        const datas = await page.$$('[name="btn-submit"]');
        datas.length > 0 && (await datas[0].click());
        await page.waitForTimeout(10000);
        const getPrx = await page.$('#submit-control')
        const resultPrx = await page.evaluate((e) => e.innerText, getPrx);
        const splitPrx = resultPrx.split('-')[0]
        const note = resultPrx.split(',')[0]
        const stringPrx = splitPrx.toString();
        await page.sleep(timeout)
        if (stringPrx !== "TIDAK ") {
            logToTextarea('IP yang anda gunakan terindikasi menggunakan VPN atau Proxy Closing browser and retrying... ❗');
            await closeClear(proxyC)
        }else{
            logToTextarea(note)
        }
        
        
    } catch (error) {
        logToTextarea(error)
        await closeClear(proxyC)
    }
};
const getipHub = async (logToTextarea, proxyC) => {
    try {
        await page.goto(ipHub, {
            waitUntil: "networkidle2",
            timeout: 60000
        });
        await page.waitForTimeout(9000);
        const getPrx = await page.$('#countryName')
        const geetd = await page.$('#type')
        const negara = await page.evaluate((e) => e.innerText, getPrx);
        const status = await page.evaluate((e) => e.innerText, geetd);
        if (status == "Good IP (residential or business)") {
        logToTextarea(status);
        logToTextarea('Country : ' + negara);
        }else{
        logToTextarea(status + 'Closing browser and retrying... ❗');
        await closeClear(proxyC)
        }

    } catch (error) {
        logToTextarea(error)
        await closeClear(proxyC)
    }
};
const getIp = async (logToTextarea, proxyC) => {
    try {
        await page.goto(ipUrl, {
            waitUntil: "networkidle2",
            timeout: 60000
        });

        const title = await page.title();

        if (title !== "Find and check IP address") {
            logToTextarea('Error Reloading...');
            await page.reload()
        }

        const getIp = await page.$(
            "#main > section.section_main.section_user-ip.section > div > div > div > div.main-ip-info__ip > div > strong"
        );
        const resultIp = await page.evaluate((el) => el.innerText, getIp);
        const getDevice = await page.$(
            "#main > section.section_main.section_user-ip.section > div > div > div > div.row.main-ip-info__ip-data > div:nth-child(1) > div:nth-child(3) > div.ip-data__col.ip-data__col_value"
        );
        const resultDevice = await page.evaluate(
            (el) => el.innerText,
            getDevice
        );

        const getBrowser = await page.$("#main > section.section_main.section_user-ip.section > div > div > div > div.row.main-ip-info__ip-data > div:nth-child(1) > div:nth-child(4) > div.ip-data__col.ip-data__col_value");
        const resultBrowser = await page.evaluate(
            (el) => el.innerText,
            getBrowser
        );

        const getCountry = await page.$('[data-fetched="country_name"]');
        const resultCountry = await page.evaluate(
            (el) => el.innerText,
            getCountry
        );

        let browcer;
        if (resultBrowser.includes('Hide')) {
            browcer = resultBrowser.replace('Hide', '')
        } else if (resultBrowser.includes('Protect')) {
            browcer = resultBrowser.replace('Protect', '')
        } else if (resultBrowser.includes('Protected')) {
            browcer = resultBrowser.replace('Protected', '')
        }

        const line = browcer.split('\n')
        const nonEmptyLines = line.filter(line => line.trim() !== '');
        const resultString = nonEmptyLines.join('\n');

        const getPercent = await page.$("#hidden_rating_link");
        const resultPercent = await page.evaluate(
            (el) => el.innerText,
            getPercent
        );
        const zonedata = await page.evaluate(() => {
            const elements = document.querySelectorAll('.card__col.card__col_value.matched.highlighted_red');
            if (elements.length > 0) {
              return elements[0].innerText.trim();
            } else {
              return null;
            }
          });
        const localdata = await page.evaluate(() => {
            const elements = document.querySelectorAll('.card__col.card__col_value.matched.highlighted_red');
            if (elements.length > 0) {
              return elements[1].innerText.trim();
            } else {
              return null;
            }
          });
          const systemdata = await page.evaluate(() => {
            const elements = document.querySelectorAll('.card__col.card__col_value.matched.highlighted_red');
            if (elements.length > 0) {
              return elements[2].innerText.trim();
            } else {
              return null;
            }
          });

        await page.sleep(timeout)
        if (resultPercent !== "Your disguise: 90%") {
            logToTextarea('The Percentage is under 90%. Closing browser and retrying... ❗');
            await closeClear(proxyC)
        } else {
            logToTextarea("\nDetails IP : " + resultIp)
            logToTextarea("Percent : " + resultPercent)
            logToTextarea("Country : " + resultCountry)
            logToTextarea("Device : " + resultDevice)
            logToTextarea("Browser : " + resultString)
            logToTextarea("Zone: " + zonedata)
            logToTextarea("Local Time: " + localdata)
            logToTextarea("System Time: " + systemdata + '\n')
            
        }
    } catch (error) {
        logToTextarea(error)
        await closeClear(proxyC)
    }
};
// Fungsi untuk mengambil semua tautan dari halaman
async function getLinks(page) {
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.map(anchor => anchor.href);
    });
    return links;
  }
  
  // Fungsi untuk mengklik tautan secara acak
  async function clickRandomLink(page, links) {
    const randomIndex = Math.floor(Math.random() * links.length);
    const randomLink = links[randomIndex];
    await page.goto(randomLink);
  }
const main = async (logToTextarea, keywordFilePath, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys, ipsayas, anchorTexts, iphubs, tablets) => {
    try {
        const data = fs.readFileSync(keywordFilePath, 'utf-8')
        const lines = data.split('\n');

        for (let x = 0; x < loops; x++) {
            logToTextarea("Loop " + x);
            logToTextarea("\n===========================");

            for (let y = 0; y < lines.length; y++) {
                const line = lines[y];
                const [keyword, domain, anchor] = line.trim().split(';');

                logToTextarea("Thread #" + (y + 1));
                await startProccess(keyword, domain, anchor, logToTextarea, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys, ipsayas, anchorTexts, iphubs, tablets);
                if (stopFlag) {
                    logToTextarea("Stop the proccess success")
                    break
                }
                logToTextarea("\n===========================");
            }
            if (stopFlag) {
                break
            }
        }
    } catch (error) {
        logToTextarea(error)
    }
}
const stopProccess = (logToTextarea) => {
    stopFlag = true;
    logToTextarea("Stop Proccess, waiting until this proccess done")
}

module.exports = {
    main, stopProccess
}