// Admin login credentials
const adminUsername = 'anonsukanenencwe';
const adminPassword = 'anondongyahahpler';

// Login function (dipakai di index.html)
function login(){
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  if(u === adminUsername && p === adminPassword){
    localStorage.setItem('role','admin');
    window.location.href='admin.html';
  } else {
    // User biasa
    localStorage.setItem('role','user');
    localStorage.setItem('username', u);

    let users = JSON.parse(localStorage.getItem('users')) || {};
    if(users[u]){
      localStorage.setItem('createLeft', users[u].createLeft);
      localStorage.setItem('maxRAM', users[u].maxRAM);
    } else {
      localStorage.setItem('createLeft', '1'); // default
      localStorage.setItem('maxRAM', 'UNLIMITED');
    }
    window.location.href='dashboard.html';
  }
}

// Simpan limit default
function saveLimit(){
  const limit = document.getElementById('userLimit').value;
  localStorage.setItem('userLimit', limit);
  alert('Limit default tersimpan: ' + limit);
}

// Simpan semua user di LocalStorage
if(!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify({}));

// Create User baru
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

// Cek server offline di setiap halaman
window.addEventListener('load', ()=>{
  if(localStorage.getItem('serverOffline') === 'true'){
    document.body.innerHTML = "<h1 style='text-align:center;margin-top:100px;'>MAAF SERVER DALAM PENGEMBANGAN SILAHKAN COBA LAGI</h1>";
  }
});

// Create Panel untuk user (dipakai di create.html)
function createPanel(){
  let left = parseInt(localStorage.getItem('createLeft'));
  if(left <= 0){ alert('Limit create habis!'); return; }

  const usernamePanel = document.getElementById('panelUsername').value;
  const ram = document.getElementById('panelRAM').value;
  const password = Math.random().toString(36).slice(-10);

  // Validasi RAM sesuai limit user
  let maxRAM = localStorage.getItem('maxRAM') || 'UNLIMITED';
  if(maxRAM !== 'UNLIMITED'){
    const ramNum = parseInt(ram);
    const maxRamNum = parseInt(maxRAM);
    if(ramNum > maxRamNum){
      alert('RAM yang dipilih melebihi limit yang diberikan admin!');
      return;
    }
  }

  // Panggil API Ptroduclty
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

// Load Success Page
function loadSuccess(){
  const data = JSON.parse(localStorage.getItem('lastCreated'));
  document.getElementById('successUsername').innerText = data.username;
  document.getElementById('successPassword').innerText = data.password;
  document.getElementById('successRAM').innerText = data.ram;
  document.getElementById('createLeft').innerText = localStorage.getItem('createLeft');
}

// Button Go to Panel
function goToPanel(){
  window.open(`https://${config.domain}/login`,'_blank');
}

// Load username & createLeft di halaman dashboard / create
if(document.getElementById('userDisplay')) document.getElementById('userDisplay').innerText = localStorage.getItem('username');
if(document.getElementById('createLeft')) document.getElementById('createLeft').innerText = localStorage.getItem('createLeft');
if(document.getElementById('successUsername')) loadSuccess();
