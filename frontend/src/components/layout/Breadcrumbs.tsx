import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight, MdHome } from "react-icons/md";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex text-[11px] font-medium text-base-content/60 mb-1.5" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-1.5">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-primary transition-colors">
            <MdHome size={13} className="mr-1" />
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const title = value.replace(/-/g, " ");

          // Truncate MongoDB ObjectIds to keep the UI clean
          const displayTitle =
            value.length === 24 && /^[0-9a-fA-F]{24}$/.test(value)
              ? `...${value.slice(-6)}`
              : title;

          return (
            <li key={to}>
              <div className="flex items-center">
                <MdChevronRight size={13} className="mx-0.5 opacity-50" />
                {last ? (
                  <span className="capitalize font-semibold text-primary" aria-current="page">
                    {displayTitle}
                  </span>
                ) : (
                  <Link to={to} className="capitalize hover:text-primary transition-colors">
                    {displayTitle}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
