"use client";

import Loader from "@/components/Loader";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function ResetPassword() {
	const { status } = useSession();
	const router = useRouter();
	const [email, setEmail] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isResending, setIsResending] = useState<boolean>(false);
	const date = new Date();

	useEffect(() => {
		if (status === "authenticated") {
			toast.success("Login Successful!");
			router.push("/");
		}
	}, [status, router]);

	useEffect(() => {
		const storedEmail = localStorage.getItem("email");
		if (storedEmail) {
			setEmail(storedEmail);
		}
	}, []);

	const [otp, setOtp] = useState<{ [key: number]: string }>({
		1: "",
		2: "",
		3: "",
		4: "",
	});

	const refs: { [key: number]: React.RefObject<HTMLInputElement> } = {
		1: useRef(null),
		2: useRef(null),
		3: useRef(null),
		4: useRef(null),
	};

	const handleChange = (index: number, text: string) => {
		setOtp((prevOtp) => ({ ...prevOtp, [index]: text }));
		if (text) refs[index + 1]?.current?.focus();
		else refs[index - 1]?.current?.focus();
	};

	const formSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		const verificationCode = Object.values(otp).join("");

		try {
			const response = await axios.post(
				"https://api.quanskill.com/api/v1/auth/verify-reset-otp",
				{ otp: verificationCode },
				{
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.data.user_id) {
				localStorage.setItem("userId", response.data.data.user_id);
			} else {
				console.error("user id is undefined");
			}

			if (response.status == 200) {
				toast.success("OTP verified successfully");
				router.push("/change-password");
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				const errorMessage =
					error.response?.data?.message || "An error occurred";
				console.error("Error response:", error.response?.data);
				toast.error(errorMessage);
			} else {
				console.error("Unexpected error:", error);
				toast.error("An unexpected error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const resendCode = async () => {
		setIsResending(true);
		const userEmail = localStorage.getItem("email");
		console.log("Email Retrieved:", userEmail);

		try {
			const response = await axios.post(
				"https://api.quanskill.com/api/v1/auth/forgot-password",
				{ email: userEmail },
				{ headers: { Accept: "application/json", referer: "aitechma.com" } }
			);

			console.log(response.data);
			toast.success("OTP resent successfully");
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
			setIsResending(false);
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
						Enter OTP
					</p>
					<p className="text-sm text-gray-500 text-center">
						We&apos;ve sent a code to{" "}
						<span className="text-dark-1">{email}</span>
					</p>

					<form className="w-full mt-6" onSubmit={formSubmit}>
						<div className="mb-4 flex gap-4 justify-center">
							{[1, 2, 3, 4].map((num) => (
								<input
									key={num}
									type="text"
									maxLength={1}
									ref={refs[num]}
									value={otp[num]}
									onChange={(e) => handleChange(num, e.target.value)}
									className="w-[70px] h-20 text-dark-1 focus:border-secondary-1 focus:border-[1px] bg-white rounded-lg p-2 border border-dark-1 shadow-inner focus:outline-none focus:border-primary mt-2 placeholder:text-[#525254] text-center text-lg font-semibold font-inter"
								/>
							))}
						</div>

						<button
							type="submit"
							className="w-full bg-[#0B2F9F] text-white p-3 rounded-lg mt-4"
							disabled={isLoading}>
							{isLoading ? "loading..." : "Verify OTP"}
						</button>
					</form>

					<div className="bg-primary p-3 mt-4 w-full text-center">
						<p className="text-primary-1 text-sm">
							Experiencing issues signing in?{" "}
							<Link href="https://www.quanskill.com/contact-us" className="underline">
								Contact Support
							</Link>
						</p>
						<button
							onClick={resendCode}
							disabled={isResending}
							className="text-dark-1 underline">
							{isResending ? "Resending..." : "Resend Code"}
						</button>
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
