/**
 * The theme's hand-drawn slider arrow, verbatim from vibebevvy.com
 * (28.875 x 45 viewBox, points right). Mirror it with CSS for "previous".
 */
export function SliderArrow() {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      width="28.875"
      height="45"
      viewBox="0 0 28.875 45"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18.3283 13.8142C18.7386 16.412 21.3899 21.731 28.8375 21.731V23.2313C21.7535 23.2313 18.8766 28.5484 18.3213 31.1858L16.8536 30.8767C17.2972 28.7696 18.9992 25.2331 22.6349 23.2313H0.0375376V21.7313H22.4467C18.761 19.7277 17.1837 16.1826 16.8466 14.0479L18.3283 13.8142Z"
        fill="currentColor"
      />
    </svg>
  );
}
