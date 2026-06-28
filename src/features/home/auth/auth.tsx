import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Mail, LogIn, KeyRound, User, Building2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/api/mappers";
import { supabase } from "@/lib/supabase";
import { FrameworkProvider } from "@/context/FrameworkContext";
import {
  C,
  BrandMark,
  Card,
  Input,
  PrimaryBtn,
  Field,
  Select,
} from "@/features/home/shared/ui-kit";
import {
  LEVEL_OPTIONS,
  PENDING_INVITE_CODE_KEY,
  PENDING_WORKSPACE_INVITE_HASH_KEY,
} from "@/features/home/shared/constants";

function hasPendingWorkspaceInviteHash(): boolean {
  if (typeof window === "undefined") return false;
  const value = window.localStorage.getItem(PENDING_WORKSPACE_INVITE_HASH_KEY);
  return Boolean(value && value.trim().length > 0);
}

function redirectAfterAuthSuccess() {
  if (hasPendingWorkspaceInviteHash()) {
    window.location.href = "/";
    return;
  }
  const pendingInvite = sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
  if (pendingInvite) {
    sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
    window.location.href = `/invite?code=${encodeURIComponent(pendingInvite)}`;
  } else {
    window.location.href = "/";
  }
}

function SsoButton({ provider }: { provider: "Google" | "Microsoft" }) {
  const { signInWithGoogle, signInWithMicrosoft } = useAuth();
  const letter = provider === "Google" ? "G" : "M";
  const bg = provider === "Google" ? "#EA4335" : "#0078D4";
  return (
    <button
      type="button"
      onClick={() => (provider === "Google" ? signInWithGoogle() : signInWithMicrosoft())}
      className="w-full h-10 px-3 rounded border flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[#F4F5F7] transition-colors"
      style={{ borderColor: C.border, color: C.navy, background: "#fff" }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
        style={{ background: bg }}
      >
        {letter}
      </span>
      Continue with {provider}
    </button>
  );
}

function SigninForm({ onSwitch, notice }: { onSwitch: () => void; notice?: string | null }) {
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Enter your email and password to continue.");
      return;
    }
    const ok = await signin(email, password);
    if (!ok) {
      setErr("Invalid email or password. Please try again.");
      return;
    }
    redirectAfterAuthSuccess();
  }

  return (
    <Card className="p-7">
      <div className="text-xl font-bold" style={{ color: C.navy }}>
        Welcome back
      </div>
      <div className="text-xs mt-1" style={{ color: C.subtle }}>
        Sign in to track your evidence and competencies.
      </div>
      <div className="mt-5 space-y-2">
        <SsoButton provider="Google" />
        <SsoButton provider="Microsoft" />
      </div>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: C.border }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: C.subtle }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: C.border }} />
      </div>
      <form onSubmit={submit} className="space-y-4">
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "#ABF5D1", background: "#E3FCEF", color: "#006644" }}
          >
            <CheckCircle size={14} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
        {err && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "#F5BCB1", background: "#FFEBE6", color: "#BF2600" }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}
        <Field label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            icon={<Mail size={14} />}
          />
        </Field>
        <Field label="Password" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            icon={<KeyRound size={14} />}
          />
        </Field>
        <PrimaryBtn type="submit" className="w-full justify-center mt-2">
          <LogIn size={14} />
          Sign in
        </PrimaryBtn>
      </form>
      <div className="text-xs text-center mt-4" style={{ color: C.subtle }}>
        New to Evitrace?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold"
          style={{ color: C.primary }}
        >
          Create an account
        </button>
      </div>
    </Card>
  );
}

function SignupForm({ onSwitch }: { onSwitch: (notice?: string) => void }) {
  const { signup } = useAuth();
  const isManagerOnboarding =
    hasPendingWorkspaceInviteHash() || Boolean(sessionStorage.getItem(PENDING_INVITE_CODE_KEY));
  const [f, setF] = useState<AuthUser & { password: string }>({
    fullName: "",
    email: "",
    password: "",
    currentLevel: "",
    targetLevel: "",
    team: "",
    manager: "",
    managerEmail: "",
    skipLevel: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const upd = <K extends keyof AuthUser>(k: K, v: AuthUser[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const required: (keyof (AuthUser & { password: string }))[] = isManagerOnboarding
      ? ["fullName", "email", "password", "currentLevel"]
      : ["fullName", "email", "password", "currentLevel", "targetLevel", "team"];
    for (const k of required) {
      if (!String(f[k]).trim()) {
        setErr("Please complete all required fields marked with *.");
        return;
      }
    }
    try {
      const unifiedCurrentLevel = f.currentLevel.trim();
      const ok = await signup({
        ...f,
        currentLevel: unifiedCurrentLevel,
        jobTitle: unifiedCurrentLevel,
      });
      if (ok) {
        if (isManagerOnboarding) {
          redirectAfterAuthSuccess();
          return;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          redirectAfterAuthSuccess();
          return;
        }
        onSwitch("Account created. Please verify your email, then sign in.");
      }
    } catch {
      setErr("Something went wrong while creating your account. Please try again.");
    }
  }

  return (
    <Card className="p-7 sm:p-8">
      <div className="text-xl font-bold" style={{ color: C.navy }}>
        {isManagerOnboarding ? "Complete Your Manager Profile" : "Create your account"}
      </div>
      <div className="text-xs mt-1" style={{ color: C.subtle }}>
        {isManagerOnboarding ? (
          "Set your professional title to connect with your engineer's workspace metrics."
        ) : (
          <>
            Fields marked <span style={{ color: "#DE350B" }}>*</span> are required. You can complete
            optional fields later in Settings.
          </>
        )}
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SsoButton provider="Google" />
        <SsoButton provider="Microsoft" />
      </div>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: C.border }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: C.subtle }}>
          or sign up with email
        </span>
        <div className="flex-1 h-px" style={{ background: C.border }} />
      </div>
      <form onSubmit={submit} className="space-y-6">
        {err && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "#F5BCB1", background: "#FFEBE6", color: "#BF2600" }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}
        <section>
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-3"
            style={{ color: C.subtle }}
          >
            Account
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <Input
                value={f.fullName}
                onChange={(e) => upd("fullName", e.target.value)}
                placeholder="Jordan Mills"
                icon={<User size={14} />}
              />
            </Field>
            <Field label="Work email" required>
              <Input
                type="email"
                value={f.email}
                onChange={(e) => upd("email", e.target.value)}
                placeholder="you@company.com"
                icon={<Mail size={14} />}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Password" required hint="At least 8 characters.">
                <Input
                  type="password"
                  value={f.password}
                  onChange={(e) => upd("password", e.target.value)}
                  placeholder="Create a password"
                  icon={<KeyRound size={14} />}
                />
              </Field>
            </div>
          </div>
        </section>

        {isManagerOnboarding ? (
          <section>
            <div
              className="text-[11px] font-bold uppercase tracking-wider mb-3"
              style={{ color: C.subtle }}
            >
              Manager Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Corporate title"
                required
                hint='For example: "Engineering Manager", "Director of Engineering", or "VP of Engineering".'
              >
                <Input
                  value={f.currentLevel}
                  onChange={(e) => upd("currentLevel", e.target.value)}
                  placeholder="Engineering Manager"
                />
              </Field>
              <Field label="Management track level" optional>
                <Input
                  value={f.targetLevel}
                  onChange={(e) => upd("targetLevel", e.target.value)}
                  placeholder="M2 (optional)"
                />
              </Field>
            </div>
          </section>
        ) : (
          <section>
            <div
              className="text-[11px] font-bold uppercase tracking-wider mb-3"
              style={{ color: C.subtle }}
            >
              Role & Levels
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Current Job Title / Level"
                required
                hint="Your current role/title in your organization (e.g. Senior Engineer, L3)."
              >
                <Select
                  value={f.currentLevel}
                  onChange={(e) => upd("currentLevel", e.target.value)}
                >
                  <option value="">Select your current level</option>
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Target level" required hint="The next level you're aiming for.">
                <Input
                  value={f.targetLevel}
                  onChange={(e) => upd("targetLevel", e.target.value)}
                  placeholder="Staff Engineer"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Business unit / Team" required>
                  <Input
                    value={f.team}
                    onChange={(e) => upd("team", e.target.value)}
                    placeholder="Payments Platform"
                    icon={<Building2 size={14} />}
                  />
                </Field>
              </div>
            </div>
          </section>
        )}

        <PrimaryBtn type="submit" className="w-full justify-center">
          {isManagerOnboarding ? "Complete Setup & Launch Workspace" : "Create account"}
        </PrimaryBtn>
      </form>
      <div className="text-xs text-center mt-5" style={{ color: C.subtle }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch()}
          className="font-semibold"
          style={{ color: C.primary }}
        >
          Sign in
        </button>
      </div>
    </Card>
  );
}

function AuthScreens() {
  const [mode, setMode] = useState<"signin" | "signup">(() =>
    hasPendingWorkspaceInviteHash() ? "signup" : "signin",
  );
  const [signinNotice, setSigninNotice] = useState<string | null>(null);
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: C.bg, color: C.navy, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className={`w-full ${mode === "signup" ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-center gap-2 mb-6">
          <BrandMark size={36} />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
              Evitrace
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.subtle }}>
              Performance Intelligence
            </div>
          </div>
        </div>
        {mode === "signin" ? (
          <SigninForm
            notice={signinNotice}
            onSwitch={() => {
              setSigninNotice(null);
              setMode("signup");
            }}
          />
        ) : (
          <SignupForm
            onSwitch={(notice) => {
              setSigninNotice(notice ?? null);
              setMode("signin");
            }}
          />
        )}
      </div>
    </div>
  );
}

function AppGate({ EvitraceApp }: { EvitraceApp: React.ComponentType }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    if (window.location.pathname === "/") return;
    window.location.replace("/");
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    if (hasPendingWorkspaceInviteHash()) return;
    const pendingInvite = sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
    if (!pendingInvite) return;
    sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
    window.location.href = `/invite?code=${encodeURIComponent(pendingInvite)}`;
  }, [user]);

  if (loading) return null;
  return user ? <EvitraceApp /> : <AuthScreens />;
}

export function HomeAuthApp({ EvitraceApp }: { EvitraceApp: React.ComponentType }) {
  return (
    <AuthProvider>
      <FrameworkProvider>
        <AppGate EvitraceApp={EvitraceApp} />
      </FrameworkProvider>
    </AuthProvider>
  );
}
