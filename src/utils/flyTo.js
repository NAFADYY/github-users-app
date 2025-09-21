
export function flyTo(
  targetSelector,
  sourceEl,
  {
    duration = 900,
    easing = 'cubic-bezier(.19,1,.22,1)',
    shrink = 0.4
  } = {}
) {
  const target = document.querySelector(targetSelector);
  if (!target || !sourceEl) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const sRect = sourceEl.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();

  const root = getComputedStyle(document.documentElement);
  const bg = root.getPropertyValue('--fly-ghost-bg')?.trim() || '#f3f4f6';
  const border = root.getPropertyValue('--fly-ghost-border')?.trim() || 'rgba(0,0,0,.06)';
  const shadow = root.getPropertyValue('--fly-ghost-shadow')?.trim() || '0 10px 30px rgba(0,0,0,.12)';
  const overlay = root.getPropertyValue('--fly-ghost-overlay')?.trim() || 'linear-gradient(180deg, rgba(255,255,255,.30), rgba(255,255,255,.12))';

  // ghost
  const ghost = document.createElement('div');
  ghost.className = 'fly-clone';
  ghost.style.position = 'fixed';
  ghost.style.left = `${sRect.left}px`;
  ghost.style.top = `${sRect.top}px`;
  ghost.style.width = `${sRect.width}px`;
  ghost.style.height = `${sRect.height}px`;
  ghost.style.borderRadius = '16px';
  ghost.style.background = bg;
  ghost.style.border = `1px solid ${border}`;
  ghost.style.boxShadow = shadow;
  ghost.style.backgroundImage = overlay;
  ghost.style.zIndex = 9999;
  ghost.style.willChange = 'transform, opacity';
  ghost.style.transform = 'translate3d(0,0,0) scale(1)';
  ghost.style.opacity = '0.98'; 
  document.body.appendChild(ghost);

  const dx = (tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2);
  const dy = (tRect.top + tRect.height / 2) - (sRect.top + sRect.height / 2);

  // force reflow
  // eslint-disable-next-line no-unused-expressions
  ghost.offsetHeight;

  ghost.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
  ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${shrink})`;
  ghost.style.opacity = '0.25'; // يفضل يبقى مرئي طول الطريق

  const cleanup = () => {
    ghost.remove();
    const badge = document.querySelector(`${targetSelector} .fav-badge`);
    if (badge) {
      badge.classList.remove('pop');
      void badge.offsetWidth; // restart animation
      badge.classList.add('pop');
      setTimeout(() => badge.classList.remove('pop'), 350);
    }
  };

  ghost.addEventListener('transitionend', cleanup, { once: true });
  setTimeout(() => ghost.isConnected && cleanup(), duration + 120);
}
