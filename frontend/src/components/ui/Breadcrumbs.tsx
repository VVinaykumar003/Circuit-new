import { Link, useLocation } from "react-router-dom";
import { MdChevronRight, MdHome } from "react-icons/md";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex text-sm font-semibold text-base-content/70 mb-2" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-primary transition-colors">
            <MdHome size={18} className="mr-1" />
            Dashboard
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const title = value.replace(/-/g, " ");

          // Truncate MongoDB ObjectIds to keep the UI clean
          const displayTitle = value.length === 24 && /^[0-9a-fA-F]{24}$/.test(value) 
            ? `...${value.slice(-6)}` 
            : title;

          return (
            <li key={to}>
              <div className="flex items-center">
                <MdChevronRight size={18} className="mx-1 opacity-50" />
                {last ? (
                  <span className="capitalize  font-semibold text-base-content" aria-current="page">
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