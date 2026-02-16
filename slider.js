let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

/*MOSTRAR SLIDE*/
function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));

  slides[index].classList.add("active");
}

/* SIGUIENTE*/
function nextSlide() {
  currentSlide++;

  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  showSlide(currentSlide);
}

/* ANTERIOR*/

function prevSlide() {
  currentSlide--;

  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  }

  showSlide(currentSlide);
}

/* AUTO SLIDER*/

setInterval(() => {
  nextSlide();
}, 3000);
