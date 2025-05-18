"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Category {
	id: string;
	name: string;
}

interface LecturerInfo {
	id: string;
	first_name: string;
	last_name: string;
	// other lecturer fields...
}

interface ApiCourseData {
	id?: string;
	title: string;
	category_id: string;
	level: string;
	amount: string;
	lecturers: LecturerInfo[]; // For API response
	cover_image?: string;
}

interface FormCourseData {
	id?: string;
	title: string;
	category_id: string;
	level: string;
	amount: string;
	lecturers: string[]; // For form state (just IDs)
	cover_image?: string;
}

function BasicInfo() {
	const router = useRouter();
	const { id: courseId } = useParams<{ id: string }>();

	const [formData, setFormData] = useState<FormCourseData>({
		title: "",
		category_id: "",
		level: "",
		amount: "",
		lecturers: [],
	});
	const [categories, setCategories] = useState<Category[]>([]);
	const [lecturers, setLecturers] = useState<LecturerInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
	const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
		null
	);

	const fetchCategories = async () => {
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.get<{ data: Category[] }>(
				"https://api.quanskill.com/api/v1/category",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);
			setCategories(response.data.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
			toast.error("Failed to load categories");
		}
	};

	const fetchLecturers = async () => {
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.get<{ data: LecturerInfo[] }>(
				"https://api.quanskill.com/api/v1/lecturer",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);
			setLecturers(response.data.data);
		} catch (error) {
			console.error("Error fetching lecturers:", error);
			toast.error("Failed to load lecturers");
		}
	};

	const fetchCourseData = async (id: string) => {
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			const response = await axios.get<{ data: ApiCourseData }>(
				`https://api.quanskill.com/api/v1/course/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			const course = response.data.data;
			setFormData({
				title: course.title,
				category_id: course.category_id,
				level: course.level,
				amount: course.amount,
				lecturers: course.lecturers.map((lecturer) => lecturer.id), // Now TypeScript knows lecturer is an object
			});

			if (course.cover_image) {
				setCoverImagePreview(course.cover_image);
			}
		} catch (error) {
			console.error("Failed to fetch course data:", error);
			toast.error("Failed to load course data");
		}
	};

	// Initialize form
	useEffect(() => {
		const initializeForm = async () => {
			setIsLoading(true);
			try {
				await Promise.all([fetchCategories(), fetchLecturers()]);

				if (courseId) {
					await fetchCourseData(courseId);
				}
			} catch (error) {
				console.error("Failed to initialize form:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initializeForm();
	}, [courseId]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryChange = (value: string) => {
		setFormData((prev) => ({ ...prev, category_id: value }));
	};

	const handleLecturerChange = (lecturerIds: string[]) => {
		setFormData((prev) => ({ ...prev, lecturers: lecturerIds }));
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCoverImageFile(file);
			setCoverImagePreview(URL.createObjectURL(file));
		}
	};

	const handleSubmit = async () => {
		try {
			if (
				!formData.title ||
				!formData.category_id ||
				!formData.level ||
				formData.lecturers.length === 0
			) {
				toast.error("Please fill all required fields");
				return;
			}

			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			const formPayload = new FormData();
			formPayload.append("title", formData.title);
			formPayload.append("level", formData.level);
			formPayload.append("amount", formData.amount);
			formPayload.append("category_id", formData.category_id);
			formData.lecturers.forEach((lecturerId) => {
				formPayload.append("lecturers[]", lecturerId);
			});

			if (coverImageFile) {
				formPayload.append("cover_image", coverImageFile);
			}

			const response = await axios.post(
				`https://api.quanskill.com/api/v1/course/update-setting/${courseId}`,
				formPayload,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.status === "success") {
				toast.success(response.data.message || "Course updated successfully!");
				router.push("/course-management");
			} else {
				throw new Error(response.data.message || "Update failed");
			}
		} catch (error) {
			console.error("Update failed:", error);
			toast.error(error instanceof Error ? error.message : "Update failed");
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading course data...</p>
			</div>
		);
	}

	return (
		<div>
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">
					Edit Course Information
				</p>
				<p className="text-xs text-primary-6">Update course details</p>
			</div>

			<div className="bg-white p-3 rounded-lg shadow">
				<div className="flex flex-col gap-2">
					<p className="text-sm text-primary-6">Course Title</p>
					<Input
						type="text"
						name="title"
						className="focus:border-none"
						placeholder="Enter Course Title"
						value={formData.title}
						onChange={handleInputChange}
					/>

					<div className="flex flex-row justify-between items-center gap-5">
						<div className="w-full">
							<p className="text-sm text-primary-6 mt-2">Category</p>
							<Select
								value={formData.category_id}
								onValueChange={handleCategoryChange}>
								<SelectTrigger className="w-full text-[#7D7C81] focus:border-secondary-1 focus:border-[1px] bg-white rounded-lg p-2 border border-[#00000029] shadow-inner focus:outline-none focus:border-primary mt-2 placeholder:text-[#7D7C81] placeholder:font-inter">
									<SelectValue placeholder="Select Category" />
								</SelectTrigger>
								<SelectContent className="text-white bg-white">
									{categories.map((category) => (
										<SelectItem
											key={category.id}
											value={category.id}
											className="text-dark-1 bg-white capitalize">
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="w-full">
							<p className="text-sm text-primary-6 mt-2">Level</p>
							<Select
								value={formData.level}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, level: value }))
								}>
								<SelectTrigger className="w-full text-[#7D7C81] focus:border-secondary-1 focus:border-[1px] bg-white rounded-lg p-2 border border-[#00000029] shadow-inner focus:outline-none focus:border-primary mt-2 placeholder:text-[#7D7C81] placeholder:font-inter">
									<SelectValue placeholder="Select Level" />
								</SelectTrigger>
								<SelectContent className="text-white bg-white">
									<SelectItem value="beginner" className="text-dark-1 bg-white">
										Beginner
									</SelectItem>
									<SelectItem
										value="intermediate"
										className="text-dark-1 bg-white">
										Intermediate
									</SelectItem>
									<SelectItem value="advanced" className="text-dark-1 bg-white">
										Advanced
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="w-full">
							<p className="text-sm text-primary-6 mt-2">Amount</p>
							<Input
								type="text"
								name="amount"
								className="focus:border-none mt-2"
								placeholder="Enter amount"
								value={formData.amount}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<p className="text-sm text-primary-6 mt-2">
						Assigned Course to Lecturer
					</p>
					<Select
						value=""
						onValueChange={(value) => {
							if (value && !formData.lecturers.includes(value)) {
								handleLecturerChange([...formData.lecturers, value]);
							}
						}}>
						<SelectTrigger className="w-full text-[#7D7C81] focus:border-secondary-1 focus:border-[1px] bg-white rounded-lg p-2 border border-[#00000029] shadow-inner focus:outline-none focus:border-primary mt-2 placeholder:text-[#7D7C81] placeholder:font-inter">
							<SelectValue placeholder="Select Lecturer" />
						</SelectTrigger>
						<SelectContent className="text-white bg-white">
							{lecturers.map((lecturer) => (
								<SelectItem
									key={lecturer.id}
									value={lecturer.id}
									className="text-dark-1 bg-white">
									{lecturer.first_name} {lecturer.last_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{formData.lecturers.length > 0 && (
						<div className="mt-2 space-y-2">
							{formData.lecturers.map((lecturerId) => {
								const lecturer = lecturers.find((l) => l.id === lecturerId);
								const name = lecturer
									? `${lecturer.first_name || ""} ${
											lecturer.last_name || ""
									  }`.trim()
									: "Unknown Lecturer";
								return (
									<div
										key={lecturerId}
										className="flex items-center justify-between p-2 bg-gray-50 rounded">
										<span>{name || "Unknown Lecturer"}</span>
										<button
											onClick={() =>
												handleLecturerChange(
													formData.lecturers.filter((id) => id !== lecturerId)
												)
											}
											className="text-red-500 hover:text-red-700">
											<IconTrash size={16} />
										</button>
									</div>
								);
							})}
						</div>
					)}

					<hr className="my-4" />
					<p className="text-sm text-primary-6">Cover Image</p>

					<div className="relative w-full h-[200px] bg-[#F6F8FA] border-[1px] border-[#FFFFFF12] rounded-lg flex items-center justify-center">
						{coverImagePreview ? (
							<>
								<Image
									src={coverImagePreview}
									alt="cover"
									width={205}
									height={280}
									className="rounded-lg object-cover w-full h-full"
								/>
								<button
									onClick={() => {
										setCoverImagePreview(null);
										setCoverImageFile(null);
										toast.success("Cover image removed!");
									}}
									className="absolute top-2 right-2 rounded-full bg-primary-1 p-2">
									<IconTrash size={16} color="#FFF" />
								</button>
							</>
						) : (
							<label className="flex flex-col items-center justify-center cursor-pointer">
								<IconUpload size={24} color="#7D7C81" />
								<p className="text-sm text-[#7D7C81] mt-2">
									Upload Cover Image
								</p>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleCoverImageChange}
								/>
							</label>
						)}
					</div>
				</div>
			</div>
			<div className="flex flex-row justify-end">
				<Button
					className="bg-secondary-1 text-white mt-4"
					onClick={handleSubmit}>
					Update Course
				</Button>
			</div>
		</div>
	);
}

export default BasicInfo;
