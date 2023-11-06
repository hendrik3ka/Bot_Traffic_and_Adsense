const {
  ipcRenderer
} = require('electron');
const startButton = document.getElementById('startBot');
const stopButton = document.getElementById('stop');
const googleSearch  = document.getElementById('google_search');
const directLink = document.getElementById('direct_link');
const visitAds = document.getElementById('visit_ads');
const keywordFileInput = document.getElementById('keywordFile');
const proxyCheckBox = document.getElementById("proxyC")
const proxy = document.getElementById("proxy")
const desktop = document.getElementById('desktop');
const android = document.getElementById('android');
const iphone = document.getElementById('iphone');
const random = document.getElementById('random');
const whoer = document.getElementById('whoer');
const headlessCheckbox = document.getElementById('headless');
const recentPost = document.getElementById('recent_post');
const loop = document.getElementById('loop');
const scrollmin = document.getElementById('scrollmin');
const scrollmax = document.getElementById('scrollmax');
const scrollminAds = document.getElementById('scrollminAds');
const scrollmaxAds = document.getElementById('scrollmaxAds');
const captchaApiKey = document.getElementById("captchaApiKey")
const version = document.getElementById('version')
const warp = document.getElementById('warp');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const loaderDownload = document.getElementById('warp-loader')

document.addEventListener('change', () => {
  if (proxyCheckBox.checked) {
    proxy.disabled=false
  } else {
    proxy.disabled=true
    
  }
})


startButton.addEventListener('click', () => {
  const keywordFilePath = keywordFileInput.files[0]?.path;
  if (keywordFilePath == undefined) {
    keywordFileInput.style.border = '1px solid red'
    return;
  } 

  const googleSearchs = googleSearch.checked
  const directLinks = directLink.checked
  const visitAdss = visitAds.checked
 
  const proxyC = proxyCheckBox.checked
  const proxys = proxy.value
  const desktops = desktop.checked
  const androids = android.checked
  const iphones = iphone.checked
  const randoms = random.checked
  const whoers = whoer.checked
  const view = headlessCheckbox.checked ? false : 'new';
  const recentPosts = recentPost.checked
  const loops = loop.value
  const scrollmins = scrollmin.value
  const scrollmaxs = scrollmax.value
  const scrollminAdss = scrollminAds.value
  const scrollmaxAdss = scrollmaxAds.value
  const captchaApiKeys = captchaApiKey.value
  
  ipcRenderer.send('button-click', keywordFilePath, googleSearchs, directLinks, visitAdss,  proxyC, proxys, desktops, androids, iphones, randoms, whoers, view, recentPosts, loops, scrollmins, scrollmaxs, scrollminAdss, scrollmaxAdss, captchaApiKeys);
});
stopButton.addEventListener('click', () => {
  if (confirm("Realy want to stop the proccess ?") == true) {
      ipcRenderer.send('stop');
  }
});

// reload.addEventListener('click', () => {
//   ipcRenderer.send('reload')
// })

ipcRenderer.on('log', (event, logs) => {
  const logTextarea = document.getElementById('log');
  logTextarea.value = logs;
  logTextarea.scrollTop = logTextarea.scrollHeight;
});


const all =[
googleSearch,
directLink,
visitAds,
keywordFileInput,
proxyCheckBox,
proxy,
desktop,
android,
iphone,
random,
whoer,
headlessCheckbox,
recentPost,
loop,
scrollmin,
scrollmax,
scrollminAds,
scrollmaxAds,
captchaApiKey,
]

ipcRenderer.on('run',()=>{
  all.forEach((e)=>{
    e.disabled=true
  })
})
ipcRenderer.on('foor',()=>{
  all.forEach((e)=>{
    e.disabled=false
  })
})

let updateProgress = 0;

ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    version.innerText = 'v' + arg.version;
});

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'A new update is available. Downloading now...';
    warp.classList.remove('hidden');
    loaderDownload.classList.remove('hidden');
});

ipcRenderer.on('update_progress', (event, progress) => {
    updateProgress = progress;
    const progsDown = document.getElementById('download-progress')
    progsDown.style.width = updateProgress + '%'
    progsDown.setAttribute('aria-valuenow', updateProgress)
});

ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('hidden');
    warp.classList.remove('hidden');

    loaderDownload.classList.add('hidden');
});

restartButton.addEventListener("click", (e) => {
    ipcRenderer.send('restart_app');
})

