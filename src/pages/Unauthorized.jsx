function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 mb-2">
        <span className="material-symbols-outlined text-4xl">block</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Access Denied
      </h1>
      <p className="max-w-md text-sm md:text-base text-slate-500 dark:text-slate-400">
        You do not have permission to view this page. If you believe this is an error,
        please contact a SUPER_USER or system administrator.
      </p>
    </div>
  );
}

export default Unauthorized;

