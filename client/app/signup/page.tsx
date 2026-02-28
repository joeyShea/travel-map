"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, GraduationCap, Globe } from "lucide-react";

type AccountType = "traveler" | "student";
type Mode = "signup" | "signin";
type AnimPhase = "idle" | "out" | "in";

export default function SignUpPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signup");
    const [accountType, setAccountType] = useState<AccountType>("traveler");
    const [displayedType, setDisplayedType] = useState<AccountType>("traveler");
    const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: wire up to real auth (check email → sign in or sign up)
        router.push("/map");
    }

    function selectAccountType(type: AccountType) {
        if (type === displayedType || animPhase !== "idle") return;
        setAccountType(type);
        setAnimPhase("out");
        setTimeout(() => {
            setDisplayedType(type);
            setAnimPhase("in");
        }, 180);
        setTimeout(() => setAnimPhase("idle"), 360);
    }

    function toggleWord() {
        selectAccountType(displayedType === "traveler" ? "student" : "traveler");
    }

    const wordClass = animPhase === "out" ? "flip-word-out" : animPhase === "in" ? "flip-word-in" : "";

    const inputBase =
        "w-full rounded-lg border border-stone-200 bg-white/60 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-300";

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fdf8f0] px-6 py-16">
            {/* Decorative travel paths */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <svg className="absolute -left-8 top-8 opacity-[0.30]" width="280" height="200" fill="none">
                    <path
                        d="M10 180 Q80 80 200 120 Q240 135 270 100"
                        stroke="#b87a30"
                        strokeWidth="1.5"
                        strokeDasharray="7 10"
                        strokeLinecap="round"
                    />
                    <circle cx="200" cy="120" r="3.5" fill="#b87a30" />
                    <circle cx="270" cy="100" r="3.5" fill="#b87a30" />
                </svg>
                <svg className="absolute -right-8 bottom-8 opacity-[0.30]" width="280" height="200" fill="none">
                    <path
                        d="M270 20 Q190 80 140 60 Q80 40 20 100"
                        stroke="#b87a30"
                        strokeWidth="1.5"
                        strokeDasharray="7 10"
                        strokeLinecap="round"
                    />
                    <circle cx="140" cy="60" r="3.5" fill="#b87a30" />
                    <circle cx="20" cy="100" r="3.5" fill="#b87a30" />
                </svg>
                <svg className="absolute right-16 top-12 opacity-[0.20]" width="120" height="80" fill="none">
                    <path
                        d="M10 70 Q50 20 110 40"
                        stroke="#b87a30"
                        strokeWidth="1"
                        strokeDasharray="5 8"
                        strokeLinecap="round"
                    />
                </svg>
                <svg className="absolute bottom-12 left-16 opacity-[0.20]" width="120" height="80" fill="none">
                    <path
                        d="M110 10 Q70 60 10 40"
                        stroke="#b87a30"
                        strokeWidth="1"
                        strokeDasharray="5 8"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Logo */}
            <div className="mb-12 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-sm">
                    <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-stone-800">Travel Map</span>
            </div>

            {/* Hero heading */}
            {mode === "signup" ? (
                <h1 className="text-center text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl md:text-7xl">
                    You are a{" "}
                    <span className="relative inline-block">
                        {/* overflow-hidden clips the word as it slides up/down */}
                        <button
                            type="button"
                            onClick={toggleWord}
                            className="inline-block overflow-hidden text-amber-600 cursor-pointer hover:opacity-75 transition-opacity"
                            style={{ verticalAlign: "bottom" }}
                            aria-label="Toggle account type"
                        >
                            <span className={`inline-block ${wordClass}`}>{displayedType}</span>
                        </button>
                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-amber-300/70" />
                    </span>
                    .
                </h1>
            ) : (
                <h1 className="text-center text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl md:text-7xl">
                    Welcome back.
                </h1>
            )}

            {/* Account type toggle – signup only */}
            {mode === "signup" && (
                <div className="mt-6 flex gap-2">
                    <button
                        type="button"
                        onClick={() => selectAccountType("traveler")}
                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                            accountType === "traveler"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-stone-400 hover:text-stone-600"
                        }`}
                    >
                        <Globe className="h-3.5 w-3.5" />
                        Traveler
                    </button>
                    <button
                        type="button"
                        onClick={() => selectAccountType("student")}
                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                            accountType === "student"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-stone-400 hover:text-stone-600"
                        }`}
                    >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Student
                    </button>
                </div>
            )}

            <p className="mt-3 text-sm text-stone-400">
                {mode === "signin"
                    ? "Enter your email and password to continue."
                    : accountType === "traveler"
                      ? "Explore destinations, trips, and activities."
                      : "Write reviews and plan your next adventure."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-10 flex w-full max-w-sm flex-col gap-4">
                {mode === "signup" && (
                    <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className={inputBase}
                    />
                )}
                <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={inputBase}
                />
                <input
                    name="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={inputBase}
                />
                <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                    {mode === "signup" ? "Get started" : "Sign in"}
                </button>
            </form>

            <p className="mt-6 text-sm text-stone-400">
                {mode === "signup" ? (
                    <>
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setMode("signin")}
                            className="text-amber-600 hover:underline underline-offset-4"
                        >
                            Sign in
                        </button>
                    </>
                ) : (
                    <>
                        New here?{" "}
                        <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className="text-amber-600 hover:underline underline-offset-4"
                        >
                            Create an account
                        </button>
                    </>
                )}
            </p>
        </div>
    );
}
