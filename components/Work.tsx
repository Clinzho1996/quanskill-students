"use client";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface WorkInfoData {
	id: string;
	lecturer_id: string;
	name: string;
	role: string;
	description: string;
	created_at: string;
	updated_at: string;
}

interface LecturerData {
	works: WorkInfoData[];
}

function WorkInfo() {
	const { id } = useParams();
	const [isModalOpen, setModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [lecturerData, setLecturerData] = useState<LecturerData | null>(null);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [formData, setFormData] = useState({
		id: "",
		name: "",
		role: "",
		description: "",
	});
	const [isEditing, setIsEditing] = useState(false);
	const [workToDelete, setWorkToDelete] = useState<string | null>(null);

	const openDeleteModal = (workId: string) => {
		setWorkToDelete(workId);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
		setWorkToDelete(null);
	};

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

			setLecturerData(response.data.data);
		} catch (error) {
			console.error("Error fetching lecturer data:", error);
			toast.error("Failed to fetch work information");
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

	const openAddModal = () => {
		setFormData({
			id: "",
			name: "",
			role: "",
			description: "",
		});
		setIsEditing(false);
		setModalOpen(true);
	};

	const openEditModal = (work: WorkInfoData) => {
		setFormData({
			id: work.id,
			name: work.name,
			role: work.role,
			description: work.description,
		});
		setIsEditing(true);
		setModalOpen(true);
	};

	const handleAddWork = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			await axios.post(
				`https://api.quanskill.com/api/v1/lecturer/add-work/${id}`,
				{
					name: formData.name,
					role: formData.role,
					description: formData.description,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Work added successfully");
			fetchLecturerData();
			setModalOpen(false);
		} catch (error) {
			console.error("Error adding work:", error);
			toast.error("Failed to add work");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateWork = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			await axios.post(
				`https://api.quanskill.com/api/v1/lecturer/update-work/${id}/${formData.id}`,
				{
					name: formData.name,
					role: formData.role,
					description: formData.description,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Work updated successfully");
			fetchLecturerData();
			setModalOpen(false);
		} catch (error) {
			console.error("Error updating work:", error);
			toast.error("Failed to update work");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteWork = async () => {
		if (!workToDelete) return;

		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/lecturer/delete-work/${id}/${workToDelete}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Work deleted successfully");
			fetchLecturerData();
			closeDeleteModal();
		} catch (error) {
			console.error("Error deleting work:", error);
			toast.error("Failed to delete work");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading || !lecturerData) {
		return <div className="flex-center p-3">Loading...</div>;
	}

	return (
		<div>
			<Modal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				title={isEditing ? "Edit Work" : "Add New Work"}>
				<div className="bg-white p-0 rounded-lg w-[600px] transition-transform lecturer ease-in-out">
					<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
						<div className="flex flex-col gap-2">
							<p className="text-xs text-primary-6">Project Title</p>
							<Input
								type="text"
								name="name"
								className="focus:border-none mt-2"
								value={formData.name}
								onChange={handleInputChange}
							/>

							<p className="text-xs text-primary-6 mt-2">Role</p>
							<Input
								type="text"
								name="role"
								className="focus:border-none mt-2"
								value={formData.role}
								onChange={handleInputChange}
							/>

							<p className="text-xs text-primary-6 mt-2">Description</p>
							<textarea
								name="description"
								className="focus:border-none mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
								value={formData.description}
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
								onClick={isEditing ? handleUpdateWork : handleAddWork}
								disabled={isLoading}>
								{isLoading
									? isEditing
										? "Updating..."
										: "Adding..."
									: isEditing
									? "Update Work"
									: "Add Work"}
							</Button>
						</div>
					</div>
				</div>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
				<p>Are you sure you want to delete this work?</p>
				<p className="text-sm text-primary-6">This can&apos;t be undone</p>
				<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
					<Button
						className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
						onClick={closeDeleteModal}>
						Cancel
					</Button>
					<Button
						className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
						onClick={handleDeleteWork}
						disabled={isLoading}>
						{isLoading ? "Deleting..." : "Yes, Delete"}
					</Button>
				</div>
			</Modal>

			<div className="flex flex-row justify-between items-center p-3">
				<p className="text-sm text-dark-1 font-medium">Work and Projects</p>
				<Button
					variant="outline"
					className="text-xs flex items-center gap-1"
					onClick={openAddModal}>
					<IconPlus size={14} />
					Add Work
				</Button>
			</div>

			<div className="bg-white rounded-lg shadow-lg p-3 w-full">
				{lecturerData.works && lecturerData.works.length > 0 ? (
					<div className="space-y-4">
						{lecturerData.works.map((work) => (
							<div
								key={work.id}
								className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<p className="text-dark-1 text-sm font-semibold font-inter">
											{work.name}
										</p>
										<p className="text-[#5E5F6E] text-xs font-normal mt-1">
											Role: {work.role}
										</p>
										<p className="text-[#5E5F6E] text-xs font-normal mt-1">
											{work.description}
										</p>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => openEditModal(work)}
											className="text-gray-500 hover:text-blue-500">
											<IconEdit size={16} />
										</button>
										<button
											onClick={() => openDeleteModal(work.id)}
											className="text-gray-500 hover:text-red-500">
											<IconTrash size={16} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-4 text-gray-500">
						No work information available
					</div>
				)}
			</div>
		</div>
	);
}

export default WorkInfo;
