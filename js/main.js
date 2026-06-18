(function () {
  const projects = window.portfolioProjects || [];
  const recognitions = window.portfolioRecognitions || [];
  const certifications = window.portfolioCertifications || [];

  const defaultProjectId = "banregio-hey";
  const defaultRecognitionId = recognitions[0]?.id || "";
  const defaultCertificationId = certifications[0]?.id || "";
  const categoryOrder = ["Consulting", "Data Analytics", "Entrepreneurship", "Innovation"];

  let selectedIndex = Math.max(projects.findIndex((project) => project.id === defaultProjectId), 0);
  let selectedRecognitionIndex = Math.max(recognitions.findIndex((recognition) => recognition.id === defaultRecognitionId), 0);
  let selectedCertificationIndex = Math.max(certifications.findIndex((certification) => certification.id === defaultCertificationId), 0);
  let projectCarouselIndex = projects.length + selectedIndex;
  let projectCarouselAnimating = false;
  let certificationCarouselIndex = certifications.length + selectedCertificationIndex;
  let certificationCarouselAnimating = false;

  const page = document.body.dataset.page || "home";
  const track = document.querySelector("[data-project-track]");
  const grid = document.querySelector("[data-project-grid]");
  const pinnedProjects = document.querySelector("[data-pinned-projects]");
  const miniProjects = document.querySelector("[data-mini-projects]");
  const recognitionList = document.querySelector("[data-recognition-list]");
  const recognitionPreview = document.querySelector("[data-recognition-preview]");
  const miniRecognitions = document.querySelector("[data-mini-recognitions]");
  const certificationTrack = document.querySelector("[data-certification-track]");
  const miniCertifications = document.querySelector("[data-mini-certifications]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  function projectUrl(project) {
    return `one_on_one_project.html?project=${encodeURIComponent(project.id)}`;
  }

  function recognitionUrl(recognition) {
    return `one_on_one_recognition.html?recognition=${encodeURIComponent(recognition.id)}`;
  }

  function certificationUrl(certification) {
    return `one_on_one_certification.html?certification=${encodeURIComponent(certification.id)}`;
  }

  function iconForTech(tech) {
    const key = tech.toLowerCase();
    if (key.includes("python")) return "ri-terminal-box-line";
    if (key.includes("sql") || key.includes("database") || key.includes("redshift") || key.includes("sqlite") || key.includes("postgres")) return "ri-database-2-line";
    if (key.includes("react") || key.includes("javascript") || key.includes("typescript") || key.includes("electron")) return "ri-code-s-slash-line";
    if (key.includes("excel") || key.includes("sheet")) return "ri-file-excel-2-line";
    if (key.includes("ai") || key.includes("artificial") || key.includes("prompt")) return "ri-brain-line";
    if (key.includes("analytics") || key.includes("visual") || key.includes("looker") || key.includes("plotly")) return "ri-bar-chart-box-line";
    if (key.includes("scrum") || key.includes("business") || key.includes("product") || key.includes("market")) return "ri-briefcase-4-line";
    if (key.includes("iot") || key.includes("cloud")) return "ri-cloud-line";
    return "ri-tools-line";
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value || "";
    });
  }

  function categoryClass(category) {
    return category.toLowerCase().replace(/\s+/g, "-");
  }

  function cardTag(project, isPinned) {
    if (isPinned && project.featured) {
      return '<span class="featured-tag">Featured Work</span>';
    }

    return `
      <span class="category-tag category-tag--${categoryClass(project.categoryGroup)}">
        ${project.categoryGroup}
      </span>
    `;
  }

  function projectCard(project, index, mode, isActiveOverride) {
    const link = document.createElement("a");
    const isActive = typeof isActiveOverride === "boolean" ? isActiveOverride : index === selectedIndex;
    link.className = `${mode === "grid" ? "library-card" : "project-card"}${isActive ? " is-active" : ""}`;
    link.dataset.projectId = project.id;
    link.href = projectUrl(project);
    link.innerHTML = `
      <img src="${project.image}" alt="${project.title} project visual">
      ${cardTag(project, false)}
      <span class="project-card__text">
        <strong>${project.title}</strong>
        <small>${project.category}</small>
      </span>
    `;
    return link;
  }

  function renderCarousel(scrollBehavior) {
    if (!track) return;
    track.innerHTML = "";
    projectCarouselIndex = projects.length + selectedIndex;
    [...projects, ...projects, ...projects].forEach((project, index) => {
      const projectIndex = index % projects.length;
      track.appendChild(projectCard(project, projectIndex, "carousel", index === projectCarouselIndex));
    });
    setProjectCarouselPosition(scrollBehavior === "smooth");
    enableInfiniteProjectCarousel();
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";

    categoryOrder.forEach((category) => {
      const categoryProjects = projects.filter((project) => project.categoryGroup === category);
      if (!categoryProjects.length) return;

      const group = document.createElement("section");
      group.className = "project-group reveal is-visible";
      group.innerHTML = `
        <div class="project-group__heading">
          <p class="eyebrow">${category}</p>
          <span>${categoryProjects.length} ${categoryProjects.length === 1 ? "project" : "projects"}</span>
        </div>
        <div class="project-grid"></div>
      `;

      const groupGrid = group.querySelector(".project-grid");
      categoryProjects.forEach((project) => {
        const projectIndex = projects.findIndex((item) => item.id === project.id);
        groupGrid.appendChild(projectCard(project, projectIndex, "grid"));
      });
      grid.appendChild(group);
    });
  }

  function pinnedCard(project) {
    const article = document.createElement("article");
    article.className = "pinned-card";
    article.innerHTML = `
      <div class="pinned-card__image">
        <img src="${project.image}" alt="${project.title} featured project visual">
        ${cardTag(project, true)}
      </div>
      <div class="pinned-card__content">
        <p class="eyebrow">${project.categoryGroup}</p>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <div class="pinned-card__meta">
          <span>${project.start}</span>
          <span>${project.end}</span>
        </div>
        <a class="text-button" href="${projectUrl(project)}">View case study <i class="ri-arrow-right-line" aria-hidden="true"></i></a>
      </div>
    `;
    return article;
  }

  function renderPinnedProjects() {
    if (!pinnedProjects) return;
    const pinned = projects.filter((project) => project.featured);
    pinnedProjects.innerHTML = "";
    pinned.forEach((project) => pinnedProjects.appendChild(pinnedCard(project)));
  }

  function renderDetail(project) {
    const image = document.querySelector("[data-detail-image]");
    const bullets = document.querySelector("[data-detail-bullets]");
    const tech = document.querySelector("[data-detail-tech]");
    const soft = document.querySelector("[data-detail-soft]");

    if (!project || !document.querySelector("[data-detail-title]")) return;

    document.title = `${project.title} | Isaac Yael Zaragoza Oldendorff`;
    if (image) {
      image.src = project.image;
      image.alt = `${project.title} main project visual`;
    }

    setText("[data-detail-title]", project.title);
    setText("[data-detail-client]", project.client);
    setText("[data-detail-category]", project.categoryGroup);
    setText("[data-detail-featured-label]", project.featured ? "Featured Work" : project.categoryGroup);
    setText("[data-detail-role]", project.role);
    setText("[data-detail-summary]", project.summary);
    setText("[data-detail-start]", project.start);
    setText("[data-detail-end]", project.end);

    if (bullets) {
      bullets.innerHTML = project.bullets.map((item) => `<li><i class="ri-checkbox-circle-line" aria-hidden="true"></i><span>${item}</span></li>`).join("");
    }
    if (tech) {
      tech.innerHTML = project.technologies.map((item) => `<span><i class="${iconForTech(item)}" aria-hidden="true"></i>${item}</span>`).join("");
    }
    if (soft) {
      soft.innerHTML = project.softSkills.map((item) => `<span><i class="ri-user-smile-line" aria-hidden="true"></i>${item}</span>`).join("");
    }
  }

  function renderMiniProjects() {
    if (!miniProjects) return;
    miniProjects.innerHTML = projects
      .filter((_, index) => index !== selectedIndex)
      .slice(0, 4)
      .map((project) => `
        <a href="${projectUrl(project)}">
          <img src="${project.image}" alt="${project.title} project thumbnail">
          <span>
            <strong>${project.title}</strong>
            <small>${project.categoryGroup}</small>
          </span>
        </a>
      `)
      .join("");
  }

  function recognitionCard(recognition, mode) {
    const link = document.createElement("a");
    link.className = `recognition-card recognition-card--${mode}`;
    link.href = recognitionUrl(recognition);
    link.innerHTML = `
      <div class="recognition-card__image">
        <img src="${recognition.image}" alt="${recognition.title} recognition visual">
      </div>
      <div class="recognition-card__content">
        <p class="eyebrow">${recognition.type}</p>
        <h3>${recognition.title}</h3>
        <p>${recognition.summary}</p>
        <span class="recognition-card__meta">${recognition.institution}</span>
      </div>
    `;
    return link;
  }

  function renderRecognitionPreview() {
    if (!recognitionPreview) return;
    recognitionPreview.innerHTML = "";
    recognitions.slice(0, 3).forEach((recognition) => {
      recognitionPreview.appendChild(recognitionCard(recognition, "preview"));
    });
  }

  function renderRecognitionList() {
    if (!recognitionList) return;
    recognitionList.innerHTML = "";
    const track = document.createElement("div");
    track.className = "recognition-vertical-track";
    recognitionList.appendChild(track);

    [...recognitions, ...recognitions, ...recognitions].forEach((recognition) => {
      track.appendChild(recognitionCard(recognition, "list"));
    });
    enableInfiniteVerticalCarousel(recognitionList);
  }

  function renderRecognitionDetail(recognition) {
    const image = document.querySelector("[data-recognition-image]");
    const bullets = document.querySelector("[data-recognition-bullets]");
    const skills = document.querySelector("[data-recognition-skills]");
    const link = document.querySelector("[data-recognition-evidence]");

    if (!recognition || !document.querySelector("[data-recognition-title]")) return;

    document.title = `${recognition.title} | Isaac Yael Zaragoza Oldendorff`;
    if (image) {
      image.src = recognition.image;
      image.alt = `${recognition.title} recognition visual`;
    }

    setText("[data-recognition-title]", recognition.title);
    setText("[data-recognition-institution]", recognition.institution);
    setText("[data-recognition-type]", recognition.type);
    setText("[data-recognition-summary]", recognition.summary);
    setText("[data-recognition-date]", recognition.date);

    if (bullets) {
      bullets.innerHTML = recognition.details.map((item) => `<li><i class="ri-checkbox-circle-line" aria-hidden="true"></i><span>${item}</span></li>`).join("");
    }
    if (skills) {
      skills.innerHTML = recognition.skills.map((item) => `<span><i class="ri-award-line" aria-hidden="true"></i>${item}</span>`).join("");
    }
    if (link) {
      if (recognition.evidenceUrl) {
        link.href = recognition.evidenceUrl;
        link.textContent = recognition.evidenceLabel || "View evidence";
        link.hidden = false;
      } else {
        link.hidden = true;
      }
    }
  }

  function renderMiniRecognitions() {
    if (!miniRecognitions) return;
    miniRecognitions.innerHTML = recognitions
      .filter((_, index) => index !== selectedRecognitionIndex)
      .slice(0, 4)
      .map((recognition) => `
        <a href="${recognitionUrl(recognition)}">
          <img src="${recognition.image}" alt="${recognition.title} recognition thumbnail">
          <span>
            <strong>${recognition.title}</strong>
            <small>${recognition.type}</small>
          </span>
        </a>
      `)
      .join("");
  }

  function certificationCard(certification) {
    const link = document.createElement("a");
    link.className = "certification-card";
    link.href = certificationUrl(certification);
    link.innerHTML = `
      <h3>${certification.title}</h3>
      <p class="certification-card__authority">${certification.authority}</p>
      <p>${certification.summary}</p>
    `;
    return link;
  }

  function renderCertificationCarousel(scrollBehavior) {
    if (!certificationTrack) return;
    certificationTrack.innerHTML = "";
    [...certifications, ...certifications, ...certifications].forEach((certification) => {
      certificationTrack.appendChild(certificationCard(certification));
    });

    certificationCarouselIndex = certifications.length + selectedCertificationIndex;
    setCertificationCarouselPosition(scrollBehavior === "smooth");
    enableInfiniteCertificationCarousel();
  }

  function renderCertificationDetail(certification) {
    const skills = document.querySelector("[data-certification-skills]");

    if (!certification || !document.querySelector("[data-certification-title]")) return;

    document.title = `${certification.title} | Isaac Yael Zaragoza Oldendorff`;
    setText("[data-certification-title]", certification.title);
    setText("[data-certification-authority]", certification.authority);
    setText("[data-certification-summary]", certification.summary);
    setText("[data-certification-date]", certification.date);
    setText("[data-certification-result]", certification.result || "Completed");

    if (skills) {
      skills.innerHTML = certification.skills.map((item) => `<span><i class="ri-verified-badge-line" aria-hidden="true"></i>${item}</span>`).join("");
    }
  }

  function renderMiniCertifications() {
    if (!miniCertifications) return;
    miniCertifications.innerHTML = certifications
      .filter((_, index) => index !== selectedCertificationIndex)
      .slice(0, 4)
      .map((certification) => `
        <a class="mini-certification" href="${certificationUrl(certification)}">
          <span>
            <strong>${certification.title}</strong>
            <small>${certification.authority}</small>
          </span>
        </a>
      `)
      .join("");
  }

  function setRecognitionCarouselPosition(container, index, animate) {
    const track = container.querySelector(".recognition-vertical-track");
    const active = track?.children[index];
    if (!track || !active) return;

    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateY(${-active.offsetTop}px)`;
    Array.from(track.children).forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
    });

    if (!animate) {
      window.requestAnimationFrame(() => {
        track.style.transition = "";
      });
    }
  }

  function enableInfiniteVerticalCarousel(container) {
    const track = container.querySelector(".recognition-vertical-track");
    const itemCount = recognitions.length;
    if (!track || !itemCount) return;

    let activeIndex = itemCount;
    let isAnimating = false;
    setRecognitionCarouselPosition(container, activeIndex, false);

    window.addEventListener("resize", () => {
      setRecognitionCarouselPosition(container, activeIndex, false);
    });

    if (container.dataset.carouselReady === "true") return;
    container.dataset.carouselReady = "true";

    function move(delta) {
      if (isAnimating) return;
      isAnimating = true;
      activeIndex += delta;
      setRecognitionCarouselPosition(container, activeIndex, true);

      window.setTimeout(() => {
        if (activeIndex < itemCount) {
          activeIndex = itemCount * 2 - 1;
          setRecognitionCarouselPosition(container, activeIndex, false);
        } else if (activeIndex >= itemCount * 2) {
          activeIndex = itemCount;
          setRecognitionCarouselPosition(container, activeIndex, false);
        }
        isAnimating = false;
      }, 560);
    }

    container.addEventListener("wheel", (event) => {
      event.preventDefault();
      move(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }

  function setProjectCarouselPosition(animate) {
    const viewport = track?.parentElement;
    const active = track?.children[projectCarouselIndex];
    if (!track || !viewport || !active) return;

    const centeredOffset = active.offsetLeft - ((viewport.clientWidth - active.offsetWidth) / 2);
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${-centeredOffset}px)`;

    Array.from(track.children).forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === projectCarouselIndex);
    });

    if (!animate) {
      window.requestAnimationFrame(() => {
        track.style.transition = "";
      });
    }
  }

  function enableInfiniteProjectCarousel() {
    const viewport = track?.parentElement;
    if (!track || !viewport || viewport.dataset.projectCarouselReady === "true") return;
    viewport.dataset.projectCarouselReady = "true";

    window.addEventListener("resize", () => {
      setProjectCarouselPosition(false);
    });

    viewport.addEventListener("wheel", (event) => {
      event.preventDefault();
      moveCarousel(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }

  function setCertificationCarouselPosition(animate) {
    const viewport = certificationTrack?.parentElement;
    const active = certificationTrack?.children[certificationCarouselIndex];
    if (!certificationTrack || !viewport || !active) return;

    const centeredOffset = active.offsetLeft - ((viewport.clientWidth - active.offsetWidth) / 2);
    certificationTrack.style.transition = animate ? "" : "none";
    certificationTrack.style.transform = `translateX(${-centeredOffset}px)`;

    if (!animate) {
      window.requestAnimationFrame(() => {
        certificationTrack.style.transition = "";
      });
    }
  }

  function enableInfiniteCertificationCarousel() {
    const viewport = certificationTrack?.parentElement;
    if (!certificationTrack || !viewport || viewport.dataset.carouselReady === "true") return;
    viewport.dataset.carouselReady = "true";

    window.addEventListener("resize", () => {
      setCertificationCarouselPosition(false);
    });

    viewport.addEventListener("wheel", (event) => {
      event.preventDefault();
      moveCertificationCarousel(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }

  function selectProject(index, scrollBehavior) {
    selectedIndex = (index + projects.length) % projects.length;
    projectCarouselIndex = projects.length + selectedIndex;
    setProjectCarouselPosition(scrollBehavior === "smooth");
  }

  function moveCarousel(delta) {
    if (!track || !projects.length || projectCarouselAnimating) return;

    projectCarouselAnimating = true;
    selectedIndex = (selectedIndex + delta + projects.length) % projects.length;
    projectCarouselIndex += delta;
    setProjectCarouselPosition(true);

    window.setTimeout(() => {
      if (projectCarouselIndex < projects.length) {
        projectCarouselIndex += projects.length;
        setProjectCarouselPosition(false);
      } else if (projectCarouselIndex >= projects.length * 2) {
        projectCarouselIndex -= projects.length;
        setProjectCarouselPosition(false);
      }
      projectCarouselAnimating = false;
    }, 560);
  }

  function selectCertification(index, scrollBehavior) {
    selectedCertificationIndex = (index + certifications.length) % certifications.length;
    certificationCarouselIndex = certifications.length + selectedCertificationIndex;
    setCertificationCarouselPosition(scrollBehavior === "smooth");
  }

  function moveCertificationCarousel(delta) {
    if (!certificationTrack || !certifications.length || certificationCarouselAnimating) return;

    certificationCarouselAnimating = true;
    selectedCertificationIndex = (selectedCertificationIndex + delta + certifications.length) % certifications.length;
    certificationCarouselIndex += delta;
    setCertificationCarouselPosition(true);

    window.setTimeout(() => {
      if (certificationCarouselIndex < certifications.length) {
        certificationCarouselIndex += certifications.length;
        setCertificationCarouselPosition(false);
      } else if (certificationCarouselIndex >= certifications.length * 2) {
        certificationCarouselIndex -= certifications.length;
        setCertificationCarouselPosition(false);
      }
      certificationCarouselAnimating = false;
    }, 560);
  }

  function initializeDetailSelection() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("project") || defaultProjectId;
    const requestedIndex = projects.findIndex((project) => project.id === requested);
    selectedIndex = requestedIndex >= 0 ? requestedIndex : Math.max(projects.findIndex((project) => project.id === defaultProjectId), 0);
    renderDetail(projects[selectedIndex]);
    renderMiniProjects();
  }

  function initializeRecognitionDetailSelection() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("recognition") || defaultRecognitionId;
    const requestedIndex = recognitions.findIndex((recognition) => recognition.id === requested);
    selectedRecognitionIndex = requestedIndex >= 0 ? requestedIndex : 0;
    renderRecognitionDetail(recognitions[selectedRecognitionIndex]);
    renderMiniRecognitions();
  }

  function initializeCertificationDetailSelection() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("certification") || defaultCertificationId;
    const requestedIndex = certifications.findIndex((certification) => certification.id === requested);
    selectedCertificationIndex = requestedIndex >= 0 ? requestedIndex : 0;
    renderCertificationDetail(certifications[selectedCertificationIndex]);
    renderMiniCertifications();
  }

  document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => moveCarousel(-1));
  document.querySelector("[data-carousel-next]")?.addEventListener("click", () => moveCarousel(1));
  document.querySelector("[data-certification-prev]")?.addEventListener("click", () => moveCertificationCarousel(-1));
  document.querySelector("[data-certification-next]")?.addEventListener("click", () => moveCertificationCarousel(1));

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    navToggle.innerHTML = `<i class="${isOpen ? "ri-close-line" : "ri-menu-line"}" aria-hidden="true"></i>`;
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      if (navToggle) navToggle.innerHTML = '<i class="ri-menu-line" aria-hidden="true"></i>';
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

  if (page === "detail") {
    initializeDetailSelection();
  } else if (page === "recognition-detail") {
    initializeRecognitionDetailSelection();
  } else if (page === "certification-detail") {
    initializeCertificationDetailSelection();
  } else {
    renderCarousel("auto");
    renderGrid();
    renderPinnedProjects();
    renderRecognitionPreview();
    renderRecognitionList();
    renderCertificationCarousel("auto");
  }
})();
