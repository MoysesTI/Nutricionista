/**
 * Mariana Santos Nutricionista - JavaScript Principal
 * Funcionalidades: Menu mobile, formulário, animações e interações
 */

// Configurações globais
const CONFIG = {
  whatsappNumber: "5511999999999",
  emailAddress: "contato@marianasantos.com",
  animationDuration: 300,
  scrollOffset: 80,
};

// Utilitários
const Utils = {
  // Debounce para otimizar performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle para scroll events
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Sanitizar strings para URLs
  sanitizeString(str) {
    return str
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar telefone brasileiro
  isValidPhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  // Formatar telefone
  formatPhone(phone) {
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  },
};

// Gerenciamento do Menu Mobile
class MobileMenu {
  constructor() {
    this.toggle = document.getElementById("navToggle");
    this.menu = document.getElementById("navMenu");
    this.links = document.querySelectorAll(".nav__link");
    this.isOpen = false;

    this.init();
  }

  init() {
    if (this.toggle && this.menu) {
      this.toggle.addEventListener("click", () => this.toggleMenu());

      // Fechar menu ao clicar nos links
      this.links.forEach((link) => {
        link.addEventListener("click", () => this.closeMenu());
      });

      // Fechar menu ao clicar fora
      document.addEventListener("click", (e) => {
        if (!this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Fechar menu no resize
      window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) {
          this.closeMenu();
        }
      });
    }
  }

  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.menu.classList.add("active");
    this.toggle.classList.add("active");
    document.body.style.overflow = "hidden";
    this.isOpen = true;

    // Animar spans do hamburger
    const spans = this.toggle.querySelectorAll("span");
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
  }

  closeMenu() {
    this.menu.classList.remove("active");
    this.toggle.classList.remove("active");
    document.body.style.overflow = "";
    this.isOpen = false;

    // Resetar spans do hamburger
    const spans = this.toggle.querySelectorAll("span");
    spans.forEach((span) => {
      span.style.transform = "";
      span.style.opacity = "";
    });
  }
}

// Gerenciamento do Header Scroll
class HeaderManager {
  constructor() {
    this.header = document.querySelector(".header");
    this.lastScrollTop = 0;
    this.scrollThreshold = 100;

    this.init();
  }

  init() {
    if (this.header) {
      window.addEventListener(
        "scroll",
        Utils.throttle(() => {
          this.handleScroll();
        }, 16)
      );
    }
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Adicionar/remover classe para efeito de scroll
    if (scrollTop > this.scrollThreshold) {
      this.header.classList.add("header--scrolled");
    } else {
      this.header.classList.remove("header--scrolled");
    }

    // Esconder/mostrar header baseado na direção do scroll
    if (scrollTop > this.lastScrollTop && scrollTop > this.scrollThreshold) {
      this.header.style.transform = "translateY(-100%)";
    } else {
      this.header.style.transform = "translateY(0)";
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}

// Smooth Scrolling para links de navegação
class SmoothScroller {
  constructor() {
    this.init();
  }

  init() {
    // Interceptar clicks em links com hash
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").substring(1);
        this.scrollToElement(targetId);
      }
    });
  }

  scrollToElement(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      const offsetTop =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        CONFIG.scrollOffset;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  }
}

// Animações de Scroll (Intersection Observer)
class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    this.init();
  }

  init() {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      }, this.observerOptions);

      // Observar elementos que devem ser animados
      const animateElements = document.querySelectorAll(
        ".service, .feature, .testimonial, .step"
      );
      animateElements.forEach((el) => {
        el.classList.add("animate-on-scroll");
        this.observer.observe(el);
      });
    }
  }
}

// Gerenciamento do Formulário de Contato
class ContactForm {
  constructor() {
    this.form = document.getElementById("contactForm");
    this.submitButton = null;
    this.originalButtonText = "";

    this.init();
  }

  init() {
    if (this.form) {
      this.submitButton = this.form.querySelector('button[type="submit"]');
      this.originalButtonText = this.submitButton.textContent;

      this.form.addEventListener("submit", (e) => this.handleSubmit(e));

      // Formatação automática do telefone
      const phoneInput = this.form.querySelector("#phone");
      if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
          e.target.value = Utils.formatPhone(e.target.value);
        });
      }

      // Validação em tempo real
      this.setupRealTimeValidation();
    }
  }

  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll(
      "input[required], select[required]"
    );

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Validação por tipo de campo
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "Este campo é obrigatório";
    } else if (field.type === "email" && value && !Utils.isValidEmail(value)) {
      isValid = false;
      errorMessage = "Digite um e-mail válido";
    } else if (field.type === "tel" && value && !Utils.isValidPhone(value)) {
      isValid = false;
      errorMessage = "Digite um telefone válido";
    }

    this.showFieldError(field, isValid, errorMessage);
    return isValid;
  }

  showFieldError(field, isValid, message) {
    // Remover erro anterior
    this.clearFieldError(field);

    if (!isValid) {
      field.classList.add("error");

      const errorElement = document.createElement("span");
      errorElement.className = "field-error";
      errorElement.textContent = message;

      field.parentNode.appendChild(errorElement);
    }
  }

  clearFieldError(field) {
    field.classList.remove("error");
    const errorElement = field.parentNode.querySelector(".field-error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validar todos os campos
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    if (!this.validateForm(data)) {
      this.showNotification("Por favor, corrija os campos destacados", "error");
      return;
    }

    // Mostrar loading
    this.setLoadingState(true);

    try {
      // Enviar via WhatsApp (método principal)
      this.sendViaWhatsApp(data);

      // Mostrar sucesso
      this.showNotification(
        "Mensagem enviada com sucesso! Em breve entraremos em contato.",
        "success"
      );
      this.form.reset();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      this.showNotification(
        "Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente.",
        "error"
      );
    } finally {
      this.setLoadingState(false);
    }
  }

  validateForm(data) {
    let isValid = true;
    const requiredFields = this.form.querySelectorAll(
      "input[required], select[required]"
    );

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  sendViaWhatsApp(data) {
    let message = `🌿 *Nova solicitação de consulta*\n\n`;
    message += `👤 *Nome:* ${data.name}\n`;
    message += `📧 *E-mail:* ${data.email}\n`;
    message += `📱 *WhatsApp:* ${data.phone}\n`;

    if (data.service) {
      const serviceNames = {
        inicial: "Consulta Inicial",
        acompanhamento: "Acompanhamento Mensal",
        empresarial: "Consultoria Empresarial",
      };
      message += `🩺 *Serviço:* ${serviceNames[data.service]}\n`;
    }

    if (data.message) {
      message += `\n💬 *Mensagem:*\n${data.message}`;
    }

    message += `\n\n_Mensagem enviada através do site_`;

    const whatsappUrl = `https://wa.me/${
      CONFIG.whatsappNumber
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.classList.add("btn--loading");
      this.submitButton.textContent = "Enviando...";
    } else {
      this.submitButton.disabled = false;
      this.submitButton.classList.remove("btn--loading");
      this.submitButton.textContent = this.originalButtonText;
    }
  }

  showNotification(message, type = "info") {
    // Remover notificação anterior se existir
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

    document.body.appendChild(notification);

    // Auto remover após 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);

    // Animar entrada
    setTimeout(() => {
      notification.classList.add("notification--show");
    }, 100);
  }
}

// Lazy Loading para imagens
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }

  init() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove("lazy");
            imageObserver.unobserve(img);
          }
        });
      });

      this.images.forEach((img) => {
        img.classList.add("lazy");
        imageObserver.observe(img);
      });
    }
  }
}

// Contador animado para estatísticas
class AnimatedCounters {
  constructor() {
    this.counters = document.querySelectorAll(".stat__number");
    this.init();
  }

  init() {
    if (this.counters.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      });

      this.counters.forEach((counter) => {
        observer.observe(counter);
      });
    }
  }

  animateCounter(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ""));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        element.textContent = element.textContent.replace(/\d+/, target);
        clearInterval(timer);
      } else {
        element.textContent = element.textContent.replace(
          /\d+/,
          Math.floor(current)
        );
      }
    }, 16);
  }
}

// Gerenciador principal da aplicação
class App {
  constructor() {
    this.components = [];
    this.init();
  }

  init() {
    // Aguardar DOM estar pronto
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeComponents()
      );
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Inicializar componentes
      this.components = [
        new MobileMenu(),
        new HeaderManager(),
        new SmoothScroller(),
        new ScrollAnimations(),
        new ContactForm(),
        new LazyLoader(),
        new AnimatedCounters(),
      ];

      // Adicionar estilos CSS customizados via JavaScript
      this.addCustomStyles();

      console.log("✅ Aplicação inicializada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao inicializar aplicação:", error);
    }
  }

  addCustomStyles() {
    const style = document.createElement("style");
    style.textContent = `
            /* Estilos para animações de scroll */
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Estilos para campos com erro */
            .form__input.error,
            .form__select.error,
            .form__textarea.error {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
            
            .field-error {
                display: block;
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }
            
            /* Estilos para notificações */
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                max-width: 400px;
                z-index: 1100;
                transform: translateX(100%);
                transition: transform 0.3s ease-out;
            }
            
            .notification--show {
                transform: translateX(0);
            }
            
            .notification__content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #10b981;
            }
            
            .notification--error .notification__content {
                border-left-color: #ef4444;
            }
            
            .notification__close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                margin-left: 1rem;
            }
            
            /* Header com scroll */
            .header--scrolled {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                background-color: rgba(255, 255, 255, 0.95);
            }
            
            /* Lazy loading para imagens */
            .lazy {
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .lazy.loaded {
                opacity: 1;
            }
            
            /* Responsividade para notificações */
            @media (max-width: 640px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;

    document.head.appendChild(style);
  }
}

// Inicializar aplicação
new App();

// Expor utilitários globalmente para uso em outros scripts se necessário
window.NutritionistApp = {
  Utils,
  CONFIG,
};
