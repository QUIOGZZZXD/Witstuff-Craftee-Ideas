document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".testimonial-card");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    let current = 0;

    function showSlide(index) {
        cards.forEach((card, i) => {
            card.classList.toggle("active", i === index);
        });
    }

    nextBtn.addEventListener("click", () => {
        current = (current + 1) % cards.length;
        showSlide(current);
    });

    prevBtn.addEventListener("click", () => {
        current = (current - 1 + cards.length) % cards.length;
        showSlide(current);
    });

    setInterval(() => {
        current = (current + 1) % cards.length;
        showSlide(current);
    }, 5000);
});


document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".hero-content");
    const nextBtn = document.querySelector(".arrow.right");
    const prevBtn = document.querySelector(".arrow.left");
    let current = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
    }

    nextBtn.addEventListener("click", () => {
        current = (current + 1) % slides.length;
        showSlide(current);
    });

    prevBtn.addEventListener("click", () => {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    });

    setInterval(() => {
        current = (current + 1) % slides.length;
        showSlide(current);
    }, 8000);
});



document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".hero-slide");
    const nextBtn = document.querySelector(".right");
    const prevBtn = document.querySelector(".left");
    let current = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
    }

    nextBtn.addEventListener("click", () => {
        current = (current + 1) % slides.length;
        showSlide(current);
    });

    prevBtn.addEventListener("click", () => {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    });
});
