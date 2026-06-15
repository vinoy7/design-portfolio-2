/**
 * Shared live position of the detached tab pill (TabNav's matter-js body).
 *
 * TabNav writes to this every physics frame while the pill is popped off;
 * HeroDots reads it each animation frame to repel dots as the pill flies
 * through the dotted hero picture. A plain mutable singleton keeps the two
 * portaled components decoupled (no prop drilling, no context).
 */
export const pill = {
  active: false, // true while the pill is detached and physics-driven
  x: 0, // viewport-space center (matches clientX/clientY)
  y: 0,
  r: 0, // pill half-size (radius of influence base)
};
