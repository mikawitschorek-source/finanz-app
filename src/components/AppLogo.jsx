export default function AppLogo({ size = 32, className = "" }) {
  return (
    <img
      src="/finanz-app/icon-192.png"
      alt="FinanzPlanner Logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", borderRadius: "22%" }}
      className={className}
    />
  );
}
