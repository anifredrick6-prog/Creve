/**
 * Renders the Creve mark recolored to any CSS color, using the PNG as a mask.
 * This works because the PNG is a solid black shape on a transparent
 * background — the mask technique uses its alpha channel as a stencil
 * and fills it with whatever `color` is passed in, no need for separate
 * color exports of the logo file.
 *
 * The PNG itself must live at /public/logo.png (served at "/logo.png").
 */
function Logo({ color = '#1C1B19', size = 32, className = '' }) {
  return (
    <span
      role="img"
      aria-label="Creve"
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: 'url(/logo.png)',
        maskImage: 'url(/logo.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

export default Logo
