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
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
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
  bulmaCarousel.attach('.carousel', options);

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
        try { video.pause(); } catch (e) {}
      }
      // Play the shown video only when this was triggered by a user click.
      if (video && shouldShow && fromUserGesture) {
        try { video.muted = true; } catch (e) {}
        try { video.play(); } catch (e) {}
      }
    });
  }
  if (sim2realButtons.length && sim2realPanels.length) {
    sim2realButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setSim2RealActive(btn.getAttribute('data-sim2real-target'), true);
      });
    });
    // Initialize to the first button's target.
    setSim2RealActive(sim2realButtons[0].getAttribute('data-sim2real-target'), false);
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
        videos.forEach(function (v) { try { v.pause(); } catch (e) {} });
      }
      // Play shown videos on user click (autoplay won't re-trigger on unhide).
      if (shouldShow && fromUserGesture) {
        videos.forEach(function (v) {
          if (!v.hasAttribute('autoplay')) return;
          try { v.muted = true; } catch (e) {}
          try { v.play(); } catch (e) {}
        });
      }
    });

    // Let bulma-carousel recalc widths after showing a different panel.
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }
  if (anytaskButtons.length && anytaskPanels.length) {
    anytaskButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setAnyTaskActive(btn.getAttribute('data-anytask-target'), true);
      });
    });
    setAnyTaskActive(anytaskButtons[0].getAttribute('data-anytask-target'), false);
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
        videos.forEach(function (v) { try { v.pause(); } catch (e) {} });
      }
      if (shouldShow && fromUserGesture) {
        videos.forEach(function (v) {
          if (!v.hasAttribute('autoplay')) return;
          try { v.muted = true; } catch (e) {}
          try { v.play(); } catch (e) {}
        });
      }
    });

    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }
  if (automateButtons.length && automatePanels.length) {
    automateButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setAutoMateActive(btn.getAttribute('data-automate-target'), true);
      });
    });
    setAutoMateActive(automateButtons[0].getAttribute('data-automate-target'), false);
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
        videos.forEach(function (v) { try { v.pause(); } catch (e) {} });
      }
      if (shouldShow && fromUserGesture) {
        videos.forEach(function (v) {
          if (!v.hasAttribute('autoplay')) return;
          try { v.muted = true; } catch (e) {}
          try { v.play(); } catch (e) {}
        });
      }
    });
  }
  if (compareTaskButtons.length && compareTaskPanels.length) {
    compareTaskButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setCompareTaskActive(btn.getAttribute('data-compare-task'), true);
      });
    });
    setCompareTaskActive(compareTaskButtons[0].getAttribute('data-compare-task'), false);
  }

  // Interpolation widget (optional — only if present in DOM)
  preloadInterpolationImages();
  var slider = document.getElementById('interpolation-slider');
  if (slider) {
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
