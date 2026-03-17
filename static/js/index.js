window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function () { return false; };
  image.oncontextmenu = function () { return false; };
  var wrapper = document.getElementById('interpolation-image-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  wrapper.appendChild(image);
}


document.addEventListener('DOMContentLoaded', function () {
  // Navbar burger toggle (Bulma)
  var burgers = document.querySelectorAll('.navbar-burger');
  var menus = document.querySelectorAll('.navbar-menu');
  burgers.forEach(function (burger) {
    burger.addEventListener('click', function () {
      burgers.forEach(function (b) { b.classList.toggle('is-active'); });
      menus.forEach(function (m) { m.classList.toggle('is-active'); });
    });
  });

  // Carousels
  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  };
  function safePause(video) {
    try { video.pause(); } catch (e) { }
  }
  function safePlayMuted(video) {
    try { video.muted = true; } catch (e) { }
    try { video.play(); } catch (e) { }
  }
  function isElementHidden(el) {
    // Covers display:none, visibility:hidden, and hidden ancestors.
    if (!el || el.nodeType !== 1) return true;
    if (el.closest('.is-hidden, .is-anytask-hidden, .is-automate-hidden, .is-compare-hidden')) return true;
    return false;
  }
  function pauseAllVideosExcept(keep) {
    var keepSet = new Set((keep || []).filter(Boolean));
    document.querySelectorAll('video').forEach(function (v) {
      if (!keepSet.has(v)) safePause(v);
    });
  }
  function refreshCarouselVideos(instance) {
    if (!instance || !instance.element) return;
    // Only keep videos inside the currently shown slide(s) playing.
    var keep = [];
    var currentSlides = instance.element.querySelectorAll('.slider-item.is-current, .slider-item.is-active');
    if (currentSlides && currentSlides.length) {
      currentSlides.forEach(function (slide) {
        slide.querySelectorAll('video').forEach(function (v) {
          if (!isElementHidden(v)) keep.push(v);
        });
      });
    } else {
      // Fallback: keep the first video in this carousel.
      var first = instance.element.querySelector('video');
      if (first && !isElementHidden(first)) keep.push(first);
    }

    // Pause videos in this carousel that aren't "keep".
    var keepSet = new Set(keep);
    instance.element.querySelectorAll('video').forEach(function (v) {
      if (!keepSet.has(v)) safePause(v);
    });
    // Try to autoplay muted for visible current slide(s).
    keep.forEach(function (v) { safePlayMuted(v); });
  }

  var carouselInstances = bulmaCarousel.attach('.carousel', options) || [];
  carouselInstances.forEach(function (instance) {
    try {
      instance.on('show', function () { refreshCarouselVideos(instance); });
      instance.on('after:show', function () { refreshCarouselVideos(instance); });
    } catch (e) { }
    refreshCarouselVideos(instance);
  });

  // On initial load, make sure hidden-panel videos aren't decoding in background.
  // Keep only videos that are not in hidden panels AND are in the current carousel slide.
  // (Anything else can be resumed via carousel navigation/buttons.)
  (function initialVideoQuiesce() {
    var keep = [];
    carouselInstances.forEach(function (instance) {
      if (!instance || !instance.element) return;
      if (!isElementHidden(instance.element)) {
        var cur = instance.element.querySelectorAll('.slider-item.is-current, .slider-item.is-active');
        if (cur && cur.length) {
          cur.forEach(function (slide) {
            slide.querySelectorAll('video').forEach(function (v) {
              if (!isElementHidden(v)) keep.push(v);
            });
          });
        }
      }
    });
    pauseAllVideosExcept(keep);
    keep.forEach(function (v) { safePlayMuted(v); });
  })();

  // Sim-to-real single-video toggle buttons (optional — only if present in DOM)
  var sim2realButtons = document.querySelectorAll('[data-sim2real-target]');
  var sim2realPanels = document.querySelectorAll('.sim2real-panel');
  function setSim2RealActive(target, fromUserGesture) {
    sim2realButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-sim2real-target') === target;
      btn.classList.toggle('is-selected', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    sim2realPanels.forEach(function (panel) {
      var shouldShow = panel.id === ('sim2real-panel-' + target);
      panel.classList.toggle('is-hidden', !shouldShow);
      // Pause hidden videos so only one plays.
      var video = panel.querySelector('video');
      if (video && !shouldShow) {
        try { video.pause(); } catch (e) { }
      }
      // Play the shown video only when this was triggered by a user click.
      if (video && shouldShow && fromUserGesture) {
        try { video.muted = true; } catch (e) { }
        try { video.play(); } catch (e) { }
      }
    });
    // Also quiesce carousel videos when switching panels.
    carouselInstances.forEach(function (instance) { refreshCarouselVideos(instance); });
  }
  if (sim2realButtons.length && sim2realPanels.length) {
    sim2realButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setSim2RealActive(btn.getAttribute('data-sim2real-target'), true);
      });
    });
    // Initialize to the first button's target.
    setSim2RealActive(sim2realButtons[0].getAttribute('data-sim2real-target'), true);
  }

  // AnyTask per-task selector (optional — only if present in DOM)
  var anytaskButtons = document.querySelectorAll('[data-anytask-target]');
  var anytaskPanels = document.querySelectorAll('.anytask-panel');
  function setAnyTaskActive(target, fromUserGesture) {
    anytaskButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-anytask-target') === target;
      btn.classList.toggle('is-selected', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    anytaskPanels.forEach(function (panel) {
      var shouldShow = panel.id === ('anytask-panel-' + target);
      panel.classList.toggle('is-anytask-hidden', !shouldShow);

      // Pause hidden videos so they don't keep playing in the background.
      var videos = panel.querySelectorAll('video');
      if (!shouldShow) {
        videos.forEach(function (v) { try { v.pause(); } catch (e) { } });
      }
      // Play shown videos on user click (autoplay won't re-trigger on unhide).
      if (shouldShow && fromUserGesture) {
        videos.forEach(function (v) {
          try { v.muted = true; } catch (e) { }
          try { v.play(); } catch (e) { }
        });
      }
    });

    // Let bulma-carousel recalc widths after showing a different panel.
    try { window.dispatchEvent(new Event('resize')); } catch (e) { }
    carouselInstances.forEach(function (instance) { refreshCarouselVideos(instance); });
  }
  if (anytaskButtons.length && anytaskPanels.length) {
    anytaskButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setAnyTaskActive(btn.getAttribute('data-anytask-target'), true);
      });
    });
    setAnyTaskActive(anytaskButtons[0].getAttribute('data-anytask-target'), true);
  }

  // AutoMate per-asset selector (optional — only if present in DOM)
  var automateButtons = document.querySelectorAll('[data-automate-target]');
  var automatePanels = document.querySelectorAll('.automate-panel');
  function setAutoMateActive(target, fromUserGesture) {
    automateButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-automate-target') === target;
      btn.classList.toggle('is-selected', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    automatePanels.forEach(function (panel) {
      var shouldShow = panel.id === ('automate-panel-' + target);
      panel.classList.toggle('is-automate-hidden', !shouldShow);
      var videos = panel.querySelectorAll('video');
      if (!shouldShow) {
        videos.forEach(function (v) { try { v.pause(); } catch (e) { } });
      }
      if (shouldShow && fromUserGesture) {
        videos.forEach(function (v) {
          try { v.muted = true; } catch (e) { }
          try { v.play(); } catch (e) { }
        });
      }
    });

    try { window.dispatchEvent(new Event('resize')); } catch (e) { }
    carouselInstances.forEach(function (instance) { refreshCarouselVideos(instance); });
  }
  if (automateButtons.length && automatePanels.length) {
    automateButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setAutoMateActive(btn.getAttribute('data-automate-target'), true);
      });
    });
    setAutoMateActive(automateButtons[0].getAttribute('data-automate-target'), true);
  }

  // Baselines comparison task selector (optional — only if present in DOM)
  var compareTaskButtons = document.querySelectorAll('[data-compare-task]');
  var compareTaskPanels = document.querySelectorAll('.compare-task-panel');
  function setCompareTaskActive(target, fromUserGesture) {
    compareTaskButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-compare-task') === target;
      btn.classList.toggle('is-selected', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    compareTaskPanels.forEach(function (panel) {
      var shouldShow = panel.id === ('compare-' + target);
      panel.classList.toggle('is-compare-hidden', !shouldShow);
      var videos = panel.querySelectorAll('video');
      if (!shouldShow) {
        videos.forEach(function (v) { try { v.pause(); } catch (e) { } });
      }
      if (shouldShow && fromUserGesture) {
        videos.forEach(function (v) {
          try { v.muted = true; } catch (e) { }
          try { v.play(); } catch (e) { }
        });
      }
    });
    carouselInstances.forEach(function (instance) { refreshCarouselVideos(instance); });
  }
  if (compareTaskButtons.length && compareTaskPanels.length) {
    compareTaskButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setCompareTaskActive(btn.getAttribute('data-compare-task'), true);
      });
    });
    setCompareTaskActive(compareTaskButtons[0].getAttribute('data-compare-task'), true);
  }

  // Interpolation widget (optional — only if present in DOM)
  var slider = document.getElementById('interpolation-slider');
  if (slider) {
    preloadInterpolationImages();
    slider.addEventListener('input', function () {
      setInterpolationImage(this.value);
    });
    slider.max = String(NUM_INTERP_FRAMES - 1);
    setInterpolationImage(0);
  }

  if (window.bulmaSlider) {
    bulmaSlider.attach();
  }
});
