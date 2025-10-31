// company-login.js - client handler for company login using API
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('companyLoginForm');
  if (!form) return;

  // show success message if redirected after signup
  const params = new URLSearchParams(window.location.search);
  if (params.get('status') === 'success') {
    const successMessage = document.createElement('p');
    successMessage.textContent = '¡Cuenta creada! Ahora puedes iniciar sesión.';
    successMessage.style.color = 'green';
    successMessage.style.textAlign = 'center';
    successMessage.style.marginBottom = '1rem';
    form.prepend(successMessage);
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Iniciando sesión...'; }

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/auth/login', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        // Expect { user, profile } and role === 'company'
        if (data.user && data.user.role === 'company') {
          const companyData = Object.assign({}, data.profile || {}, { id: data.user.id, email: data.user.email });
          try { localStorage.setItem('primerpaso_company', JSON.stringify(companyData)); } catch (e) {}
          window.location.href = '/company-dashboard';
        } else {
          alert('La cuenta no es de tipo empresa.');
        }
      } else {
        const err = await response.json();
        alert(err.message || 'Credenciales inválidas');
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Iniciar sesión'; }
    }
  });
});
