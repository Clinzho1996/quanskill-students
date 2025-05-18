"use client";
import { IconEdit } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface Lecturer {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	pic: string | null;
	gender: string;
	status: boolean;
	created_at: string;
}

function BasicInfo() {
	const { id } = useParams();
	const [isModalOpen, setModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [lecturer, setLecturer] = useState<Lecturer | null>(null);
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		gender: "male",
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fetchLecturerData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get(
				`https://api.quanskill.com/api/v1/lecturer/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			const data = response.data.data;
			setLecturer(data);
			setFormData({
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				phone: data.phone,
				gender: data.gender,
			});
		} catch (error) {
			console.error("Error fetching lecturer data:", error);
			toast.error("Failed to fetch lecturer data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchLecturerData();
		}
	}, [id]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleGenderChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			gender: value,
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);

			// Create preview URL
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageUpload = async () => {
		if (!selectedFile || !id) return;

		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const formData = new FormData();
			formData.append("pic", selectedFile);

			await axios.post(
				`https://api.quanskill.com/api/v1/lecturer/update-pic/${id}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Profile picture updated successfully");
			// Clear preview and selected file after successful upload
			setImagePreview(null);
			setSelectedFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			fetchLecturerData();
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload profile picture");
			// Keep the preview visible so user can try again
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateLecturer = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			await axios.post(
				`https://api.quanskill.com/api/v1/lecturer/update-basic/${id}`,
				formData,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Lecturer updated successfully");
			fetchLecturerData();
			setModalOpen(false);
		} catch (error) {
			console.error("Error updating lecturer:", error);
			toast.error("Failed to update lecturer");
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	if (isLoading || !lecturer) {
		return <div className="flex-center p-3">Loading...</div>;
	}

	return (
		<div>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				title="Edit Basic Information">
				<div className="bg-white p-0 rounded-lg w-[600px] transition-transform lecturer ease-in-out">
					<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
						<div className="flex flex-col gap-2">
							<p className="text-xs text-primary-6">First Name</p>
							<Input
								type="text"
								name="first_name"
								className="focus:border-none mt-2"
								value={formData.first_name}
								onChange={handleInputChange}
							/>
							<p className="text-xs text-primary-6 mt-2">Last Name</p>
							<Input
								type="text"
								name="last_name"
								className="focus:border-none mt-2"
								value={formData.last_name}
								onChange={handleInputChange}
							/>
							<p className="text-xs text-primary-6 mt-2">Email Address</p>
							<Input
								type="text"
								name="email"
								className="focus:border-none mt-2"
								value={formData.email}
								onChange={handleInputChange}
							/>
							<p className="text-xs text-primary-6 mt-2">Phone Number</p>
							<Input
								type="text"
								name="phone"
								className="focus:border-none mt-2"
								value={formData.phone}
								onChange={handleInputChange}
							/>
							<p className="text-xs text-primary-6 mt-2">Gender</p>

							<RadioGroup
								value={formData.gender}
								onValueChange={handleGenderChange}>
								<div className="flex flex-row justify-between items-center gap-5">
									<div className="flex flex-row justify-start items-center gap-2 shadow-md p-2 rounded-lg">
										<RadioGroupItem value="male" id="male" />
										<p className="text-sm text-primary-6 whitespace-nowrap">
											Male
										</p>
									</div>
									<div className="flex flex-row justify-start items-center gap-2 shadow-md p-2 rounded-lg">
										<RadioGroupItem value="female" id="female" />
										<p className="text-sm text-primary-6 whitespace-nowrap">
											Female
										</p>
									</div>
									<div className="flex flex-row justify-start items-center gap-2 shadow-md p-2 rounded-lg">
										<RadioGroupItem value="other" id="other" />
										<p className="text-sm text-primary-6 whitespace-nowrap">
											Other
										</p>
									</div>
								</div>
							</RadioGroup>
						</div>
						<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />
						<div className="flex flex-row justify-end items-center gap-3 font-inter">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={() => setModalOpen(false)}>
								Cancel
							</Button>
							<Button
								className="bg-secondary-1 text-white font-inter text-xs"
								onClick={handleUpdateLecturer}>
								Update Lecturer
							</Button>
						</div>
					</div>
				</div>
			</Modal>

			<div className="flex flex-row justify-between items-center p-3">
				<p className="text-sm text-dark-1 font-medium">Basic Information</p>
				<IconEdit
					size={18}
					className="cursor-pointer"
					onClick={() => setModalOpen(true)}
				/>
			</div>
			<div className="bg-white rounded-lg shadow-lg p-3 w-full">
				<div className="flex items-center gap-4">
					<div className="relative group">
						{imagePreview ? (
							<>
								<Image
									src={imagePreview}
									width={50}
									height={50}
									alt="Preview"
									className="rounded-full w-[50px] h-[50px] object-cover"
								/>
								<div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<IconEdit size={16} className="text-white" />
								</div>
							</>
						) : lecturer?.pic ? (
							<Image
								src={lecturer.pic}
								width={50}
								height={50}
								alt="profile"
								className="rounded-full w-[50px] h-[50px] object-cover"
							/>
						) : (
							<div className="relative">
								<Image
									src="/images/avatar.png"
									width={50}
									height={50}
									alt="profile"
									className="rounded-full"
								/>
								<div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<IconEdit size={16} className="text-white" />
								</div>
							</div>
						)}
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="absolute inset-0 opacity-0 cursor-pointer"
							ref={fileInputRef}
						/>
					</div>
					{selectedFile && (
						<div className="flex gap-2">
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
				</div>

				<div className="flex flex-row justify-start items-start gap-20 w-full mt-2">
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-normal">Name</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturer.first_name} {lecturer.last_name}
						</p>
					</div>
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-light">Phone Number</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturer.phone}
						</p>
					</div>
				</div>

				<div className="flex flex-row justify-start items-start gap-20 mt-4">
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-normal">Email Address</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturer.email}
						</p>
					</div>
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-light">Gender</p>
						<p className="text-dark-1 text-sm font-semibold font-inter capitalize">
							{lecturer.gender}
						</p>
					</div>
				</div>

				<div className="flex flex-row justify-start items-start gap-20 mt-4">
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-normal">Date Added</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{formatDate(lecturer.created_at)}
						</p>
					</div>
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-light">Status</p>
						<p className={`status-inner ${lecturer.status ? "green" : "red"}`}>
							{lecturer.status ? "Active" : "Inactive"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BasicInfo;
