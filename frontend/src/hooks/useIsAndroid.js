/**
 * useIsAndroid — lightweight Android detection hook.
 * Used to conditionally disable expensive visual effects
 * (Lenis smooth scroll, backdrop-filter blur, canvas globe 60fps)
 * that degrade performance specifically on Android Chrome.
 */

const IS_ANDROID = /Android/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
)

export function useIsAndroid() {
  return IS_ANDROID
}

export { IS_ANDROID }
