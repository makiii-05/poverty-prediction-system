import UseScrollReveal from "../hooks/UseScrollReveal";

export default function RevealCard({ delay = 0, className = "", children }) {
  const [ref, visible] = UseScrollReveal(delay);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}