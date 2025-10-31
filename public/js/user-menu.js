// user-menu.js - populate quick actions and header avatar based on localStorage (demo-only)
const STUDENT_KEY = 'primerpaso_student';
const COMPANY_KEY = 'primerpaso_company';

function getInitials(name, last){
  const i = (name||'').trim().charAt(0) || '';
  const j = (last||'').trim().charAt(0) || '';
  return (i+j).toUpperCase();
}

function renderQuickActions(container, isCompany, profile){
  container.innerHTML = '';
  container.classList.add('show');
  container.setAttribute('aria-hidden','false');
  // Profile quick action
  const a1 = document.createElement('a');
  a1.className = 'qa-item';
  a1.href = isCompany ? '/company-login' : '/perfiluser';
  a1.innerHTML = `<span class="user-avatar" style="background:linear-gradient(135deg,#7c1d11,#4b2b88)">${getInitials(profile?.firstName, profile?.lastName)}</span><span>${profile?.firstName || (isCompany? 'Empresa':'Perfil')}</span>`;
  container.appendChild(a1);
  // Jobs quick action
  const a2 = document.createElement('a');
  a2.className='qa-item';
  a2.href='/jobsinterface';
  a2.textContent='Ofertas';
  container.appendChild(a2);
  // My applications
  const a3 = document.createElement('a');
  a3.className='qa-item';
  a3.href='/jobsinterface';
  a3.textContent='Mis postulaciones';
  container.appendChild(a3);
}

function replaceLoginWithAvatar(root, profile){
  // find .btn-login
  const btn = root.querySelector('.btn-login');
  if(!btn) return;
  const avatar = document.createElement('a');
  avatar.className = 'qa-item header-avatar';
  avatar.href = '/perfiluser';
  avatar.innerHTML = `<span class="user-avatar" style="background:linear-gradient(135deg,#7c1d11,#4b2b88)">${getInitials(profile?.firstName, profile?.lastName)}</span>`;
  btn.replaceWith(avatar);
}

function hideRegister(root){
  const reg = root.querySelector('.register-dropdown');
  if(reg) reg.remove();
}

document.addEventListener('DOMContentLoaded', ()=>{
  const container = document.getElementById('quickActions');
  const root = document.body;
  try{
    const rawStudent = localStorage.getItem(STUDENT_KEY);
    const rawCompany = localStorage.getItem(COMPANY_KEY);
    if(rawStudent){
      const profile = JSON.parse(rawStudent);
      renderQuickActions(container, false, profile);
      replaceLoginWithAvatar(root, profile);
      hideRegister(root);
    }else if(rawCompany){
      const profile = JSON.parse(rawCompany);
      renderQuickActions(container, true, profile);
      replaceLoginWithAvatar(root, profile);
      hideRegister(root);
    } else {
      // not logged: ensure quickActions hidden
      if(container){ container.classList.remove('show'); container.setAttribute('aria-hidden','true'); }
    }
  }catch(e){console.warn('user-menu error', e)}
});
