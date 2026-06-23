import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";


const VARIANTS = {
  primary:
    "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent",
  secondary:
    "bg-secondary hover:bg-accent text-secondary-foreground border-border",
  success:
    "bg-success/15 hover:bg-success/25 text-success border-success/30",
  warning:
    "bg-warning/15 hover:bg-warning/25 text-warning border-warning/30",
  danger:
    "bg-destructive/15 hover:bg-destructive/25 text-destructive border-destructive/30",
  info: "bg-info/15 hover:bg-info/25 text-info border-info/30",
  indigo:
    "bg-secondary hover:bg-accent text-secondary-foreground border-border",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const Button = ({
  children,
  variant = "primary",
  size = "sm",
  icon: Icon,
  onClick,
  disabled = false,
  className = "",
  playClickSound = true,
  ...props
}) => {
  const { playSound } = useSoundEffects();

  const handleClick = (e) => {
    if (playClickSound) {
      playSound(SOUND_TYPES.CLICK);
    }
    onClick?.(e);
  };

  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.sm;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 ${sizeClasses} ${variantClasses} rounded-md border transition-colors font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
