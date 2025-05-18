"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	IconArrowBack,
	IconCircleFilled,
	IconPlus,
	IconSettings,
	IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Course {
	id: string;
	title: string;
	amount: string;
	cover_image: string;
}

interface CohortFormData {
	name: string;
	startDate: Date | null;
	endDate: Date | null;
	capacity: string;
	amount: string;
	coverImage: string | null;
	selectedCourses: Course[];
}

interface ApiResponse {
	status: string;
	message: string;
	data: {
		id: string;
		name: string;
		amount: string;
		enrollment_capacity: string;
		cover_image: string | null;
		start_date: string;
		end_date: string;
		status: string;
		created_at: string;
		updated_at: string;
		courses: Course[];
	};
}

interface CoursesResponse {
	status: string;
	message: string;
	data: Course[];
}

export default function EditCohort() {
	const router = useRouter();
	const { id } = useParams();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<CohortFormData>({
		name: "",
		startDate: null,
		endDate: null,
		capacity: "",
		amount: "",
		coverImage: null,
		selectedCourses: [],
	});
	const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	// Fetch cohort data to edit
	useEffect(() => {
		const fetchCohortData = async () => {
			try {
				const session = await getSession();
				if (!session?.accessToken) {
					console.error("No access token found.");
					return;
				}

				const response = await axios.get<ApiResponse>(
					`https://api.quanskill.com/api/v1/cohort/${id}`,
					{
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${session.accessToken}`,
						},
					}
				);

				const cohort = response.data.data;
				setFormData({
					name: cohort.name,
					startDate: new Date(cohort.start_date),
					endDate: new Date(cohort.end_date),
					capacity: cohort.enrollment_capacity,
					amount: cohort.amount,
					coverImage: cohort.cover_image,
					selectedCourses: cohort.courses || [],
				});

				setIsLoading(false);
			} catch (error) {
				console.error("Failed to fetch cohort data:", error);
				toast.error("Failed to load cohort data");
				router.push("/cohort-management");
			}
		};

		fetchCohortData();
	}, [id]);

	// Fetch available courses
	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const session = await getSession();
				if (!session?.accessToken) {
					console.error("No access token found.");
					return;
				}

				const response = await axios.get<CoursesResponse>(
					"https://api.quanskill.com/api/v1/course",
					{
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${session.accessToken}`,
						},
					}
				);

				setAvailableCourses(response.data.data);
			} catch (error) {
				console.error("Failed to fetch courses:", error);
			}
		};

		fetchCourses();
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleDateChange = (
		date: Date | undefined,
		field: "startDate" | "endDate"
	) => {
		if (date) {
			setFormData((prev) => ({ ...prev, [field]: date }));
		}
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData((prev) => ({
					...prev,
					coverImage: reader.result as string,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAddCourse = (course: Course) => {
		if (!formData.selectedCourses.some((c) => c.id === course.id)) {
			setFormData((prev) => ({
				...prev,
				selectedCourses: [...prev.selectedCourses, course],
			}));
		}
	};

	const handleRemoveCourse = (id: string) => {
		setFormData((prev) => ({
			...prev,
			selectedCourses: prev.selectedCourses.filter(
				(course) => course.id !== id
			),
		}));
	};

	const saveFormData = () => {
		localStorage.setItem("cohortFormData", JSON.stringify(formData));
	};

	const nextStep = () => {
		if (step === 1) {
			// Validate required fields
			if (!formData.name || !formData.startDate || !formData.endDate) {
				toast.error("Please fill all required fields");
				return;
			}
		}
		saveFormData();
		setStep((prev) => prev + 1);
	};

	const prevStep = () => {
		setStep((prev) => prev - 1);
	};

	const handleSubmit = async () => {
		if (formData.selectedCourses.length === 0) {
			toast.error("Please select at least one course");
			return;
		}

		setIsSubmitting(true);
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			const formPayload = new FormData();
			formPayload.append("name", formData.name);
			formPayload.append("amount", formData.amount);
			formPayload.append("enrollment_capacity", formData.capacity);
			formPayload.append(
				"start_date",
				formData.startDate?.toISOString().split("T")[0] || ""
			);
			formPayload.append(
				"end_date",
				formData.endDate?.toISOString().split("T")[0] || ""
			);

			// Add each course ID individually to the FormData
			formData.selectedCourses.forEach((course) => {
				formPayload.append("courses[]", course.id);
			});

			// Handle cover image upload
			if (formData.coverImage) {
				// If it's a new file (data URL)
				if (formData.coverImage.startsWith("data:")) {
					const blob = await fetch(formData.coverImage).then((res) =>
						res.blob()
					);
					formPayload.append("cover_image", blob, "cover.jpg");
				}
				// If it's the existing URL, we might not need to do anything
				// or send it as a string if your API expects it
			} else {
				// If cover image was removed
				formPayload.append("cover_image", "");
			}

			const response = await axios.put<ApiResponse>(
				`https://api.quanskill.com/api/v1/cohort/${id}`,
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
				toast.success("Cohort updated successfully!");
				router.refresh();
				router.push("/cohort-management");
			} else {
				throw new Error(response.data.message || "Failed to update cohort");
			}
		} catch (error: unknown) {
			console.error("Failed to update cohort:", error);
			let errorMessage = "Failed to update cohort";

			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.message || error.message;
				console.error("Detailed error:", error.response?.data);
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const filteredCourses = availableCourses.filter((course) =>
		course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="">
			<div className="flex flex-row justify-between items-center bg-white p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
				<div className="flex flex-row justify-start gap-2 items-center">
					<div>
						<Link href="/cohort-management">
							<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
								<IconArrowBack size={18} />
							</div>
						</Link>
					</div>
					<div>
						<h2 className="text-sm text-dark-1 font-normal font-inter">
							Edit Cohort
						</h2>
						<p className="text-xs font-light text-dark-2 font-inter">
							View and manage cohort data, including contact information, roles,
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
				</div>
			</div>
			{/* Step indicator */}
			<div className="max-w-2xl mx-auto p-6">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center space-x-4">
						<div
							className={`flex items-center ${
								step >= 1 ? "text-primary" : "text-gray-400"
							}`}>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									step >= 1 ? "bg-primary text-white" : "bg-gray-200"
								}`}>
								1
							</div>
							<span className="ml-2">Basic Info</span>
						</div>

						<div className="h-px w-16 bg-gray-300"></div>

						<div
							className={`flex items-center ${
								step >= 2 ? "text-primary" : "text-gray-400"
							}`}>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									step >= 2 ? "bg-primary text-white" : "bg-gray-200"
								}`}>
								2
							</div>
							<span className="ml-2">Add Course</span>
						</div>

						<div className="h-px w-16 bg-gray-300"></div>

						<div
							className={`flex items-center ${
								step >= 3 ? "text-primary" : "text-gray-400"
							}`}>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									step >= 3 ? "bg-primary text-white" : "bg-gray-200"
								}`}>
								3
							</div>
							<span className="ml-2">Review</span>
						</div>
					</div>
				</div>

				{/* Form content */}
				{step === 1 && (
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold mb-4">Basic Details</h2>
						<p className="text-gray-600 mb-6">
							Add basic information about the cohort you are creating
						</p>

						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Cohort Name <span className="text-red-500">*</span>
								</label>
								<Input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									placeholder="Spring 2025 Python Foundation for Mathematics Cohort"
									className="w-full"
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Cohort Start Date <span className="text-red-500">*</span>
									</label>
									<div className="w-full">
										<Calendar
											mode="single"
											selected={formData.startDate || undefined}
											onSelect={(date: Date | undefined) =>
												handleDateChange(date, "startDate")
											}
											className="rounded-md border w-full"
											modifiersStyles={{
												selected: {
													backgroundColor: "#FF9100",
													color: "white",
													borderRadius: "4px",
												},
											}}
											required
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Cohort End Date <span className="text-red-500">*</span>
									</label>
									<div className="w-full">
										<Calendar
											mode="single"
											selected={formData.endDate || undefined}
											onSelect={(date: Date | undefined) =>
												handleDateChange(date, "endDate")
											}
											className="rounded-md border w-full"
											modifiersStyles={{
												selected: {
													backgroundColor: "#FF9100",
													color: "white",
													borderRadius: "4px",
												},
											}}
											required
										/>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Enrollment Capacity
									</label>
									<Input
										type="number"
										name="capacity"
										value={formData.capacity}
										onChange={handleInputChange}
										placeholder="60"
										className="w-full"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Amount
									</label>
									<div className="relative">
										<Input
											type="text"
											name="amount"
											value={formData.amount}
											onChange={handleInputChange}
											placeholder="5000"
											className="w-full"
										/>
										<div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none border border-[#E8E8E8] bg-[#F6F8FA]">
											<span className="text-gray-500">USD</span>
										</div>
									</div>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Cover Image
								</label>
								<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
									<div className="space-y-1 text-center">
										{formData.coverImage ? (
											<div className="relative">
												<img
													src={formData.coverImage}
													alt="Cover"
													className="mx-auto h-32 object-cover"
												/>
												<button
													onClick={() =>
														setFormData((prev) => ({
															...prev,
															coverImage: null,
														}))
													}
													className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
													<IconTrash size={16} />
												</button>
											</div>
										) : (
											<>
												<div className="flex text-sm text-gray-600">
													<label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
														<span className="text-secondary-1">
															Click to upload
														</span>
														<input
															type="file"
															accept="image/*"
															className="sr-only"
															onChange={handleCoverImageChange}
														/>
													</label>
													<p className="pl-1">or drag and drop</p>
												</div>
												<p className="text-xs text-gray-500">
													JPG, JPEG, PNG less than 1MB
												</p>
											</>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold mb-4">Add Course to cohort</h2>
						<p className="text-gray-600 mb-6">
							Add existing courses to modify what individual cohort can do
						</p>

						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Choose Course
							</label>
							<Input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search or select existing courses"
								className="w-full"
							/>
						</div>

						<div className="space-y-2 max-h-96 overflow-y-auto">
							{filteredCourses.map((course) => (
								<div
									key={course.id}
									className="flex items-center justify-between p-3 border rounded">
									<span>{course?.title}</span>
									{formData.selectedCourses.some((c) => c.id === course.id) ? (
										<button
											onClick={() => handleRemoveCourse(course.id)}
											className="text-red-500 hover:text-red-700">
											<IconTrash size={18} />
										</button>
									) : (
										<button
											onClick={() => handleAddCourse(course)}
											className="text-primary hover:text-primary-dark">
											<IconPlus size={18} />
										</button>
									)}
								</div>
							))}
						</div>

						{formData.selectedCourses.length > 0 && (
							<div className="mt-6">
								<h3 className="text-sm font-medium mb-2">Selected Courses</h3>
								<div className="space-y-2">
									{formData.selectedCourses.map((course) => (
										<div
											key={course.id}
											className="flex items-center justify-between p-2 bg-gray-50 rounded">
											<span>{course?.title}</span>
											<button
												onClick={() => handleRemoveCourse(course.id)}
												className="text-red-500 hover:text-red-700">
												<IconTrash size={16} />
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{step === 3 && (
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold mb-4">
							Review Cohort Information
						</h2>
						<p className="text-gray-600 mb-6">
							Do a final check to make sure there are no mistakes
						</p>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium mb-4">Basic Info</h3>
								{formData.coverImage && (
									<div className="mb-4">
										<img
											src={formData.coverImage}
											alt="Cohort cover"
											className="h-40 object-cover rounded"
										/>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-500">Cohort Name</p>
										<p className="font-medium">{formData.name}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Start Date</p>
										<p className="font-medium">
											{formData.startDate?.toLocaleDateString() || "Not set"}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">End Date</p>
										<p className="font-medium">
											{formData.endDate?.toLocaleDateString() || "Not set"}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Enrollment Capacity</p>
										<p className="font-medium">
											{formData.capacity || "0"} students
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">Amount</p>
										<p className="font-medium">
											{formData.amount ? `$${formData.amount}` : "Not set"}
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-medium mb-4">Assigned Course</h3>
								<div className="space-y-2">
									{formData.selectedCourses.length > 0 ? (
										formData.selectedCourses.map((course) => (
											<div
												key={course.id}
												className="flex items-center p-3 border rounded">
												<IconCircleFilled
													className="text-secondary-1 mr-2"
													size={10}
												/>
												<span>{course.title}</span>
											</div>
										))
									) : (
										<p className="text-gray-500">No courses selected</p>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Navigation buttons */}
				<div className="flex justify-between mt-8">
					{step > 1 ? (
						<Button variant="outline" onClick={prevStep}>
							Back
						</Button>
					) : (
						<div></div>
					)}

					{step < 3 ? (
						<Button
							onClick={nextStep}
							className="bg-secondary-1 text-white"
							disabled={
								isSubmitting ||
								(step === 1 &&
									(!formData.name || !formData.startDate || !formData.endDate))
							}>
							{isSubmitting ? "Processing..." : "Next"}
						</Button>
					) : (
						<Button
							onClick={handleSubmit}
							className="bg-secondary-1 text-white"
							disabled={isSubmitting}>
							{isSubmitting ? "Submitting..." : "Update Cohort"}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
