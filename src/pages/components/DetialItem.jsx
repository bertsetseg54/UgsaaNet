function DetailItem({ label, value, subValue }) {
  return (
    <div className="group">
      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 transition-colors group-hover:text-amber-500">
        {label}
      </label>
      <p className="text-base font-bold text-slate-800 leading-tight">
        {value || "Тодорхойгүй"}
      </p>
      {subValue && (
        <p className="text-[10px] text-slate-400 mt-1 font-medium">
          {subValue}
        </p>
      )}
    </div>
  );
}

export default DetailItem;
