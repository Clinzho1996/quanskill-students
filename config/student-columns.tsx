"use client";

import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { StudentDataTable } from "./student-table";

// Define the expected API response type
interface ApiResponse {
	status: string;
	message: string;
	data: Student[];
	pagination: {
		prev_page_url: string | null;
		next_page_url: string | null;
		current_page: number;
		total: number;
	};
}

export interface Student {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	role: string;
	phone: string;
	gender: string;
	pic: string | null;
	email_verified_at: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const StudentTable = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Student | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [tableData, setTableData] = useState<Student[]>([]);

	const openDeleteModal = (row: { original: Student }) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	// Close modal functions
	const closeRestoreModal = () => setRestoreModalOpen(false);
	const closeDeleteModal = () => setDeleteModalOpen(false);

	const fetchUserData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				"https://api.quanskill.com/api/v1/user/role/students",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			const fetchedData = response.data.data;
			setTableData(fetchedData);
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const formatDate = (rawDate: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate = new Date(rawDate);
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	// Define table columns
	const columns: ColumnDef<Student>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="check"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="check bg-[#FF9100]"
				/>
			),
		},

		{
			accessorKey: "first_name",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const firstName = row.getValue<string>("first_name");
				const lastName = row.original.last_name;
				const fullName = `${firstName} ${lastName}`;
				const profilePic = row.original.pic;

				return (
					<div className="flex flex-row justify-start items-center gap-2">
						{profilePic ? (
							<Image
								src={profilePic}
								alt="profile picture"
								width={30}
								height={30}
								className="rounded-full object-cover"
							/>
						) : (
							<div className="w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center p-2">
								<span className="text-xs text-gray-500">
									{firstName.charAt(0).toUpperCase()}
									{lastName.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<span className="name text-xs text-black capitalize">
							{fullName}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "id",
			header: "Student ID",
			cell: ({ row }) => {
				const studentId = row.getValue<string>("id");
				return (
					<span className="text-xs text-primary-6">
						{studentId.length > 10 ? `${studentId.slice(0, 10)}...` : studentId}
					</span>
				);
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Email address
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const email = row.getValue<string>("email");
				return <span className="text-xs text-primary-6">{email}</span>;
			},
		},
		{
			accessorKey: "created_at",
			header: "Date Joined",
			cell: ({ row }) => {
				const date = row.getValue<string>("created_at");
				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
		{
			accessorKey: "is_active",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-start items-start"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isActive = row.getValue<boolean>("is_active");
				return (
					<div className={`status ${isActive ? "green" : "red"}`}>
						{isActive ? "active" : "inactive"}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const student = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/student-management/${student.id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View profile
							</Button>
						</Link>

						<Button
							className="border-[#E8E8E8] border-[1px] text-sm font-medium text-[#6B7280] font-inter"
							onClick={() => openDeleteModal(row)}>
							<IconTrash />
						</Button>
					</div>
				);
			},
		},
	];

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("Authentication failed.");
				setIsLoading(false);
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/user/delete/${selectedRow?.id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Student deleted successfully.");
			await fetchUserData();
			closeDeleteModal();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Error deleting student:",
					error.response?.data || error.message
				);
				toast.error(`Failed to delete student: ${error.message}`);
			} else {
				console.error("Unexpected error deleting lecturer:", error);
				toast.error("An unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<StudentDataTable columns={columns} data={tableData} />
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete {selectedRow?.first_name}'s account?
					</p>
					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={handleDelete}>
							Yes, Delete
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default StudentTable;
