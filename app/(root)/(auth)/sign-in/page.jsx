"use client";

import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SignIn() {
	const { status } = useSession();
	const date = new Date();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);

	const [form, setForm] = useState({ email: "", password: "" });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (status === "authenticated") {
			toast.success("Login Successful!");
			router.push("/");
		}
	}, [status, router]);

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!form.email || !form.password) {
			toast.error("Please fill in all fields.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				redirect: false,
				email: form.email,
				password: form.password,
			});

			if (result?.error) {
				toast.error(result.error);
			} else {
				router.push("/");
			}
		} catch (error) {
			toast.error("Login failed. Please try again.");
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading") {
		return <Loader />;
	}

	return (
		<div className="w-full flex flex-col lg:flex-row justify-between items-center h-screen">
			<div className="w-full lg:w-[45%] flex flex-col gap-10 py-[2%] px-[4%] mx-auto my-auto">
				<div className="bg-white p-6 rounded-lg flex flex-col items-center">
					<Image
						src="/images/logo.png"
						alt="Logo"
						width={200}
						height={50}
						className="mx-auto"
					/>

					<p className="text-[16px] font-semibold text-center mt-4">
						Login to access your student dashboard
					</p>
					<p className="text-sm text-gray-500 text-center">
						Enter your details to continue
					</p>

					<form className="w-full mt-6" onSubmit={handleSubmit}>
						<div className="mb-4">
							<label className="text-sm text-gray-700 font-medium font-inter">
								Email address
							</label>
							<input
								type="email"
								placeholder="Enter your email"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								className="w-full bg-[#9F9E9E29] rounded-lg p-2 border border-gray-300 focus:outline-none focus:border-primary mt-1 shadow-inner"
								required
							/>
						</div>

						<div className="mb-4">
							<label className="text-sm text-gray-700 font-medium">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={form.password}
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
									className="w-full bg-[#9F9E9E29] rounded-lg p-2 border border-gray-300 focus:outline-none focus:border-primary mt-1 shadow-inner"
									required
								/>
								<button
									type="button"
									className="absolute right-3 top-[55%] translate-y-[-50%] text-[#7d7c81]"
									onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
						</div>

						<p className="text-sm text-[#7d7c81] font-inter">
							6-14 characters with at least one letter and number
						</p>
						<div className="flex flex-row justify-between items-center mt-2">
							<div className="flex flex-row justify-start gap-2 items-center">
								<Input
									type="checkbox"
									className="w-4 h-4 bg-primary-1 checked:bg-primary-1 aria-checked:bg-primary-1"
									id="rememberMe"
								/>
								<p className="text-sm text-[#7d7c81] font-inter">Remember me</p>
							</div>
							<div>
								<Link
									href="/forgot-password"
									className=" text-[#0B2F9F] underline">
									Forgot Password?
								</Link>
							</div>
						</div>

						<button
							type="submit"
							className="w-full bg-[#0B2F9F] text-white p-3 rounded-lg mt-4"
							disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign In"}
						</button>
					</form>

					<div className="bg-primary p-3 mt-4 w-full text-center">
						<p className="text-primary-1 text-sm">
							Experiencing issues signing in?{" "}
							<Link href="/" className="underline">
								Contact Support
							</Link>
						</p>
					</div>
				</div>
				<p className="flex flex-row justify-start items-center gap-2 text-[14px] font-medium font-inter text-[#6B7280]">
					&copy; {date.getFullYear()} Quanskill
				</p>
			</div>
			<div className="w-full lg:w-[50%] hidden lg:flex bg-[#F9FAFB] p-3 rounded-lg">
				<Image
					alt="notify"
					src="/images/bg3.png"
					width={500}
					height={500}
					className="w-full h-screen object-cover"
				/>
			</div>
		</div>
	);
}
