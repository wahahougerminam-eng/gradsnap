/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lightweight in-browser celebration confetti explosion
 */
export function fireGraduationConfetti() {
  const count = 75;
  const colors = ['#D4AF37', '#F3C64F', '#38BDF8', '#F43F5E', '#10B981', '#FFFFFF', '#6366F1'];
  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;
    const isRound = Math.random() > 0.5;

    el.style.position = 'absolute';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = '-20px';
    el.style.width = `${size}px`;
    el.style.height = `${isRound ? size : size * 1.5}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = isRound ? '50%' : '2px';
    el.style.opacity = '1';
    el.style.transform = `rotate(${Math.random() * 360}deg)`;

    const duration = Math.random() * 2000 + 2000;
    const endX = (Math.random() - 0.5) * 300;
    const endRotation = Math.random() * 720;

    el.animate(
      [
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${endX}px, 105vh) rotate(${endRotation}deg)`, opacity: 0 }
      ],
      {
        duration: duration,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
      }
    );

    container.appendChild(el);
  }

  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 4500);
}
