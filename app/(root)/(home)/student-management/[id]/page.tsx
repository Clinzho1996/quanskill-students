"use client";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import StudentCourseTable from "@/config/student-course-column";
import { IconArrowBack, IconEdit, IconSettings } from "@tabler/icons-react";
import axios from "axios";
import { getSession, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

interface ApiResponse {
	data: Student;
}

interface Student {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	pic: string | null;
	gender: string;
	is_active: boolean;
	created_at: string;
}
function StudentDetails() {
	const { id } = useParams();
	const { data: session } = useSession();

	const [isModalOpen, setModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [lecturer, setLecturer] = useState<Student | null>(null);
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

	const fetchStudentData = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();

			const accessToken = session?.accessToken;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.quanskill.com/api/v1/user/${id}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			console.log("data", response?.data?.data);

			const data = response?.data?.data;
			setLecturer(response?.data?.data);
			setFormData({
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				phone: data.phone,
				gender: data.gender,
			});
			setIsLoading(false);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error fetching post:",
					error.response?.data || error.message
				);
			} else {
				console.log("Unexpected error:", error);
			}
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchStudentData();
	}, [fetchStudentData]);

	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

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
				`https://api.quanskill.com/api/v1/user/student/profile-pic/${id}`,
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
			fetchStudentData();
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload profile picture");
			// Keep the preview visible so user can try again
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateStudent = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			await axios.post(
				`https://api.quanskill.com/api/v1/user/update-student/${id}`,
				formData,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Student updated successfully");
			// Clear form data after successful update
			setFormData({
				first_name: "",
				last_name: "",
				email: "",
				phone: "",
				gender: "",
			});
			fetchStudentData();
			setModalOpen(false);
		} catch (error) {
			console.error("Error updating lecturer:", error);
			toast.error("Failed to update lecturer");
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (rawDate: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate = new Date(rawDate);
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	if (isLoading) {
		return <Loader />;
	}
	return (
		<section className="bg-[#F6F8F9] min-h-screen">
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
								onClick={handleUpdateStudent}>
								Update Student
							</Button>
						</div>
					</div>
				</div>
			</Modal>
			<div className="flex flex-row justify-between items-center bg-white p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
				<div className="flex flex-row justify-start gap-2 items-center">
					<div>
						<Link href="/student-management">
							<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
								<IconArrowBack size={18} />
							</div>
						</Link>
					</div>
					<div>
						<h2 className="text-sm text-dark-1 font-normal font-inter">
							Student Information
						</h2>
						<p className="text-xs font-light text-dark-2 font-inter">
							View and manage staff data, including contact information, roles,
							and performance records.
						</p>
					</div>
				</div>
				<div className="hidden lg:flex flex-row justify-start gap-2 items-center">
					<Link href="/settings">
						<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
							<IconSettings size={18} />
						</div>
					</Link>
					{session?.user && (
						<div className="md:flex flex-row justify-end gap-2 items-center mx-2 px-2">
							{session?.user && (
								<div className="md:flex flex-row justify-end gap-2 items-center mx-1 px-2">
									<div className="flex p-1 bg-primary-1 justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="profile"
												className="object-cover w-full h-full lg:w-[35px] lg:h-[35px]"
												width={30}
												height={30}
											/>
										) : (
											<div className="flex items-center justify-center w-full h-full">
												<h2 className="text-white font-bold text-lg">
													{getNameInitials({
														name: session?.user?.name || "",
													})}
												</h2>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="bg-[#F6F8FA] p-1 m-6 shadow-md rounded-lg border-[1px] border-[#E2E4E9]">
				<div className="flex flex-row justify-between items-center">
					<div className="p-3">
						<p className="text-dark-1 text-sm font-inter font-medium">
							Basic Information
						</p>
						<p className="text-[#6B7280] text-xs font-inter font-medium">
							Manage User Profile
						</p>
					</div>
					<div>
						<IconEdit
							size={18}
							className="cursor-pointer"
							onClick={() => setModalOpen(true)}
						/>
					</div>
				</div>
				<div className="p-3 bg-white rounded-lg shadow-md h-[300px]">
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
										src="/images/avats.png"
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
					<div className="flex flex-row justify-start w-full items-center gap-20 mt-3">
						<div className="flex flex-col gap-2 w-[33%] lg:w-full">
							<p className="text-[#6B7280] text-sm font-inter font-medium">
								Full Name
							</p>
							<p className="text-dark-1 text-sm font-inter font-medium">
								{lecturer?.first_name} {lecturer?.last_name}
							</p>
						</div>
						<div className="flex flex-col gap-2 w-[33%] lg:w-full">
							<p className="text-[#6B7280] text-sm font-inter font-medium">
								Email Address
							</p>
							<p className="text-dark-1 text-sm font-inter font-medium">
								{lecturer?.email}
							</p>
						</div>
						<div className="flex flex-col gap-2 w-[33%] lg:w-full">
							<p className="text-[#6B7280] text-sm font-inter font-medium">
								Phone Number
							</p>
							<p className="text-dark-1 text-sm font-inter font-medium">
								{lecturer?.phone}
							</p>
						</div>
					</div>

					<div className="flex flex-row justify-start items-center gap-20 mt-8 w-full">
						<div className="flex flex-col gap-2 w-[33%] lg:w-full">
							<p className="text-[#6B7280] text-sm font-inter font-medium">
								Gender
							</p>
							<p className="text-dark-1 text-sm font-inter font-medium capitalize">
								{lecturer?.gender}
							</p>
						</div>
						<div className="flex flex-col gap-2 w-[33%] lg:w-full">
							<p className="text-[#6B7280] text-sm font-inter font-medium">
								Status
							</p>
							<div className="w-full">
								{lecturer?.is_active ? (
									<span className="bg-[#D1FAE5] w-full status-inner green my-auto items-center rounded-lg text-xs font-inter">
										Active
									</span>
								) : (
									<span className="bg-[#FEF4C7] w-full status-inner yellow px-2 py-1 my-auto items-center rounded-lg text-xs font-inter text-[#B45309]">
										Pending
									</span>
								)}
							</div>
						</div>
						<div className="flex flex-col gap-2 w-[33%] lg:w-full">
							<p className="text-[#6B7280] text-sm font-inter font-medium">
								Date Joined
							</p>
							<p className="text-dark-1 text-sm font-inter font-medium">
								{formatDate(lecturer?.created_at || "")}
							</p>
						</div>
					</div>
				</div>

				<div className="p-3 border-t-[1px] border-t-[#E2E4E9] mt-4">
					<p>Course Enrollment</p>
				</div>
				<div className="bg-white rounded-lg shadow mt-2">
					<StudentCourseTable />
				</div>
			</div>
		</section>
	);
}

export default StudentDetails;
