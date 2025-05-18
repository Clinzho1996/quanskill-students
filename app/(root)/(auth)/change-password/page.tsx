"use client";

import Loader from "@/components/Loader";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ChangePassword() {
	const { status } = useSession();
	const router = useRouter();

	const [form, setForm] = useState({ password: "", confirmPassword: "" });
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const date = new Date();

	useEffect(() => {
		if (status === "authenticated") {
			toast.success("Login Successful!");
			router.push("/dashboard");
		}
	}, [status, router]);

	const formSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await axios.post(
				"https://api.quanskill.com/api/v1/auth/reset-password",
				{
					user_id: localStorage.getItem("userId"),
					password: form.password,
					password_confirmation: form.confirmPassword,
				},
				{
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status == 200) {
				toast.success("Password changed successfully");
				router.push("/sign-in");
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// Corrected error message access
				if (error.response && error.response.data) {
					toast.error(error?.response?.data?.message);
					console.log("Error response:", error.response.data);
				} else {
					toast.error("An error occurred.");
					console.log("Error response: An error occurred.");
				}
			} else {
				toast.error("Something went wrong. Please try again.");
				console.log("Unexpected error:", error);
			}
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
						Reset Password
					</p>
					<p className="text-sm text-gray-500 text-center">
						Create a new password so you could proceed with login.
					</p>

					<form className="w-full mt-6" onSubmit={formSubmit}>
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

						<div className="mb-4">
							<label className="text-sm text-gray-700 font-medium">
								Confirm Password
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={form.confirmPassword}
									onChange={(e) =>
										setForm({ ...form, confirmPassword: e.target.value })
									}
									className="w-full bg-[#9F9E9E29] rounded-lg p-2 border border-gray-300 focus:outline-none focus:border-primary mt-1 shadow-inner"
									required
								/>
								<button
									type="button"
									className="absolute right-3 top-[55%] translate-y-[-50%] text-[#7d7c81]"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
									{showConfirmPassword ? (
										<EyeOff size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							</div>
						</div>

						<p className="text-sm text-[#7d7c81] font-inter">
							6-14 characters with at least one letter and number
						</p>

						<button
							type="submit"
							className="w-full bg-[#0B2F9F] text-white p-3 rounded-lg mt-4"
							disabled={isLoading}>
							{isLoading ? "Loading..." : "Create Password"}
						</button>
					</form>

					<div className="bg-primary p-3 mt-4 w-full text-center">
						<p className="text-primary-1 text-sm">
							Experiencing issues signing in?{" "}
							<Link
								href="https://www.quanskill.com/contact-us"
								className="underline">
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
