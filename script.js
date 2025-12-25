import { config } from './config.js';

// Admin login
const adminUsername = 'anonsukanenencwe';
const adminPassword = 'anondongyahahpler';

// Login function
function login(){
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  if(u === adminUsername && p === adminPassword){
    localStorage.setItem('role','admin');
    window.location.href='admin.html';
  } else {
    localStorage.setItem('role','user');
    localStorage.setItem('username', u);

    let users = JSON.parse(localStorage.getItem('users')) || {};
    if(users[u]){
      localStorage.setItem('createLeft', users[u].createLeft);
      localStorage.setItem('maxRAM', users[u].maxRAM);
    } else {
      localStorage.setItem('createLeft', '1');
      localStorage.setItem('maxRAM', 'UNLIMITED');
    }
    window.location.href='dashboard.html';
  }
}

// Save default limit admin
function saveLimit(){
  const limit = document.getElementById('userLimit').value;
  localStorage.setItem('userLimit', limit);
  alert('Limit default tersimpan: ' + limit);
}

// Users storage
if(!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify({}));

// Create user
function createUser(){
  const username = document.getElementById('newUser').value;
  const limit = document.getElementById('newUserLimit').value;
  const ram = document.getElementById('newUserRAM').value;

  if(!username || !limit || !ram){
    alert('Isi semua data!');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users'));
  if(users[username]){
    alert('Username sudah ada!');
    return;
  }

  users[username] = {
    createLeft: parseInt(limit),
    maxRAM: ram
  };
  localStorage.setItem('users', JSON.stringify(users));
  alert('User berhasil dibuat: ' + username);
}

// OFF SERVER
function turnOffServer(){
  localStorage.setItem('serverOffline','true');
  alert('Server dimatikan!');
}

// Proteksi halaman & server offline
window.addEventListener('load', ()=>{
  if(localStorage.getItem('serverOffline') === 'true'){
    document.body.innerHTML = "<h1 style='text-align:center;margin-top:100px;'>MAAF SERVER DALAM PENGEMBANGAN SILAHKAN COBA LAGI</h1>";
    return;
  }

  const role = localStorage.getItem('role');
  const page = window.location.pathname.split("/").pop();

  if(page === 'dashboard.html' || page === 'create.html'){
    if(!role || role !== 'user'){
      alert('Akses ditolak. Silahkan login user dulu!');
      window.location.href = 'index.html';
    }
  }

  if(page === 'success.html'){
    if(!localStorage.getItem('lastCreated')){
      alert('Belum ada panel dibuat!');
      window.location.href = 'dashboard.html';
    }
  }

  // Load username & createLeft
  if(document.getElementById('userDisplay')) document.getElementById('userDisplay').innerText = localStorage.getItem('username');
  if(document.getElementById('createLeft')) document.getElementById('createLeft').innerText = localStorage.getItem('createLeft');

  // Load RAM options di create.html
  if(document.getElementById('panelRAM')) loadRamOptions();

  // Load success
  if(document.getElementById('successUsername')) loadSuccess();
});

// Load RAM sesuai limit user
function loadRamOptions(){
  const ramSelect = document.getElementById('panelRAM');
  if(!ramSelect) return;

  const maxRAM = localStorage.getItem('maxRAM') || 'UNLIMITED';
  const ramOptions = ['1GB','2GB','3GB','4GB','5GB','6GB','7GB','8GB','9GB','UNLIMITED'];

  ramSelect.innerHTML = '';
  for(let ram of ramOptions){
    if(maxRAM !== 'UNLIMITED'){
      const maxNum = parseInt(maxRAM);
      const ramNum = parseInt(ram);
      if(isNaN(ramNum) || ramNum > maxNum) continue;
    }
    const option = document.createElement('option');
    option.value = ram;
    option.innerText = ram;
    ramSelect.appendChild(option);
  }
}

// Dashboard: pergi ke create
function goCreate(){
  window.location.href='create.html';
}

// Create panel
function createPanel(){
  let left = parseInt(localStorage.getItem('createLeft'));
  if(left <= 0){ alert('Limit create habis!'); return; }

  const usernamePanel = document.getElementById('panelUsername').value;
  const ram = document.getElementById('panelRAM').value;
  const password = Math.random().toString(36).slice(-10);

  let maxRAM = localStorage.getItem('maxRAM') || 'UNLIMITED';
  if(maxRAM !== 'UNLIMITED'){
    const ramNum = parseInt(ram);
    const maxRamNum = parseInt(maxRAM);
    if(ramNum > maxRamNum){
      alert('RAM yang dipilih melebihi limit yang diberikan admin!');
      return;
    }
  }

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

// Success page
function loadSuccess(){
  const data = JSON.parse(localStorage.getItem('lastCreated'));
  document.getElementById('successUsername').innerText = data.username;
  document.getElementById('successPassword').innerText = data.password;
  document.getElementById('successRAM').innerText = data.ram;
  document.getElementById('createLeft').innerText = localStorage.getItem('createLeft');
}

// Button ke panel
function goToPanel(){
  window.open(`https://${config.domain}/login`,'_blank');
                                }
