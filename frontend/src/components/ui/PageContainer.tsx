import type { ReactNode } from "react";

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function PageContainer({
  title,
  subtitle,
  action,
  children,
}: PageContainerProps) {
  return (
    <div className="p-6 space-y-6">
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h1 className="text-xl font-bold text-primary">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm font-medium text-base-content/60 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
