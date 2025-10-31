/**
 * user-menu.js
 *
 * Gestiona la visibilidad del menú de usuario y el de invitado.
 * Si el usuario ha iniciado sesión (datos en localStorage),
 * muestra el menú de usuario con sus iniciales y gestiona el logout.
 */
document.addEventListener('DOMContentLoaded', () => {
  const guestMenu = document.getElementById('guestMenu');
  const userMenu = document.getElementById('userMenu');
  const userAvatar = document.getElementById('userAvatar');
  const userIcon = document.getElementById('userIcon');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!guestMenu || !userMenu || !userAvatar || !logoutBtn) {
    console.warn('Elementos del menú no encontrados. El script no se ejecutará.');
    return;
  }

  try {
    const studentData = localStorage.getItem('primerpaso_student');

    if (studentData) {
      // Usuario ha iniciado sesión
      guestMenu.classList.add('hidden');
      userMenu.classList.remove('hidden');

      const student = JSON.parse(studentData);
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';

      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

      if (initials.trim() && userAvatar) {
        userAvatar.textContent = initials;
      } else if (userIcon) {
        // Si no hay iniciales, muestra el icono genérico
        userAvatar.style.display = 'none';
        userIcon.style.display = 'block';
      }

      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('primerpaso_student');
        localStorage.removeItem('primerpaso_saved_jobs'); // Limpiar también ofertas guardadas
        window.location.href = '/'; // Redirigir al inicio
      });
    }
    // Si no hay studentData, los menús se quedan como están (invitado visible, usuario oculto).
  } catch (error) {
    console.error('Error al procesar los datos de sesión:', error);
    // En caso de error (ej. JSON malformado), no hacer nada y dejar el menú de invitado.
  }
});