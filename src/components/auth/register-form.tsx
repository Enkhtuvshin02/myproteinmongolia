"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/account-context";
import { AuthCard, Field } from "./auth-card";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "password" | "confirm" | "form", string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const { user, hydrated, signUp } = useAccount();

  const [form, setForm] = useState({ lastName: "", firstName: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (hydrated && user) router.replace(redirect);
  }, [hydrated, user, redirect, router]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): Errors => {
    const er: Errors = {};
    if (!form.firstName.trim()) er.firstName = "Нэрээ оруулна уу.";
    if (!form.lastName.trim()) er.lastName = "Овгоо оруулна уу.";
    if (!emailRe.test(form.email.trim())) er.email = "И-мэйл хаяг буруу байна.";
    if (!/^\d{6,}$/.test(form.phone.trim())) er.phone = "Утасны дугаар буруу байна.";
    if (form.password.length < 6) er.password = "Нууц үг дор хаяж 6 тэмдэгт байна.";
    if (form.confirm !== form.password) er.confirm = "Нууц үг таарахгүй байна.";
    return er;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) { setErrors(er); return; }
    const res = await signUp({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    if (res.ok) router.push(redirect);
    else setErrors({ email: res.error });
  };

  const loginHref = redirect !== "/" ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";

  return (
    <AuthCard
      title="Бүртгүүлэх"
      subtitle="Шинэ бүртгэл үүсгэн худалдан авалтаа эхлүүлээрэй."
      footer={
        <>
          Бүртгэлтэй юу?{" "}
          <Link href={loginHref} className="font-medium text-brand hover:underline">
            Нэвтрэх
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Овог" required value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
          <Field label="Нэр" required value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
        </div>
        <Field label="И-Мэйл хаяг" required type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={set("email")} error={errors.email} />
        <Field label="Утасны дугаар" required inputMode="numeric" placeholder="99112233" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <Field label="Нууц үг" required type="password" autoComplete="new-password" placeholder="••••••••" value={form.password} onChange={set("password")} error={errors.password} />
        <Field label="Нууц үг давтах" required type="password" autoComplete="new-password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-3 font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          Бүртгүүлэх
        </button>
      </form>
    </AuthCard>
  );
}
