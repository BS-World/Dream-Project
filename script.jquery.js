$(document).ready(function () {
  const $internshipDropdownToggle = $("#internship-dropdown-toggle");
  const $internshipDropdown = $("#internship-dropdown");

  $internshipDropdownToggle.on("click", function (event) {
    event.stopPropagation();
    $internshipDropdown.toggleClass("hidden");

    const isExpanded = !$internshipDropdown.hasClass("hidden");
    $internshipDropdownToggle.attr("aria-expanded", isExpanded);
  });

  $(document).on("click", function (event) {
    if (
      !$(event.target).closest($internshipDropdown).length &&
      !$(event.target).closest($internshipDropdownToggle).length
    ) {
      $internshipDropdown.addClass("hidden");
      $internshipDropdownToggle.attr("aria-expanded", "false");
    }
  });

  const $mobileMenuBtn = $("#mobile-menu-button");
  const $mobileMenu = $("#mobile-menu");
  const $bar = $("#bars");
  const $close = $("#close");

  $mobileMenuBtn.on("click", function (event) {
    event.stopPropagation();
    $mobileMenu.addClass("translate-x-0");
    $mobileMenu.removeClass("translate-x-full");
    $bar.toggleClass("hidden");
    $close.toggleClass("hidden");
  });

  $close.on("click", function (event) {
    event.stopPropagation();
    $mobileMenu.addClass("translate-x-full");
    $mobileMenu.removeClass("translate-x-0");
    $bar.toggleClass("hidden");
    $close.toggleClass("hidden");
  });
});

// Counter Animation
function animateCounter() {
  $(".counter").each(function () {
    $(this)
      .prop("Counter", 0)
      .animate(
        {
          Counter: $(this).data("target"),
        },
        {
          duration: 2000,
          easing: "swing",
          step: function (now) {
            $(this).text(Math.ceil(now));
          },
        }
      );
  });
}

// Trigger counter animation when section is in view
$(window).scroll(function () {
  var statsSection = $(".counter").first().offset().top;
  var scroll = $(window).scrollTop();
  var windowHeight = $(window).height();

  if (scroll > statsSection - windowHeight + 100) {
    animateCounter();
  }
});
