// newsletter.js
// Este archivo debe ser incluido en tu pagina HTML

const initNewsletter = () => {
  const newsletterBtn = document.getElementById('newsletter-btn');
  const newsletterEmail = document.getElementById('newsletter-email');
  
  if (!newsletterBtn || !newsletterEmail) {
    console.log('Elementos del newsletter no encontrados');
    return;
  }
  
  newsletterBtn.addEventListener('click', async function() {
    const email = newsletterEmail.value.trim();
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      if (typeof Swal !== 'undefined') {
        Swal.fire('Email invalido', 'Por favor ingresa un correo valido', 'error');
      } else {
        alert('Por favor ingresa un email valido');
      }
      return;
    }
    
    const btnOriginal = this.innerHTML;
    this.innerHTML = 'Enviando...';
    this.disabled = true;
    
    try {
      const response = await fetch('https://luxe-api-frr5.onrender.com/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });
      
      const resultado = await response.json();
      
      if (resultado.exito) {
        if (typeof Swal !== 'undefined') {
          Swal.fire('Bienvenida al Club Luxe', 'Recibiras ofertas exclusivas en tu correo', 'success');
        } else {
          alert('Bienvenida al Club Luxe. Revisa tu correo.');
        }
        newsletterEmail.value = '';
      } else {
        throw new Error(resultado.error || 'Error al suscribir');
      }
    } catch (error) {
      console.error('Error:', error);
      if (typeof Swal !== 'undefined') {
        Swal.fire('Error', 'No se pudo procesar la suscripcion. Intenta mas tarde.', 'error');
      } else {
        alert('Error al suscribir. Intenta nuevamente.');
      }
    } finally {
      this.innerHTML = btnOriginal;
      this.disabled = false;
    }
  });
};

const initConfirmacionCompra = (emailCliente, datosCompra) => {
  fetch('https://luxe-api-frr5.onrender.com/api/confirmar-compra', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emailCliente: emailCliente,
      datosCompra: datosCompra
    })
  })
  .then(response => response.json())
  .then(resultado => {
    if (resultado.exito) {
      console.log('Correo de confirmacion enviado');
    } else {
      console.error('Error al enviar confirmacion:', resultado.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsletter);
} else {
  initNewsletter();
}