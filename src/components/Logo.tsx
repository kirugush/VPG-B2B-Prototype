// Primary business logo supplied in the brief. Hotlinked; copy into /public for production.
export const VPG_LOGO = "https://resources.vinodpatel.com.fj/hubfs/VP%20horizontal%20(1).png";
export const LOGIN_BG = VPG_LOGO;

export function VpgLogo({ className = "h-10" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={VPG_LOGO} alt="Vinod Patel Group" className={`${className} w-auto object-contain`} />;
}
