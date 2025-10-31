document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Mostrar mensaje de éxito si vienes de la página de registro
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
    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // API returns { user, profile } now. Store a merged student object for the demo client.
        const studentData = Object.assign({}, data.profile || {}, { id: data.user?.id, email: data.user?.email });
        localStorage.setItem('primerpaso_student', JSON.stringify(studentData));
        window.location.href = '/integradora'; // Redirigir al dashboard
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Hubo un problema al conectar con el servidor.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Iniciar sesión';
    }
  });
});
