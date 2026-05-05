/**
 * MAS Detroit Cub Scout Pack #2023 - Main JavaScript
 * This file handles scouts subpage interactions.
 */

document.addEventListener('DOMContentLoaded', function() {
  const page = document.getElementById('scouts-page');

  if (!page) {
    return;
  }

  // ============================================
  // PHOTO GALLERY
  // ============================================
  const galleryImages = [
    {
      src: 'assets/scout-photo-1.jpg',
      alt: 'Pack 2023 Scouts at an event',
      caption: 'Pack 2023 Adventures'
    },
    {
      src: 'assets/scout-photo-2.jpg',
      alt: 'Cub Scouts group activity',
      caption: 'Learning Together'
    },
    {
      src: 'assets/scout-photo-3.jpg',
      alt: 'Pack 2023 outdoor activities',
      caption: 'Building Character'
    },
    {
      src: 'assets/38f4c35e-e087-48ee-b6d3-4573c2238ba0(1).jpg',
      alt: 'Cub Scouts group photo',
      caption: 'Pack 2023 Highlights'
    },
    {
      src: 'assets/IMG_0012.JPG',
      alt: 'Cub Scouts activity photo',
      caption: 'Outdoor Fun'
    },
    {
      src: 'assets/IMG_0013.JPG',
      alt: 'Cub Scouts activity photo',
      caption: 'Teamwork in Action'
    },
    {
      src: 'assets/IMG_0018(1).JPG',
      alt: 'Cub Scouts activity photo',
      caption: 'Trail Moments'
    },
    {
      src: 'assets/IMG_0020(1).JPG',
      alt: 'Cub Scouts activity photo',
      caption: 'Scout Spirit'
    }
  ];

  let currentIndex = 0;
  const galleryImage = page.querySelector('#gallery-image');
  const galleryCaptionText = page.querySelector('#gallery-caption-text');
  const galleryCounter = page.querySelector('#gallery-counter');
  const galleryPrev = page.querySelector('#gallery-prev');
  const galleryNext = page.querySelector('#gallery-next');
  const thumbnails = page.querySelectorAll('.gallery-thumb');

  function updateGallery() {
    if (!galleryImage || !galleryCaptionText || !galleryCounter) {
      return;
    }

    const image = galleryImages[currentIndex];
    galleryImage.src = image.src;
    galleryImage.alt = image.alt;
    galleryCaptionText.textContent = image.caption;
    galleryCounter.textContent = `${currentIndex + 1} of ${galleryImages.length}`;

    thumbnails.forEach((thumb, index) => {
      if (index === currentIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  if (galleryPrev && galleryNext) {
    galleryPrev.addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      updateGallery();
    });

    galleryNext.addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % galleryImages.length;
      updateGallery();
    });
  }

  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', function() {
      currentIndex = index;
      updateGallery();
    });
  });

  // ============================================
  // CONTACT FORM
  // ============================================
  const contactForm = page.querySelector('#contact-form');
  const toast = page.querySelector('#toast');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const message = formData.get('message');

      // Create mailto link with form data
      const subject = encodeURIComponent('Pack #2023 Inquiry from ' + name);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        (phone ? 'Phone: ' + phone + '\n' : '') +
        '\nMessage:\n' + message
      );
      
      // Open email client
      window.location.href = 'mailto:scouts@masdetroit.org?subject=' + subject + '&body=' + body;
      
      // Show toast notification
      showToast();
      
      // Reset form
      contactForm.reset();
    });
  }

  function showToast() {
    if (toast) {
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 4000);
    }
  }

  // ============================================
  // SMOOTH SCROLLING FOR ANCHOR LINKS
  // ============================================
  page.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});
