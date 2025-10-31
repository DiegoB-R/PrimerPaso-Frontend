// company-signup.js - demo handler for company signup
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('companySignupForm');
  if(!form) return;
  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const name = document.getElementById('companyName')?.value || '';
    const email = document.getElementById('companyEmail')?.value || '';
    try{ localStorage.setItem('primerpaso_company', JSON.stringify({ name, email })); }catch(e){}
    // Redirect to demo company area
    window.location.href = '/integradora';
  });
});
