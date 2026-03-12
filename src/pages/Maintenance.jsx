function Maintenance() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 mb-2">
        <span className="material-symbols-outlined text-4xl">construction</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        System Under Maintenance
      </h1>
      <p className="max-w-md text-sm md:text-base text-slate-500 dark:text-slate-400">
        The cabana management system is temporarily unavailable while maintenance is in
        progress. Please contact a SUPER_USER if you need urgent access.
      </p>
    </div>
  );
}

export default Maintenance;

