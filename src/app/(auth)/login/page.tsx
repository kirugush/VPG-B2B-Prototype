"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function LoginPage() {
  const { login, user, ready } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (ready && user) router.replace("/"); }, [ready, user, router]);

  return (
    <AuthShell title="Sign in to your trade account">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const r = login(email, pw); setErr(r); if (!r) router.push("/"); }}>
        <div><label className="label" htmlFor="email">Email Address</label><input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></div>
        <div><label className="label" htmlFor="pw">Password</label><PasswordInput id="pw" value={pw} onChange={setPw} autoComplete="current-password" /></div>
        {err && <p className="rounded bg-red-50 p-2 text-sm text-red-700" role="alert">{err}</p>}
        <div className="text-right text-sm"><Link href="/forgot-password" className="text-brand-600 hover:underline">Forgot Password?</Link></div>
        <button className="btn-primary w-full" type="submit">Sign In</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">Don&apos;t have an account? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Register Now</Link></p>
      <div className="mt-5 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
        <p className="mb-1 font-semibold">Demo accounts (password <code>Password1!</code>)</p>
        {[["admin@demo.com","Admin"],["manager@demo.com","Senior Purchase Manager"],["buyer@demo.com","Junior Buyer"]].map(([e, r]) => (
          <button key={e} type="button" className="block text-left hover:text-brand-600" onClick={() => { setEmail(e); setPw("Password1!"); }}>{e} — {r}</button>
        ))}
      </div>
    </AuthShell>
  );
}
