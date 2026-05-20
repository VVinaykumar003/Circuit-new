import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">{children}</div>
    </div>
  );
}
