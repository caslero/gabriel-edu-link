  window.addEventListener('load', () => {
    const chevron = document.querySelector('.chevron1');

    // Baja cerrado
    setTimeout(() => {
      chevron.classList.add('at-rest');
    }, 800);

    // Se abre
    setTimeout(() => {
      chevron.classList.add('open');
    }, 1400);
  });
  
animateLogo();
