function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-[2px] border border-[#e1e1e1] bg-white p-8">
        <h1 className="mb-1 text-[24px] font-semibold text-[#323130]">{title}</h1>
        {subtitle ? <p className="mb-6 text-[14px] text-[#605e5c]">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}

export default AuthCard;
