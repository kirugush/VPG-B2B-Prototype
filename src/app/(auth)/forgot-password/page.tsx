"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { useApp } from "@/lib/store";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const { toast } = useApp();
  const router = useRouter();
  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast("If that email exists, a reset link has been sent.", "info"); router.push("/reset-password"); }}>
        <div><label className="label" htmlFor="e">Email Address</label><input id="e" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn-primary w-full" type="submit">Send Reset Link</button>
      </form>
      <p className="mt-5 text-center text-sm"><Link href="/login" className="text-brand-600 hover:underline">Back to Login</Link></p>
    </AuthShell>
  );
}
