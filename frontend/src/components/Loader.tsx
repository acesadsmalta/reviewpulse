interface LoaderProps {
  className?: string;
  size?: number | string;
  fullScreen?: boolean;
}

export default function Loader({ className = '', size = 44, fullScreen = true }: LoaderProps) {
  const loaderEl = (
    <div 
      className={`relative animate-spin rounded-full border-[3px] border-slate-200 border-t-[#2563EB] ${className}`} 
      style={{ width: size, height: size }}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        {loaderEl}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 w-full">
      {loaderEl}
    </div>
  );
}
