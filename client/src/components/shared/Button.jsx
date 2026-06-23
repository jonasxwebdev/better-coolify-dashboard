import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";


const VARIANTS = {
  primary:
    "bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-200 border-purple-500/40",
  secondary:
    "bg-white/5 hover:bg-white/10 active:bg-white/20 text-slate-300 border-white/10",
  success:
    "bg-green-500/20 hover:bg-green-500/40 active:bg-green-500/50 text-green-200 border-green-500/40",
  warning:
    "bg-yellow-500/20 hover:bg-yellow-500/40 active:bg-yellow-500/50 text-yellow-200 border-yellow-500/40",
  danger:
    "bg-red-500/20 hover:bg-red-500/40 active:bg-red-500/50 text-red-200 border-red-500/40",
  info: "bg-blue-500/20 hover:bg-blue-500/40 active:bg-blue-500/50 text-blue-200 border-blue-500/40",
  indigo:
    "bg-indigo-500/20 hover:bg-indigo-500/40 active:bg-indigo-500/50 text-indigo-200 border-indigo-500/40",
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
      className={`inline-flex items-center gap-1.5 ${sizeClasses} ${variantClasses} rounded-lg border transition font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
