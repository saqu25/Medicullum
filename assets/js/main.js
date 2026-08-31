// Medicullum — shared interactions (no build step, vanilla JS)
(function () {
  "use strict";

  // EmailJS wiring for [data-lead-form] submissions (book-consultation.html,
  // contact.html). Template variables match the existing EmailJS template:
  // from_name, from_email, phone, track, university, message.
  var EMAILJS_SERVICE_ID = "service_f70eyz9";
  var EMAILJS_TEMPLATE_ID = "template_92tscfk";
  var EMAILJS_PUBLIC_KEY = "zbZkvxM7Y99IJLVRB";
  if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initStickyHeader();
    initScrollReveal();
    initCounters();
    initFAQAccordions();
    initFormFeedback();
    initFilterTabs();
  });

  function initFilterTabs() {
    document.querySelectorAll("[data-filter-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll("[data-filter-tab]");
      var targetSelector = group.getAttribute("data-filter-tabs");
      var items = document.querySelectorAll(targetSelector + " [data-filter-item]");

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var value = tab.getAttribute("data-filter-tab");

          tabs.forEach(function (t) {
            t.classList.remove("bg-navy", "text-white");
            t.classList.add("bg-white", "text-navy");
          });
          tab.classList.add("bg-navy", "text-white");
          tab.classList.remove("bg-white", "text-navy");

          items.forEach(function (item) {
            var cat = item.getAttribute("data-filter-item");
            var show = value === "all" || cat === value;
            item.classList.toggle("hidden", !show);
          });
        });
      });
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("flex");
      panel.classList.toggle("hidden", !isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("overflow-hidden", isOpen);
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.add("hidden");
        panel.classList.remove("flex");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }

  function initStickyHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    var animate = function (el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      var step = function (timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      };
      window.requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  function initFAQAccordions() {
    document.querySelectorAll("[data-faq-item]").forEach(function (item) {
      var trigger = item.querySelector("[data-faq-trigger]");
      var panel = item.querySelector("[data-faq-panel]");
      var icon = item.querySelector("[data-faq-icon]");
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        item.setAttribute("data-open", String(!isOpen));
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : "0px";
        if (icon) icon.style.transform = !isOpen ? "rotate(45deg)" : "rotate(0deg)";
      });
    });
  }

  function buildLeadEmailParams(form) {
    var el = form.elements;
    var val = function (name) { return el[name] ? el[name].value : ""; };

    var extraLines = [];
    if (val("nationality")) extraLines.push("Nationality: " + val("nationality"));
    if (val("intake")) extraLines.push("Preferred intake: " + val("intake"));
    if (val("contact_time")) extraLines.push("Best time to contact: " + val("contact_time"));
    var message = extraLines.concat(val("message") ? [val("message")] : []).join("\n");

    return {
      from_name: val("name"),
      from_email: val("email"),
      phone: val("phone"),
      track: val("program"),
      university: val("university"),
      message: message
    };
  }

  function initFormFeedback() {
    document.querySelectorAll("[data-lead-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var requiredFields = form.querySelectorAll("[required]");
        var valid = true;
        requiredFields.forEach(function (field) {
          field.classList.add("touched");
          if (!field.checkValidity()) valid = false;
        });

        if (!valid) {
          form.querySelector(":invalid")?.focus();
          return;
        }

        // Honeypot: bots fill hidden fields, real visitors never do
        var honeypot = form.querySelector('[name="_gotcha"]');
        if (honeypot && honeypot.value) return;

        var successEl = form.parentElement.querySelector("[data-form-success]");
        var errorEl = form.parentElement.querySelector("[data-form-error]");
        var errorDetailEl = errorEl ? errorEl.querySelector("[data-error-detail]") : null;
        var submitBtn = form.querySelector('[type="submit"]');
        var originalLabel = submitBtn ? submitBtn.textContent : "";

        var showError = function (detail) {
          if (errorDetailEl) errorDetailEl.textContent = detail || "";
          if (errorEl) errorEl.classList.add("visible", "flex");
        };

        if (errorEl) errorEl.classList.remove("visible", "flex");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending…";
        }

        if (!window.emailjs) {
          console.error("EmailJS SDK failed to load — the request was never sent.");
          showError("EmailJS script failed to load (network/ad-blocker?)");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
          return;
        }

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, buildLeadEmailParams(form))
          .then(function () {
            form.classList.add("hidden");
            if (successEl) successEl.classList.add("visible", "flex");
          })
          .catch(function (err) {
            console.error("EmailJS send failed:", err);
            var detail = (err && (err.text || err.message)) || "Unknown error";
            if (err && err.status) detail += " (status " + err.status + ")";
            showError(detail);
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalLabel;
            }
          });
      });
    });
  }
})();
