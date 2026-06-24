/* ============================================
   Cours n8n — JavaScript interactif
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY_THEME = 'n8n-course-theme';
  const STORAGE_KEY_PROGRESS = 'n8n-course-progress';
  const TOTAL_CHAPTERS = 11; // 10 chapitres + bonus

  const chapters = [
    { id: 0, file: 'index.html', title: 'Accueil' },
    { id: 1, file: 'chapitre-1.html', title: 'Introduction à n8n' },
    { id: 2, file: 'chapitre-2.html', title: 'Installation' },
    { id: 3, file: 'chapitre-3.html', title: 'Interface' },
    { id: 4, file: 'chapitre-4.html', title: 'Premier Workflow' },
    { id: 5, file: 'chapitre-5.html', title: 'Manipulation des données' },
    { id: 6, file: 'chapitre-6.html', title: 'Marketing' },
    { id: 7, file: 'chapitre-7.html', title: 'E-commerce' },
    { id: 8, file: 'chapitre-8.html', title: 'Cybersécurité' },
    { id: 9, file: 'chapitre-9.html', title: 'Intelligence Artificielle' },
    { id: 10, file: 'chapitre-10.html', title: 'Projet Final' },
    { id: 11, file: 'bonus.html', title: 'Bonus' }
  ];

  /* ---- Theme ---- */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /* ---- Progress ---- */
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
  }

  function markChapterComplete(chapterId) {
    const progress = getProgress();
    progress[chapterId] = true;
    saveProgress(progress);
    updateProgressUI();
  }

  function getCompletedCount() {
    const progress = getProgress();
    return Object.keys(progress).filter(k => progress[k] && k !== '0').length;
  }

  function getCurrentChapterId() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const ch = chapters.find(c => c.file === path);
    return ch ? ch.id : 0;
  }

  function updateProgressUI() {
    const currentId = getCurrentChapterId();
    const completed = getCompletedCount();
    const total = TOTAL_CHAPTERS;
    const percent = Math.round((completed / total) * 100);

    const fill = document.querySelector('.progress-fill');
    const label = document.querySelector('.progress-percent');
    if (fill) fill.style.width = percent + '%';
    if (label) label.textContent = percent + '%';

    const progressText = document.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = completed + ' / ' + total + ' modules complétés';
    }

    document.querySelectorAll('.module-card').forEach(card => {
      const id = card.dataset.chapter;
      if (id && getProgress()[id]) {
        card.classList.add('completed');
        const fillEl = card.querySelector('.module-progress-fill');
        if (fillEl) fillEl.style.width = '100%';
      }
    });

    if (currentId > 0) {
      const chPercent = Math.round((currentId / TOTAL_CHAPTERS) * 100);
      const chFill = document.querySelector('.chapter-progress-fill');
      if (chFill) chFill.style.width = chPercent + '%';
    }
  }

  /* ---- Sidebar ---- */
  function initSidebar() {
    const toggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === currentFile) {
        link.classList.add('active');
      }
    });
  }

  /* ---- Accordions ---- */
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const wasOpen = item.classList.contains('open');

        item.closest('.accordion').querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('open');
        });

        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ---- Quizzes ---- */
  function initQuizzes() {
    document.querySelectorAll('.quiz').forEach(quiz => {
      const options = quiz.querySelectorAll('.quiz-option');
      const btn = quiz.querySelector('.quiz-btn');
      const feedback = quiz.querySelector('.quiz-feedback');
      const correctAnswer = quiz.dataset.correct;

      options.forEach(option => {
        option.addEventListener('click', () => {
          if (quiz.classList.contains('answered')) return;
          options.forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
          option.querySelector('input').checked = true;
        });
      });

      if (btn) {
        btn.addEventListener('click', () => {
          const selected = quiz.querySelector('.quiz-option.selected');
          if (!selected) {
            feedback.textContent = 'Veuillez sélectionner une réponse.';
            feedback.className = 'quiz-feedback show error';
            return;
          }

          quiz.classList.add('answered');
          const value = selected.dataset.value;

          options.forEach(o => {
            if (o.dataset.value === correctAnswer) o.classList.add('correct');
            else if (o.classList.contains('selected')) o.classList.add('incorrect');
          });

          if (value === correctAnswer) {
            feedback.textContent = '✅ Correct ! ' + (quiz.dataset.explain || '');
            feedback.className = 'quiz-feedback show success';
          } else {
            feedback.textContent = '❌ Incorrect. ' + (quiz.dataset.explain || '');
            feedback.className = 'quiz-feedback show error';
          }
        });
      }
    });
  }

  /* ---- Mark complete button ---- */
  function initCompleteButton() {
    const btn = document.querySelector('.btn-complete-chapter');
    if (!btn) return;

    const chapterId = getCurrentChapterId();
    const progress = getProgress();

    if (progress[chapterId]) {
      btn.textContent = '✓ Module complété';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }

    btn.addEventListener('click', () => {
      markChapterComplete(chapterId);
      btn.textContent = '✓ Module complété';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initAccordions();
    initQuizzes();
    initCompleteButton();
    initAnchorLinks();
    updateProgressUI();

    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  });
})();
