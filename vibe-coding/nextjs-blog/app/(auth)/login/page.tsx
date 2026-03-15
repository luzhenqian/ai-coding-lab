import { LoginForm } from "@/components/auth/LoginForm";
import { signIn } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back to the blog
          </p>
        </div>

        <LoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-950">
              Or
            </span>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded border border-gray-300 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Sign in with GitHub
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            href="/reset-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
