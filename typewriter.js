class TypeWriter {
  constructor(element, words, wait = 100) {
    this.element = element;
    this.words = words;
    this.txt = "";
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.type();
    this.isDeleting = false;
  }

  type() {
    // Get full word of current array
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    // Check if deleting
    if (this.isDeleting) {
      // Remove char
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      // Add char
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    // Insert txt into element with a wrapper to maintain line
    this.element.innerHTML = `<div class="inline-block"><span class="txt">${this.txt}</span></div>`;

    // Initial Type Speed
    let typeSpeed = 100;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    // If word is complete
    if (!this.isDeleting && this.txt === fullTxt) {
      // Make pause at end
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      // Move to next word
      this.wordIndex++;
      // Pause before start typing
      typeSpeed = 3000;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// Init On DOM Load
document.addEventListener("DOMContentLoaded", init);

// Init App
function init() {
  const element = document.getElementById("tagline");
  const words = [
    "Empowering the next generation of tech innovators with real-world internship experiences.",
    "Launch your tech career with hands-on learning and mentorship at Alfido Tech.",
    "Step into the future of technology with Alfido Tech internships and expert guidance.",
    "Alfido Tech: Where future tech leaders gain practical skills and grow.",
    "Accelerate your tech career with Alfido Tech's immersive internship programs.",
    "Unlock your potential with Alfido Tech's transformative internship opportunities.",
  ];
  const wait = 3000;

  // Init TypeWriter
  new TypeWriter(element, words, wait);
}
