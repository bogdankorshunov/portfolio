const menuBtn = document.querySelector(".menu-btn");
const intro = document.querySelector(".intro");
const menuList = document.querySelector(".menu__list");
const header = document.querySelector(".header");
const mail = document.querySelector(".header__mail");
const previewProjects = document.querySelectorAll('.preview-projects__item');
const previewBtn = document.querySelectorAll('.preview-projects__btn');


menuBtn.addEventListener("click", function (e) {
  capture: true;
  const btn = e.target;
  btn.classList.toggle("close");
  menuList.classList.toggle("menu-show");
  if (btn.classList.contains("close")) {
    mail.style.filter = "blur(80px)";
    intro.style.filter = "blur(80px)";
    header.style.height = "0px";
    header.style.padding = "0";
    mail.style.background = "transparent";
    mail.style.transition = "all 1.1s ease";
    intro.style.transition = "all 1.1s ease";
  } else {
    header.style.height = "auto";
    header.style.padding = "20px 10px";
    intro.style.filter = "none";
    mail.style.filter = "none";
  }
});

// hover 3D
VanillaTilt.init(document.querySelectorAll(".preview-projects__item"), {
  max: 2,
  speed: 1000,
  scale: 1.01,
  perspective: 2000,
  glare: true,
  "max-glare": 0.4
});
