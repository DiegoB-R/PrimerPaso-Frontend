// signup.js - handle student signup locally (demo)
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Creando cuenta...';

    const formData = new FormData(form);

    try{
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Si el registro es exitoso, redecidir según el role devuelto por la API (company -> company-login)
        try{
          const data = await response.json();
          const role = data.user?.role || (formData.get('role') || 'student');
          if (role === 'company') {
            window.location.href = '/company-login?status=success';
          } else {
            window.location.href = '/loginuser?status=success';
          }
        }catch(e){
          // fallback: si no devuelve JSON, usar el campo role del formulario
          const role = formData.get('role') || 'student';
          if (role === 'company') window.location.href = '/company-login?status=success';
          else window.location.href = '/loginuser?status=success';
        }
      } else {
        // Try to show a friendly, non-technical message to the user.
        let msg = 'Ocurrió un error al crear la cuenta. Intenta nuevamente.';
        try{
          const errorData = await response.json();
          if (response.status === 409) {
            msg = 'Ya existe una cuenta con ese correo. Intenta iniciar sesión o recuperar la contraseña.';
          } else if (errorData && errorData.message) {
            // avoid showing raw DB/stack messages to the user
            const lower = (errorData.message || '').toLowerCase();
            if (lower.includes('email') && lower.includes('exist')) {
              msg = 'Ya existe una cuenta con ese correo.';
            } else {
              msg = 'Ocurrió un error al crear la cuenta. Intenta nuevamente.';
            }
          }
        }catch(e){
          // ignore JSON parse errors and use generic message
        }
        alert(msg);
      }
    } catch (error) {
      console.error('Error de red o al enviar el formulario:', error);
      alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Crear cuenta';
    }
  });
});
  document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('signupForm');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');

    function setFieldError(input, msg){
      if(!input) return;
      let el = input.nextElementSibling;
      if(!el || !el.classList || !el.classList.contains('field-error')){
        el = document.createElement('div');
        el.className = 'field-error';
        el.style.color = 'crimson';
        el.style.fontSize = '0.9rem';
        el.style.marginTop = '4px';
        input.parentNode.insertBefore(el, input.nextSibling);
      }
      el.textContent = msg || '';
    }

    function clearFieldError(input){
      if(!input) return;
      const el = input.nextElementSibling;
      if(el && el.classList && el.classList.contains('field-error')) el.textContent = '';
    }

    function validateForm(){
      let ok = true;
      const email = form.querySelector('[name="email"]');
      const password = form.querySelector('[name="password"]');
      const confirm = form.querySelector('[name="confirmPassword"]');
      const role = (form.querySelector('[name="role"]') || {}).value || 'student';
      const nameField = form.querySelector('[name="name"]');

      // basic required checks
      if(email && !email.value.trim()) { setFieldError(email, 'El email es requerido'); ok = false; } else clearFieldError(email);
      if(password && password.value.length < 8) { setFieldError(password, 'La contraseña debe tener al menos 8 caracteres'); ok = false; } else clearFieldError(password);
      if(confirm && password && confirm.value !== password.value) { setFieldError(confirm, 'Las contraseñas no coinciden'); ok = false; } else clearFieldError(confirm);

      if(role === 'company'){
        if(nameField && !nameField.value.trim()){ setFieldError(nameField, 'El nombre de la empresa es obligatorio'); ok = false; } else clearFieldError(nameField);
      }

      return ok;
    }

    // attach realtime validation
    ['input','change'].forEach(ev => {
      form.addEventListener(ev, (e) => {
        const t = e.target;
        if(!t) return;
        if(t.name === 'password' || t.name === 'confirmPassword' || t.name === 'email' || t.name === 'name'){
          validateForm();
        }
        clearFieldError(t);
      });
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if(!validateForm()) return;

      submitButton.disabled = true;
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Creando cuenta...';

      const formData = new FormData(form);

      try{
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          body: formData,
        });

  if (response.ok) {
          try{
            const data = await response.json();
            const role = data.user?.role || (formData.get('role') || 'student');
            if (role === 'company') {
              window.location.href = '/company-login?status=success';
            } else {
              window.location.href = '/loginuser?status=success';
            }
          }catch(e){
            const role = formData.get('role') || 'student';
            if (role === 'company') window.location.href = '/company-login?status=success';
            else window.location.href = '/loginuser?status=success';
          }
        } else {
          // friendly, non-technical messages for common failure modes
          let msg = 'Ocurrió un error al crear la cuenta. Intenta nuevamente.';
          try{
            const errorData = await response.json();
            if (response.status === 409) {
              msg = 'Ya existe una cuenta con ese correo. Intenta iniciar sesión o recuperar la contraseña.';
            } else if (errorData && errorData.message) {
              const lower = (errorData.message || '').toLowerCase();
              if (lower.includes('email') && lower.includes('exist')) {
                msg = 'Ya existe una cuenta con ese correo.';
              }
            }
          }catch(e){ /* ignore */ }
          alert(msg);
        }
      } catch (error) {
        console.error('Error de red o al enviar el formulario:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText || 'Crear cuenta';
      }
    });
  });
