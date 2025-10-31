// perfiluser.js - load and save student profile to localStorage (demo)
document.addEventListener('DOMContentLoaded', ()=>{
  const key = 'primerpaso_student';
  const form = document.getElementById('profileForm');
  if(!form) return;

  // populate from localStorage
  try{
    const raw = localStorage.getItem(key);
    if(raw){
      const data = JSON.parse(raw);
      for(const k in data){
        const el = document.getElementById(k);
        if(el) el.value = data[k];
      }
      // textareas
      if(document.getElementById('bio')) document.getElementById('bio').value = data.bio || '';
    }
  }catch(e){console.warn('Error reading profile', e)}

  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const fields = ['firstName','lastName','email','phone','university','degree','gradYear','skills','experience','linkedin','portfolio','bio'];
    const out = {};
    fields.forEach(f=>{ const el = document.getElementById(f); out[f]= el?.value || ''; });
    try{ localStorage.setItem(key, JSON.stringify(out)); }catch(e){ console.warn('Could not save profile', e) }
    // go back to dashboard
    window.location.href = '/integradora';
  });
});
