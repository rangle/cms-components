import NextImage from 'next/image';

interface ImageProps {
  image: string;
  alt?: string;
  width?: number;
  height?: number;
  size?: string;
  className?: string;
}

export const Image = ({
  image,
  alt = '',
  width = 3500,
  height = 2000,
  size = '100vw',
  className,
}: ImageProps) => {
  return (
    <NextImage
      className={className}
      alt={alt}
      width={width}
      height={height}
      sizes={size}
      src={image}
    />
  );
};
