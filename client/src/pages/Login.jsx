import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { login, verify2FA } from "../api/auth";

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!requires2FA) {
        const response = await login(username, password);
        if (response.requires2FA) {
          setRequires2FA(true);
          setFailedAttempts(0);
          toast.success(t("auth.credentialsVerified"), {
            icon: <CheckCircleIcon className="w-5 h-5" />,
          });
        } else {
          // Development mode - 2FA disabled, direct login
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));

          toast.success(t("auth.loginSuccess"), {
            icon: <CheckCircleIcon className="w-6 h-6" />,
          });

          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        }
      } else {
        const response = await verify2FA(username, password, twoFactorCode);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        toast.success(t("auth.loginSuccess"), {
          icon: <CheckCircleIcon className="w-6 h-6" />,
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      }
    } catch (err) {
      if (requires2FA) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          toast.error(t("auth.tooManyAttempts"), {
            icon: <XCircleIcon className="w-6 h-6" />,
            duration: 2000,
          });
          setTimeout(() => {
            setRequires2FA(false);
            setTwoFactorCode("");
            setFailedAttempts(0);
          }, 2000);
        } else {
          toast.error(
            err.response?.data?.message || t("auth.invalidTwoFactorCode"),
            {
              icon: <ExclamationTriangleIcon className="w-5 h-5" />,
            }
          );
          setTwoFactorCode("");
        }
      } else {
        toast.error(err.response?.data?.message || t("auth.loginError"), {
          icon: <XCircleIcon className="w-5 h-5" />,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = requires2FA
    ? twoFactorCode.trim() !== "" && twoFactorCode.length === 6
    : username.trim() !== "" && password.trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="bg-white/1 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="mb-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {t("dashboard.title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {!requires2FA ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  {t("auth.username")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
                  placeholder={t("auth.username")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base pr-12 overflow-hidden text-ellipsis"
                    placeholder={t("auth.password")}
                    required
                  />

                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors z-10"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 drop-shadow-lg" />
                      ) : (
                        <EyeIcon className="w-5 h-5 drop-shadow-lg" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3 text-center">
                {t("auth.twoFactorCode")}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={twoFactorCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    setTwoFactorCode(value);
                  }
                }}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-center text-3xl font-mono tracking-[0.5em] font-bold"
                placeholder="000000"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                required
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {t("auth.twoFactorInfo")}
                </p>
                {failedAttempts > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(MAX_ATTEMPTS)].map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index < failedAttempts
                              ? "bg-red-500"
                              : "bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-red-400">
                      {failedAttempts}/{MAX_ATTEMPTS}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full cursor-pointer
              bg-gradient-to-r from-purple-500 to-indigo-600
              text-white py-2.5 md:py-3 rounded-lg font-semibold
              transition duration-200 shadow-lg transform
              hover:-translate-y-0.5 hover:from-purple-400 hover:to-indigo-500 hover:shadow-xl
              active:from-purple-700 active:to-indigo-800
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:from-purple-500 disabled:hover:to-indigo-600
              disabled:hover:translate-y-0 disabled:hover:shadow-lg
              touch-manipulation`}
          >
            {loading
              ? requires2FA
                ? t("auth.verifying")
                : t("common.loading")
              : requires2FA
                ? t("auth.verify")
                : t("auth.login")}
          </button>

          {requires2FA && (
            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setTwoFactorCode("");
                setFailedAttempts(0);
              }}
              className="w-full text-slate-300 hover:text-white transition text-sm"
            >
              ← {t("common.cancel")}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
