import logoImg from "@/assets/BlueSky_AgrITech_Logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ className = "", size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-9 w-auto",
    lg: "h-12 w-auto",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoImg}
        alt="BlueSky AgriTech"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className="font-semibold text-lg tracking-tight text-foreground">
          BlueSky AgriTech
        </span>
      )}
    </div>
  );
};

export default Logo;