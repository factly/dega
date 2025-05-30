import placeholderImg from './placeholderImage.svg';

interface PlaceholderImageProps {
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
}

function PlaceholderImage({ 
  width = '100%',
  height = 'auto',
  maxWidth = '240px'
}: PlaceholderImageProps) {
  return (
    <img
      src={placeholderImg}
      width={width}
      height={height}
      alt="placeholder"
      className="object-contain p-4"
      style={{ maxWidth }}
    />
  );
}

export default PlaceholderImage;