// company-jobs.js - simple client-side manager for company job postings (localStorage)
const STORAGE_KEY = 'primerpaso_company_jobs';

function loadJobs() {
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

function saveJobs(jobs){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function renderDashboard(){
  const el = document.getElementById('jobsList');
  if(!el) return;
  const allJobs = loadJobs();
  const companyRaw = localStorage.getItem('primerpaso_company');
  const company = companyRaw ? JSON.parse(companyRaw) : null;
  if(!company){
    el.innerHTML = `<div class="empty"><strong>No estás autenticado como empresa</strong><p class="muted">Inicia sesión como empresa para ver y publicar vacantes.</p></div>`;
    return;
  }
  const jobs = (allJobs || []).filter(j=>String(j.ownerId)===String(company.id));
  if(!jobs || jobs.length===0){
    el.innerHTML = `<div class="empty"><strong>No hay vacantes</strong><p class="muted">Crea tu primera vacante con "Publicar Nueva Vacante".</p></div>`;
    return;
  }
  const lines = jobs.slice().reverse().map(j=>{
    return `
      <div class="job-card">
        <div>
          <h3 style="margin:0">${escapeHtml(j.title)}</h3>
          <div class="job-meta">${j.location || 'Remoto / Indeterminado'} · ${j.job_type || ''} · <strong>${j.status}</strong></div>
          <p style="margin:8px 0 0;color:#333">${escapeHtml((j.description||'').slice(0,200))}${(j.description||'').length>200? '...':''}</p>
        </div>
        <div class="job-actions">
          <a class="btn ghost" href="/company-jobs/new?edit=${j.id}">Editar</a>
          <button class="btn" data-id="${j.id}" data-action="toggle">${j.status==='published'?'Despublicar':'Publicar'}</button>
          <button class="btn ghost" data-id="${j.id}" data-action="delete">Eliminar</button>
        </div>
      </div>`;
  }).join('');
  el.innerHTML = lines;
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function handleDashboardClick(e){
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');
  if(!id || !action) return;
  let jobs = loadJobs();
  const idx = jobs.findIndex(x=>String(x.id)===String(id));
  if(idx===-1) return;
  if(action==='delete'){
    if(!confirm('Eliminar esta vacante?')) return;
    jobs.splice(idx,1);
    saveJobs(jobs);
    renderDashboard();
  } else if(action==='toggle'){
    const job = jobs[idx];
    job.status = job.status==='published' ? 'draft' : 'published';
    saveJobs(jobs);
    renderDashboard();
  }
}

function initForm(){
  const form = document.getElementById('jobForm');
  if(!form) return;
  // populate if edit query param
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  if(editId){
    const jobs = loadJobs();
    const companyRaw = localStorage.getItem('primerpaso_company');
    const company = companyRaw ? JSON.parse(companyRaw) : null;
    const job = jobs.find(j=>String(j.id)===String(editId) && (!company || String(j.ownerId)===String(company.id)));
    if(job){
      form.title.value = job.title || '';
      form.description.value = job.description || '';
      form.requirements.value = (job.requirements||[]).join(', ');
      form.job_type.value = job.job_type || 'full_time';
      form.location.value = job.location || '';
      form.salary.value = job.salary || '';
      form.apply_link.value = job.apply_link || '';
      form.dataset.editId = job.id;
    }
  }

  document.getElementById('saveDraft').addEventListener('click', ()=>submit('draft'));
  document.getElementById('publish').addEventListener('click', ()=>submit('published'));

  function submit(status){
    const jobs = loadJobs();
    const data = {
      id: form.dataset.editId ? form.dataset.editId : Date.now(),
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      requirements: form.requirements.value.split(',').map(s=>s.trim()).filter(Boolean),
      job_type: form.job_type.value,
      location: form.location.value.trim(),
      salary: form.salary.value.trim(),
      apply_link: form.apply_link.value.trim(),
      // associate with logged company if present
      ownerId: (function(){ try{ const c=JSON.parse(localStorage.getItem('primerpaso_company')||'null'); return c && c.id ? c.id : null }catch(e){return null} })(),
      status
    };
    // validation minimal
    if(!data.title){ alert('El título es requerido'); return; }
    if(!data.description){ alert('La descripción es requerida'); return; }

    // replace if exists
  const idx = jobs.findIndex(x=>String(x.id)===String(data.id));
    if(idx===-1) jobs.push(data); else jobs[idx]=data;
    saveJobs(jobs);
    // redirect to dashboard after publish or save
    window.location.href = '/company-dashboard';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  // render dashboard if present
  if(document.getElementById('jobsList')){
    renderDashboard();
    document.getElementById('jobsList').addEventListener('click', handleDashboardClick);
  }
  // init form on new page
  initForm();
});
