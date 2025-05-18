"use client";

import Loader from "@/components/Loader";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPassword() {
	const { status } = useSession();
	const date = new Date();
	const router = useRouter();

	const [form, setForm] = useState({ email: "", password: "" });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (status === "authenticated") {
			toast.success("Login Successful!");
			router.push("/");
		}
	}, [status, router]);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (form.email === "") {
			toast.error("Please fill in all fields");
			return;
		}

		setIsLoading(true);

		try {
			const response = await axios.post(
				"https://api.quanskill.com/api/v1/auth/forgot-password",
				{ email: form.email },
				{
					headers: {
						Accept: "application/json",
						referer: "aitechma.com",
					},
				}
			);

			localStorage.setItem("email", form.email);
			toast.success("Email sent successfully!");
			console.log("Response Data:", response.data);

			router.push("/reset-password");
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
						Forgot Password?
					</p>
					<p className="text-sm text-gray-500 text-center">
						Enter your email and we&apos;ll send you a link to get back into
						your account
					</p>

					<form className="w-full mt-6" onSubmit={submit}>
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

						<button
							type="submit"
							className="w-full bg-[#0B2F9F] text-white p-3 rounded-lg mt-4"
							disabled={isLoading}>
							{isLoading ? "loading..." : "Continue"}
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
