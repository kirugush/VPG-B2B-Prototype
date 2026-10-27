"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/ui";
import { useApp } from "@/lib/store";

const RULES: [string, (p: string) => boolean][] = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["One uppercase letter", (p) => /[A-Z]/.test(p)],
  ["One lowercase letter", (p) => /[a-z]/.test(p)],
  ["One number", (p) => /\d/.test(p)],
  ["One special character", (p) => /[^A-Za-z0-9]/.test(p)],
];

export default function ResetPage() {
  const [pw, setPw] = useState("");
  const [cf, setCf] = useState("");
  const { resetPassword, toast } = useApp();
  const router = useRouter();
  const valid = RULES.every(([, t]) => t(pw)) && pw === cf;
  return (
    <AuthShell title="Reset your password">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!valid) return; resetPassword(pw); toast("Password reset successfully."); router.push("/password-changed"); }}>
        <div><label className="label" htmlFor="np">New Password</label><PasswordInput id="np" value={pw} onChange={setPw} autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="cp">Confirm Password</label><PasswordInput id="cp" value={cf} onChange={setCf} autoComplete="new-password" /></div>
        <div className="rounded-md bg-slate-50 p-3 text-sm">
          <p className="mb-1 font-medium">Your password must contain:</p>
          <ul className="space-y-1">
            {[...RULES.map(([l, t]) => [l, t(pw)] as const), ["Both passwords match", pw.length > 0 && pw === cf] as const].map(([l, ok]) => (
              <li key={l} className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-slate-500"}`}>{ok ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}{l}</li>
            ))}
          </ul>
        </div>
        <button className="btn-primary w-full" type="submit" disabled={!valid}>Reset Password</button>
      </form>
      <p className="mt-5 text-center text-sm"><Link href="/login" className="text-brand-600 hover:underline">Back to Login</Link></p>
    </AuthShell>
  );
}
