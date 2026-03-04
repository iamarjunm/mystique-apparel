import Image from 'next/image'
import { urlFor } from '../../sanity'

/**
 * @typedef {Object} SanityImageProps
 * @property {any} value
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [className]
 * @property {boolean} [priority]
 * @property {string} [alt]
 */

/**
 * @param {SanityImageProps} props
 */
export function SanityImage({
  value,
  width = 800,
  height,
  className,
  priority,
  alt,
}) {
  if (!value?.asset) return null

  const imageAlt = alt || value.alt || ''
  const imageHeight = height || Math.round(width / 1.5)

  return (
    <Image
      className={className}
      src={urlFor(value).width(width).height(imageHeight).url()}
      alt={imageAlt}
      width={width}
      height={imageHeight}
      priority={priority}
      placeholder={value.asset?.metadata?.lqip ? 'blur' : 'empty'}
      blurDataURL={value.asset?.metadata?.lqip}
    />
  )
}
