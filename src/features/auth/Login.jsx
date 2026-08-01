import { useState } from "react";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, BarChart3, MapPin } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const setAuthLogin = useAuthStore((state) => state.login);

  const { values: formData, errors: formErrors, handleChange, validateAll } = useForm(
    { employee_code: "IED_01", pin: "123456" },
    {
      employee_code: [validators.required.withMessage("Employee code is required")],
      pin: [validators.required.withMessage("PIN is required")],
    }
  );
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateAll()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        employee_code: formData.employee_code.trim(),
        pin: formData.pin.trim(),
      });

      if (response?.data?.success && response?.data?.data) {
        const apiData = response.data.data;

        // Securely store authentication session via Zustand & authStorage
        setAuthLogin(apiData);

        // Navigate to authenticated dashboard
        navigate("/", { replace: true });
      } else {
        setError(
          response?.data?.message || "Invalid credentials. Please try again."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Live project insights",
      desc: "Track procurement, store, and site progress in real time.",
    },
    {
      icon: ShieldCheck,
      title: "Role-based access",
      desc: "Every module is scoped to your team's permissions.",
    },
    {
      icon: MapPin,
      title: "Field-ready",
      desc: "GPS-verified attendance and reporting from any site.",
    },
  ];

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* Left: Brand / Info panel */}
      <div className="hidden lg:flex relative flex-col justify-between bg-[#044C75] bg-linear-to-br from-[#0B5C8E] via-[#044C75] to-[#023350] text-white px-14 py-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/topography.svg')" }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/whiteLogo.svg" alt="IED Infrastructure" className="h-9 w-auto" />
          <span className="font-semibold tracking-wide text-lg">IED Infrastructure</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-[2.75rem] font-bold leading-tight tracking-tight">
            One platform for every site, every module, every team.
          </h1>
          <p className="mt-4 text-sky-100 text-base leading-relaxed">
            The IED Infrastructure ERP brings HR, procurement, store, and
            engineering operations together in a single, secure workspace.
          </p>

          <div className="mt-10 space-y-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-4.5 w-4.5" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sky-150/90 text-sm leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-sky-200/80">
          &copy; {new Date().getFullYear()} IED Infrastructure. All rights reserved.
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-10 bg-[#FAFAFC]">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          <div className="mb-8 flex justify-center lg:hidden">
            <img src="/colourLogo.svg" alt="IED Infrastructure" className="h-10 w-auto" />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in with your employee credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="employee_code" className="text-slate-700 font-semibold text-sm tracking-wide">
                Employee Code
              </Label>
              <Input
                id="employee_code"
                name="employee_code"
                autoComplete="username"
                value={formData.employee_code}
                onChange={handleChange}
                placeholder="e.g. IED_01"
                className={`h-11 rounded-lg border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-[#044C75]/25 focus-visible:border-[#044C75] transition-all ${formErrors.employee_code ? 'border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500' : ''}`}
              />
              {formErrors.employee_code && (
                <p className="text-red-500 text-xs font-medium mt-1">{formErrors.employee_code}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pin" className="text-slate-700 font-semibold text-sm tracking-wide">
                  PIN / Password
                </Label>
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#044C75] hover:text-[#023350] transition-colors"
                >
                  Forgot PIN?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="pin"
                  name="pin"
                  type={showPin ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter 6-digit PIN"
                  className={`h-11 rounded-lg border-slate-200 bg-slate-50/50 pr-11 text-slate-900 placeholder:text-slate-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-[#044C75]/25 focus-visible:border-[#044C75] transition-all ${formErrors.pin ? 'border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.pin && (
                <p className="text-red-500 text-xs font-medium mt-1">{formErrors.pin}</p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-lg bg-[#044C75] text-sm font-semibold text-white shadow-md shadow-[#044C75]/10 hover:shadow-[#044C75]/20 transition-all hover:bg-[#033B5C] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 lg:text-left">
            Having trouble signing in? Contact your site administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
