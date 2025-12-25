import { config } from './config.js';

function login(){
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if(u === 'admin' && p === '12345'){
    localStorage.setItem('role','admin');
    window.location.href='admin.html';
  } else {
    localStorage.setItem('role','user');
    localStorage.setItem('username', u);
    if(!localStorage.getItem('createLeft')) localStorage.setItem('createLeft', '1');
    window.location.href='dashboard.html';
  }
}

function saveLimit(){
  const limit = document.getElementById('userLimit').value;
  localStorage.setItem('userLimit', limit);
  alert('Limit tersimpan: '+limit);
}

function goCreate(){
  window.location.href='create.html';
  document.getElementById('userDisplay').innerText = localStorage.getItem('username');
}

function createPanel(){
  let left = parseInt(localStorage.getItem('createLeft'));
  if(left <= 0){ alert('Limit create habis!'); return; }

  const usernamePanel = document.getElementById('panelUsername').value;
  const ram = document.getElementById('panelRAM').value;
  const password = Math.random().toString(36).slice(-10);

  fetch(`https://${config.domain}/api/client/servers`,{
    method:'POST',
    headers:{
      'Authorization':'Bearer '+config.pltc,
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      name: usernamePanel,
      egg: config.eggs,
      location: config.loc,
      user: localStorage.getItem('username'),
      ram: ram,
      password: password
    })
  }).then(res=>res.json()).then(data=>{
    localStorage.setItem('createLeft', left-1);
    localStorage.setItem('lastCreated', JSON.stringify({username: usernamePanel,password,ram}));
    window.location.href='success.html';
  }).catch(err=>alert('Error create panel'));
}

function loadSuccess(){
  const data = JSON.parse(localStorage.getItem('lastCreated'));
  document.getElementById('successUsername').innerText = data.username;
  document.getElementById('successPassword').innerText = data.password;
  document.getElementById('successRAM').innerText = data.ram;
  document.getElementById('createLeft').innerText = localStorage.getItem('createLeft');
}

function goToPanel(){
  window.open(`https://${config.domain}/login`,'_blank');
}

if(document.getElementById('userDisplay')) document.getElementById('userDisplay').innerText = localStorage.getItem('username');
if(document.getElementById('createLeft')) document.getElementById('createLeft').innerText = localStorage.getItem('createLeft');
if(document.getElementById('successUsername')) loadSuccess();
