"use client";

import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";

// Define the expected API response type
interface ApiResponse {
	data: Staff[];
}

export interface Staff {
	id: string;
	name: string;
	full_name: string;
	country: string;
	phone_number: string;
	date: string;
	created_at: string;
	email: string;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

// Define Staff type

const Table = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Staff | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [tableData, setTableData] = useState<Staff[]>([]);

	// Open modal functions
	const openRestoreModal = (row: { original: Staff }) => {
		setSelectedRow(row.original);
		setRestoreModalOpen(true);
	};

	const openDeleteModal = (row: { original: Staff }) => {
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
				"https://api.quanskill.com/api/v1/waitlist",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			const fetchedData = response.data.data;

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				name: `${item.full_name || ""}`,
				email: item.email,
				date: item.created_at,
				created_at: item.created_at,
				country: item.country,
				full_name: item.full_name,
				phone_number: item.phone_number,
			}));

			setTableData(mappedData);
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
		}; // Correct types
		const parsedDate = new Date(rawDate); // Ensure the date is parsed correctly
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
					className="check"
				/>
			),
		},
		{
			accessorKey: "id",
			header: "ID",
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
				const name = row.getValue<string>("name");
				return (
					<span className="name text-xs text-black capitalize">{name}</span>
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
			accessorKey: "phone_number",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Phone Number
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const phone = row.getValue<string>("phone_number");
				return <span className="text-xs text-primary-6">{phone}</span>;
			},
		},
		{
			accessorKey: "country",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Country
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const country = row.getValue<string>("country");
				return <span className="text-xs text-primary-6">{country}</span>;
			},
		},
		{
			accessorKey: "date",
			header: "Date Joined",
			cell: ({ row }) => {
				const date = row.getValue<string>("date");
				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
	];

	const handleDelete = () => {
		const selectedRowIds = Object.keys(rowSelection).filter(
			(key) => rowSelection[key]
		);

		// Ensure the row ids match the data's keys and use the correct identifier
		const filteredData = tableData.filter(
			(row) => !selectedRowIds.includes(row.id) // assuming row.id is your unique identifier
		);
		setTableData(filteredData);
		setRowSelection({}); // Clear row selection after deletion
	};

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<DataTable columns={columns} data={tableData} />
			)}

			{isRestoreModalOpen && (
				<Modal onClose={closeRestoreModal} isOpen={isRestoreModalOpen}>
					<p className="mt-4">
						Are you sure you want to suspend {selectedRow?.name}'s account?
					</p>
					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeRestoreModal}>
							Cancel
						</Button>
						<Button className="bg-[#F04F4A] text-white font-inter text-xs modal-delete">
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>Are you sure you want to delete {selectedRow?.name}'s account?</p>
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

export default Table;
