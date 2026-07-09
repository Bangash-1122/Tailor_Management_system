export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizeMap = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  const spinner = (
    <div className={`${sizeMap[size]} rounded-full border-indigo-500 border-t-transparent animate-spin`} />
  );
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0f1e]/80 z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
