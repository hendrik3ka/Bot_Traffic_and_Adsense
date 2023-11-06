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
const timeout = process.env.TIMEOUT || 3000;

const spoof = path.join(process.cwd(), "extension/spoof/");

let browser;
let page;
let newProxyUrl;
let stopFlag = false

const startProccess = async (keyword, domain, logToTextarea, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys) => {
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
    const options = {
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        args: [
            proxyC ? `--proxy-server=${rproxy}` : null,
            `--load-extension=${spoof}`,
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
   
    
    if (desktops) {
        const randomAgent = randomListDesktop();
        await page.setUserAgent(randomAgent);
    }else if (androids) {
        const randomAgent = randomListAndroid();
        await page.setUserAgent(randomAgent);
    }else if (iphones) {
        const randomAgent = randomListIphone();
        await page.setUserAgent(randomAgent);
    }else if (randoms) {
        const randomAgent = randomListUser();
        await page.setUserAgent(randomAgent);
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
                await page.solveRecaptchas()
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
    
            await page.reload();
            const startTimes = Date.now();
            const minsc = scrollmins * 60;
            const maxsc = scrollmaxs * 60;
            const timess = Math.floor(Math.random() * (maxsc - minsc + 1)) + 60;
            const ttltimes = timess / 60;
            const numb = ttltimes.toString().slice(0,4)
            const rNumb = parseFloat(numb);
            logToTextarea("Scrolling page article for random range " + rNumb + " minute 🕐");
            while (Date.now() - startTimes < timess * 1000) {
                await page.evaluate(() => {
                    window.scrollBy(0, 100);
                });
                await page.sleep(3000);
                await page.evaluate(() => {
                    window.scrollBy(0, -10);
                });
                await page.sleep(3000);
    
            }
        }

        if (directLinks) {
            try {
                await page.goto(keyword, { timeout: 10000 });
              } catch (error) {
                if (error.name === "TimeoutError") {
                  await page.reload();
                } else {
                  logToTextarea("An error occurred:", error);
                }
              }
            logToTextarea("Go to " + keyword);
            await page.sleep(30000);
            const startTimes = Date.now();
            const minsc = scrollmins * 60;
            const maxsc = scrollmaxs * 60;
            const timess = Math.floor(Math.random() * (maxsc - minsc + 1)) + 60;
            const ttltimes = timess / 60;
            const numb = ttltimes.toString().slice(0,4)
            const rNumb = parseFloat(numb);
            logToTextarea("Scrolling page article for random range " + rNumb + " minute 🕐");
            while (Date.now() - startTimes < timess * 1000) {
                await page.evaluate(() => {
                    window.scrollBy(0, 100);
                });
                await page.sleep(3000);
                await page.evaluate(() => {
                    window.scrollBy(0, -10);
                });
                await page.sleep(3000);
            }
        }
        if (recentPosts) {
            logToTextarea("Klik Recent Posts");
            const postLinks = await page.$$('#recent-posts-2 ul li a');
            const randomIndex = Math.floor(Math.random() * postLinks.length);
            const randomLink = postLinks[randomIndex];
            await page.waitForTimeout(500);
            randomLink.click(),
            page.sleep(30000)
            logToTextarea("Klik Recent Posts Found ✅");
            //await page.reload();
            const starttTimes = Date.now();
            const miscs = scrollmins * 60;
            const maxscs = scrollmaxs * 69;
            const ttimes = Math.floor(Math.random() * (maxscs - miscs + 1)) + 60;
            const cossfe = ttimes / 60;
            const numb = cossfe.toString().slice(0,4)
            const rNumb = parseFloat(numb);
            logToTextarea("Scrolling page article for random range " + rNumb + " minute 🕐");
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

                        const startTimes = Date.now();
                        const minsc = scrollminAdss * 60;
                        const maxsc = scrollmaxAdss * 60;
                        const timess = Math.floor(Math.random() * (maxsc - minsc + 1)) + 60;
                        const ttltimes = timess / 60;
                        logToTextarea("Scrolling page ads for random range " + ttltimes + " minute 🕐");
                        while (Date.now() - startTimes < timess * 1000) {
                            await page.evaluate(() => {
                                window.scrollBy(0, 100);
                            });
                            await page.sleep(3000);
                            await page.evaluate(() => {
                                window.scrollBy(0, -10);
                            });
                            await page.sleep(3000);

                        }

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

                        const startTimes = Date.now();
                        const minsc = scrollminAdss * 60;
                        const maxsc = scrollmaxAdss * 60;
                        const timess = Math.floor(Math.random() * (maxsc - minsc + 1)) + 60;
                        const ttltimes = timess / 60;
                        logToTextarea("Scrolling page ads for random range " + ttltimes + " minute 🕐");
                        while (Date.now() - startTimes < timess * 1000) {
                            await page.evaluate(() => {
                                window.scrollBy(0, 100);
                            });
                            await page.sleep(3000);
                            await page.evaluate(() => {
                                window.scrollBy(0, -10);
                            });
                            await page.sleep(3000);

                        }

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

                        const startTimes = Date.now();
                        const minsc = scrollminAdss * 60;
                        const maxsc = scrollmaxAdss * 60;
                        const timess = Math.floor(Math.random() * (maxsc - minsc + 1)) + 60;
                        const ttltimes = timess / 60;
                        logToTextarea("Scrolling page ads for random range " + ttltimes + " minute 🕐");
                        while (Date.now() - startTimes < timess * 1000) {
                            await page.evaluate(() => {
                                window.scrollBy(0, 100);
                            });
                            await page.sleep(3000);
                            await page.evaluate(() => {
                                window.scrollBy(0, -10);
                            });
                            await page.sleep(3000);

                        }

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

                        const startTimes = Date.now();
                        const minsc = scrollminAdss * 60;
                        const maxsc = scrollmaxAdss * 60;
                        const timess = Math.floor(Math.random() * (maxsc - minsc + 1)) + 60;
                        const ttltimes = timess / 60;
                        logToTextarea("Scrolling page ads for random range " + ttltimes + " minute 🕐");
                        while (Date.now() - startTimes < timess * 1000) {
                            await page.evaluate(() => {
                                window.scrollBy(0, 100);
                            });
                            await page.sleep(3000);
                            await page.evaluate(() => {
                                window.scrollBy(0, -10);
                            });
                            await page.sleep(3000);

                        }
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
const main = async (logToTextarea, keywordFilePath, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys) => {
    try {
        const data = fs.readFileSync(keywordFilePath, 'utf-8')
        const lines = data.split('\n');

        for (let x = 0; x < loops; x++) {
            logToTextarea("Loop " + x);
            logToTextarea("\n===========================");

            for (let y = 0; y < lines.length; y++) {
                const line = lines[y];
                const [keyword, domain, ] = line.trim().split(';');

                logToTextarea("Thread #" + (y + 1));
                await startProccess(keyword, domain, logToTextarea, googleSearchs, directLinks, visitAdss, proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys);
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