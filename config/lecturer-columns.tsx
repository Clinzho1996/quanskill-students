"use client";

import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LecturerDataTable } from "./lecturer-table";

// Define the expected API response type
interface ApiResponse {
	data: Staff[];
}

export interface Staff {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	pic: string | null;
	gender: string;
	status: boolean;
	created_at: string;
	updated_at: string;
	specialization: string | null;
	skills: string[] | null;
	institution_of_work: string | null;
	department: string | null;
	academic_qualification: string | null;
	short_bio: string | null;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const LecturerTable = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Staff | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [tableData, setTableData] = useState<Staff[]>([]);

	const openDeleteModal = (row: { original: Staff }) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const openEditModal = (row: any) => {
		const project = row.original;
		setSelectedRow(project);
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

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
				"https://api.quanskill.com/api/v1/lecturer",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			setTableData(response.data.data);
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
	const columns: ColumnDef<Staff>[] = [
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
			accessorKey: "name",
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
				const firstName = row.original.first_name;
				const lastName = row.original.last_name;
				const pic = row.original.pic;
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						{pic ? (
							<Image
								src={pic}
								alt="avatar"
								width={30}
								height={30}
								className="rounded-full w-[30px] h-[30px] object-cover"
							/>
						) : (
							<Image
								src="/images/avats.png"
								alt="avatar"
								width={30}
								height={30}
								className="rounded-full w-[30px] h-[30px] object-cover"
							/>
						)}
						<span className="name text-xs text-black capitalize">
							{firstName} {lastName}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "id",
			header: "Lecturer ID",
			cell: ({ row }) => {
				const staff = row.getValue<string>("id");
				return (
					<span className="text-xs text-primary-6">
						{staff.length > 10 ? `${staff.slice(0, 10)}...` : staff}
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
			accessorKey: "status",
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
				const status = row.original.status; // Get the boolean value directly
				return (
					<div
						className={`text-xs px-2 py-1 rounded-full ${
							status
								? "bg-green-100 text-green-800 status green"
								: "bg-red-100 text-red-800 status red"
						}`}>
						{status ? "Active" : "Inactive"}
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Date Added",
			cell: ({ row }) => {
				const staff = row.getValue<string>("created_at");
				const formattedDate = formatDate(staff);
				return <span className="text-xs text-primary-6">{formattedDate}</span>;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const project = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/lecturer-management/${project.id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View profile
							</Button>
						</Link>

						<Link href={`/lecturer-management/${project.id}`}>
							<Button
								className="border-[#E8E8E8] border-[1px] text-sm font-medium text-[#6B7280] font-inter"
								onClick={() => openEditModal(row)}>
								<IconEdit />
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
				`https://api.quanskill.com/api/v1/lecturer/${selectedRow?.id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Lecturer deleted successfully.");
			await fetchUserData();
			closeDeleteModal();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Error deleting lecturer:",
					error.response?.data || error.message
				);
				toast.error(`Failed to delete lecturer: ${error.message}`);
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
				<LecturerDataTable columns={columns} data={tableData} />
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

export default LecturerTable;
