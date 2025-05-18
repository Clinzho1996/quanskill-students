"use client";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LecturerOtherInfo {
	specialization: string | null;
	skills: string[] | null;
	institution_of_work: string | null;
	department: string | null;
	academic_qualification: string | null;
	short_bio: string | null;
}

function OtherInfo() {
	const { id } = useParams();
	const [isModalOpen, setModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [lecturerInfo, setLecturerInfo] = useState<LecturerOtherInfo | null>(
		null
	);
	const [formData, setFormData] = useState({
		specialization: "",
		skills: [] as string[],
		institution_of_work: "",
		department: "",
		academic_qualification: "",
		short_bio: "",
	});
	const [newSkill, setNewSkill] = useState("");

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
			setLecturerInfo({
				specialization: data.specialization,
				skills: data.skills,
				institution_of_work: data.institution_of_work,
				department: data.department,
				academic_qualification: data.academic_qualification,
				short_bio: data.short_bio,
			});

			setFormData({
				specialization: data.specialization || "",
				skills: data.skills || [],
				institution_of_work: data.institution_of_work || "",
				department: data.department || "",
				academic_qualification: data.academic_qualification || "",
				short_bio: data.short_bio || "",
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

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleAddSkill = () => {
		if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
			setFormData((prev) => ({
				...prev,
				skills: [...prev.skills, newSkill.trim()],
			}));
			setNewSkill("");
		}
	};

	const handleRemoveSkill = (skillToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			skills: prev.skills.filter((skill) => skill !== skillToRemove),
		}));
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
				`https://api.quanskill.com/api/v1/lecturer/update-other-info/${id}`,
				{
					specialization: formData.specialization,
					skills: formData.skills,
					institution_of_work: formData.institution_of_work,
					department: formData.department,
					academic_qualification: formData.academic_qualification,
					short_bio: formData.short_bio,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Lecturer information updated successfully");
			fetchLecturerData();
			setModalOpen(false);
		} catch (error) {
			console.error("Error updating lecturer:", error);
			toast.error("Failed to update lecturer information");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading || !lecturerInfo) {
		return <div className="flex-center p-3">Loading...</div>;
	}

	return (
		<div>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				title="Edit Other Information">
				<div className="bg-white p-0 rounded-lg w-[600px] transition-transform lecturer ease-in-out">
					<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
						<div className="flex flex-col gap-2">
							<p className="text-xs text-primary-6">Area of Specialization</p>
							<Input
								type="text"
								name="specialization"
								className="focus:border-none mt-2"
								value={formData.specialization}
								onChange={handleInputChange}
							/>

							<div className="flex flex-row justify-between items-start gap-4">
								<div className="w-full">
									<p className="text-xs text-primary-6 mt-2">Skills</p>
									<div className="flex gap-2 mt-2">
										<Input
											type="text"
											value={newSkill}
											onChange={(e) => setNewSkill(e.target.value)}
											placeholder="Add new skill"
											className="focus:border-none"
										/>
										<Button
											type="button"
											onClick={handleAddSkill}
											className="text-xs">
											Add
										</Button>
									</div>
									{formData.skills.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{formData.skills.map((skill) => (
												<div
													key={skill}
													className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
													<span className="text-xs">{skill}</span>
													<button
														type="button"
														onClick={() => handleRemoveSkill(skill)}
														className="text-red-500 hover:text-red-700">
														<IconTrash size={14} />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
								<div className="w-full">
									<p className="text-xs text-primary-6 mt-2">
										Institution of Work
									</p>
									<Input
										type="text"
										name="institution_of_work"
										className="focus:border-none mt-2"
										value={formData.institution_of_work}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							<p className="text-xs text-primary-6 mt-2">
								Department at Institution
							</p>
							<Input
								type="text"
								name="department"
								className="focus:border-none mt-2"
								value={formData.department}
								onChange={handleInputChange}
							/>

							<p className="text-xs text-primary-6 mt-2">
								Academic Qualification
							</p>
							<Input
								type="text"
								name="academic_qualification"
								className="focus:border-none mt-2"
								value={formData.academic_qualification}
								onChange={handleInputChange}
							/>

							<p className="text-xs text-primary-6 mt-2">Short Bio</p>
							<textarea
								name="short_bio"
								className="focus:border-none mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
								value={formData.short_bio}
								onChange={handleInputChange}
								rows={4}
							/>
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
								onClick={handleUpdateLecturer}
								disabled={isLoading}>
								{isLoading ? "Updating..." : "Update Lecturer"}
							</Button>
						</div>
					</div>
				</div>
			</Modal>

			<div className="flex flex-row justify-between items-center p-3">
				<p className="text-sm text-dark-1 font-medium">Other Information</p>
				<IconEdit
					size={18}
					className="cursor-pointer"
					onClick={() => setModalOpen(true)}
				/>
			</div>
			<div className="bg-white rounded-lg shadow-lg p-3 w-full">
				<div className="flex flex-col justify-start items-start gap-4 w-full">
					<div className="w-full">
						<p className="text-[#5E5F6E] text-xs font-normal">
							Area of Specialization
						</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturerInfo.specialization || "----"}
						</p>
					</div>

					<div className="w-full">
						<p className="text-[#5E5F6E] text-xs font-normal">Skills</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturerInfo.skills?.join(", ") || "----"}
						</p>
					</div>

					<div className="w-full">
						<p className="text-[#5E5F6E] text-xs font-normal">
							Institution of Work
						</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturerInfo.institution_of_work || "----"}
						</p>
					</div>

					<div className="w-full">
						<p className="text-[#5E5F6E] text-xs font-normal">
							Department at Institution
						</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturerInfo.department || "----"}
						</p>
					</div>

					<div className="w-full">
						<p className="text-[#5E5F6E] text-xs font-normal">Short Bio</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturerInfo.short_bio || "----"}
						</p>
					</div>

					<div className="w-full">
						<p className="text-[#5E5F6E] text-xs font-normal">
							Academic Qualification
						</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{lecturerInfo.academic_qualification || "----"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default OtherInfo;
