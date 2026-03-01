import { AlertCircle } from "lucide-react";

const baseInputClass =
  "h-10 w-full rounded-[2px] border px-3 text-[14px] text-[#323130] placeholder:text-[#605e5c] outline-none transition focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#f3f3f3]";

function AuthField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  disabled,
  autoComplete,
  placeholder,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[14px] font-medium text-[#323130]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${baseInputClass} ${error ? "border-[#a4262c]" : "border-[#e1e1e1]"}`}
      />
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-[12px] text-[#a4262c]">
          <AlertCircle size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default AuthField;
