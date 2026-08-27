import { GlassFab, GlassPaginationPill as SharedGlassPaginationPill } from './liquid-glass-mobile';

export const LiquidFab = ({
  icon,
  onClick,
  disabled = false,
  isLoading = false,
  bottom = '5',
  right,
  left,
  size = 56,
  zIndex = 50,
  className,
}) => (
  <GlassFab
    icon={icon}
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    bottom={`${Number(bottom) * 4}px`}
    right={right ? `${Number(right) * 4}px` : undefined}
    left={left ? `${Number(left) * 4}px` : undefined}
    size={size}
    zIndex={zIndex}
    className={className}
  />
);

export const LiquidPaginationPill = (props) => (
  <SharedGlassPaginationPill {...props} />
);
