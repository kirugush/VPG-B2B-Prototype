import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";

export default function Page() {
  return (
    <AuthShell title="Password changed">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <p className="mt-3 text-sm text-slate-600">Your password was changed successfully. You can now sign in with your new password.</p>
        <Link href="/login" className="btn-primary mt-6 w-full">Back to Login</Link>
      </div>
    </AuthShell>
  );
}
