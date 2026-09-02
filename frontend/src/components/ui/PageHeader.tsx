interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-base-content w-full">
      <div className="flex items-center gap-2.5">
        
         {icon && <div className="text-2xl text-primary flex-shrink-0 flex items-center justify-center">{icon}</div>} 
        <div>
          <h1 className="text-base font-semibold text-base-content">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-base-content/60 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
