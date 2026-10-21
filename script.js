
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const html = document.documentElement;

  // Elementos do tema
  const themeButtons = document.querySelectorAll(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  // Elementos do menu mobile
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  // Elementos da navegação
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPage = document.getElementById("current-page");

  const pageNames = {
    inicio: "Início",
    materiais: "Materiais",
    sobre: "Sobre o autor"
  };

  /* =====================================
     1. Tema claro e escuro
  ===================================== */

  function getSavedTheme() {
    try {
      const savedTheme = localStorage.getItem("portal-theme");

      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch (error) {
      console.warn("Não foi possível ler a preferência de tema.", error);
    }

    return "light";
  }

  function applyTheme(theme) {
    const validTheme = theme === "dark" ? "dark" : "light";

    // Mantém HTML e body sincronizados.
    html.dataset.theme = validTheme;
    body.dataset.theme = validTheme;

    const isDark = validTheme === "dark";

    // Atualiza todos os ícones de tema.
    themeButtons.forEach((button) => {
      const icon = button.querySelector("i");

      if (icon) {
        icon.classList.toggle("fa-sun", isDark);
        icon.classList.toggle("fa-moon", !isDark);
      }

      button.setAttribute(
        "aria-label",
        isDark ? "Ativar tema claro" : "Ativar tema escuro"
      );

      button.setAttribute(
        "title",
        isDark ? "Ativar tema claro" : "Ativar tema escuro"
      );
    });

    // Atualiza a cor da interface do navegador em dispositivos móveis.
    if (themeMeta) {
      themeMeta.setAttribute(
        "content",
        isDark ? "#121212" : "#ffffff"
      );
    }

    try {
      localStorage.setItem("portal-theme", validTheme);
    } catch (error) {
      console.warn("Não foi possível salvar a preferência de tema.", error);
    }
  }

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme =
        body.dataset.theme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);
    });
  });

  // Restaura a preferência ao carregar a página.
  applyTheme(getSavedTheme());

  /* =====================================
     2. Menu hambúrguer
  ===================================== */

  function openMenu() {
    body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu de navegação");

    const icon = menuToggle.querySelector("i");

    if (icon) {
      icon.classList.replace("fa-bars", "fa-xmark");
    }

    overlay.hidden = false;
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu de navegação");

    const icon = menuToggle.querySelector("i");

    if (icon) {
      icon.classList.replace("fa-xmark", "fa-bars");
    }

    overlay.hidden = true;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.contains("menu-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Fecha o menu ao clicar no fundo.
  overlay.addEventListener("click", closeMenu);

  // Fecha o menu ao selecionar uma seção.
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Permite fechar o menu com a tecla Escape.
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      body.classList.contains("menu-open")
    ) {
      closeMenu();
      menuToggle.focus();
    }
  });

  // Evita que o menu mobile fique aberto após mudar para desktop.
  const mobileQuery = window.matchMedia("(min-width: 761px)");

  mobileQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });

  /* =====================================
     3. Navegação e seção ativa
  ===================================== */

  const sections = document.querySelectorAll(
    "#inicio, #materiais, #sobre"
  );

  function setActiveSection(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (currentPage && pageNames[sectionId]) {
      currentPage.textContent = pageNames[sectionId];
    }
  }

  // Compatibilidade com navegadores sem IntersectionObserver.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const sectionId = link.getAttribute("href").slice(1);
        setActiveSection(sectionId);
      });
    });
  }

  // Inicializa a navegação de acordo com a URL.
  const initialSection = window.location.hash.slice(1);

  if (pageNames[initialSection]) {
    setActiveSection(initialSection);
  } else {
    setActiveSection("inicio");
  }

  /* =====================================
     4. Estado inicial do menu
  ===================================== */

  closeMenu();
});
