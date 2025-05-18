"use client";

import HeaderBox from "@/components/HeaderBox";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface User {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	pic: string | null;
	phone: string;
	gender: string;
}

function Settings() {
	const [user, setUser] = useState<User | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingUser, setIsFetchingUser] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	const fetchUserProfile = async () => {
		try {
			setIsFetchingUser(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const res = await axios.get("https://api.quanskill.com/api/v1/user", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			setUser(res.data?.data.users || res.data);
		} catch (error) {
			console.error("Failed to fetch user profile:", error);
			toast.error("Failed to fetch user profile");
		} finally {
			setIsFetchingUser(false);
		}
	};

	useEffect(() => {
		fetchUserProfile();
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);

			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageUpload = async () => {
		if (!selectedFile) return;

		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const formData = new FormData();
			formData.append("profile_pic", selectedFile);

			await axios.post(
				"https://api.quanskill.com/api/v1/user/profile-pic",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Profile picture updated successfully");

			// Refetch profile
			await fetchUserProfile();

			setImagePreview(null);
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload profile picture");
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetchingUser) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading user data...</p>
			</div>
		);
	}
	return (
		<div className="bg-[#F6F8F9] min-h-screen">
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col h-full px-4 py-2">
				<div className="bg-white flex flex-row border-[1px] border-[#E2E4E9] justify-between items-center p-3 rounded-t-lg">
					<div>
						<div className="flex flex-row justify-start items-center gap-2">
							<Image
								src="/images/staffm.png"
								alt="staff management"
								height={20}
								width={20}
							/>
							<p className="text-sm text-dark-1 font-medium font-inter">
								Settings
							</p>
						</div>
						<p className="text-xs text-primary-6 mt-3">
							Here is an overview of all the project
						</p>
					</div>
				</div>

				<div className="bg-[#F6F8F9] p-4 border-x-[1px] border-[#E2E4E9]">
					<h2 className="text-sm text-dark-1 font-medium font-inter">
						Account Settings
					</h2>
					<p className="text-xs text-dark-2">
						Configure and manage your account information, update your name,
						email, phone number, and other personal details.
					</p>
				</div>

				<div className="bg-white px-4 border-[1px] border-[#E2E4E9] rounded-b-lg py-10">
					{user && (
						<>
							<div className="flex flex-row justify-start items-start gap-20 w-full">
								<div className="w-full lg:w-[65%] pr-20">
									<div className="md:flex flex-col p-2 rounded-md justify-start gap-2 items-start mx-2 px-2 w-full">
										<div className="flex justify-start border-[1px] border-dark-3 rounded-full overflow-hidden relative group">
											{imagePreview ? (
												<Image
													src={imagePreview}
													alt="profile"
													className="object-cover w-[74px] h-[74px] rounded-full"
													width={74}
													height={74}
												/>
											) : user.pic ? (
												<Image
													src={user.pic}
													alt="profile"
													className="object-cover w-[74px] h-[74px] rounded-full"
													width={74}
													height={74}
												/>
											) : (
												<div className="flex items-center justify-center w-[74px] h-[74px] bg-gray-200 rounded-full">
													<h2 className="text-dark-1 font-bold text-lg">
														{getNameInitials({ name: user.first_name })}
													</h2>
												</div>
											)}
											<div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
												<span className="text-white text-xs">Change</span>
											</div>
											<input
												type="file"
												accept="image/*"
												onChange={handleFileChange}
												className="absolute inset-0 opacity-0 cursor-pointer"
												ref={fileInputRef}
											/>
										</div>

										{selectedFile && (
											<div className="flex gap-2 mt-3">
												<Button
													className="bg-secondary-1 text-white font-inter text-xs"
													onClick={handleImageUpload}
													disabled={isLoading}>
													{isLoading ? "Uploading..." : "Save Photo"}
												</Button>
												<Button
													variant="outline"
													className="text-xs font-inter"
													onClick={() => {
														setImagePreview(null);
														setSelectedFile(null);
														if (fileInputRef.current) {
															fileInputRef.current.value = "";
														}
													}}
													disabled={isLoading}>
													Cancel
												</Button>
											</div>
										)}

										<div className="flex flex-col justify-start items-start gap-3 w-full mt-4">
											<p className="text-dark-2 font-normal font-inter text-sm">
												Full Name
											</p>
											<h3 className="text-dark-1 text-sm font-normal font-inter border-[1px] border-[#9F9E9E40] p-2 rounded-lg w-full">
												{user.first_name} {user.last_name}
											</h3>
										</div>
									</div>
								</div>
							</div>

							<hr className="my-10" />

							<div className="flex flex-row justify-start items-start gap-20 w-full">
								<div className="w-full lg:w-[65%] pr-20">
									<div className="md:flex flex-col p-2 rounded-md justify-start gap-2 items-start mx-2 px-2 w-full">
										<div className="flex flex-col justify-start items-start gap-3 w-full">
											<p className="text-dark-2 font-normal font-inter text-sm">
												Email
											</p>
											<h3 className="text-dark-1 text-sm font-normal font-inter border-[1px] border-[#9F9E9E40] p-2 rounded-lg w-full">
												{user.email}
											</h3>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default Settings;
