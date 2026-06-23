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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm w-full max-w-md border border-border">
        <div className="mb-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("dashboard.title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {!requires2FA ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.username")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition text-base"
                  placeholder={t("auth.username")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition text-base pr-12 overflow-hidden text-ellipsis"
                    placeholder={t("auth.password")}
                    required
                  />

                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors z-10"
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
              <label className="block text-sm font-medium text-foreground mb-3 text-center">
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
                className="w-full px-4 py-4 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition text-center text-3xl font-mono tracking-[0.5em] font-bold"
                placeholder="000000"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                required
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
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
                              ? "bg-destructive"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-destructive">
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
              bg-primary hover:bg-primary/90
              text-primary-foreground py-2.5 md:py-3 rounded-md font-medium
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed
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
              className="w-full text-muted-foreground hover:text-foreground transition text-sm"
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
