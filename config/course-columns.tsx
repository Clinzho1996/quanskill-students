"use client";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CourseDataTable } from "./course-table";

interface ApiResponse {
	courses: Course[];
}

export interface Course {
	id?: string;
	title?: string;
	amount?: string;
	overview?: string | null;
	level?: string;
	courses?: Course[];
	cover_image?: string | null;
	category_id?: string;
	created_at?: string;
	updated_at?: string;
	category?: {
		id?: string;
		name?: string;
		created_at?: string;
		updated_at: string;
	};
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const CourseTable = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Course | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [tableData, setTableData] = useState<Course[]>([]);

	const openDeleteModal = (row: { original: Course }) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => setDeleteModalOpen(false);

	const fetchCourseData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				"https://api.quanskill.com/api/v1/user/all/courses",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			setTableData(response.data.courses);
		} catch (error) {
			console.error("Error fetching course data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCourseData();
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

	const handleDelete = async () => {
		if (!selectedRow) return;

		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/course/${selectedRow.id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			// Remove the deleted course from the table
			setTableData((prev) =>
				prev.filter((course) => course.id !== selectedRow.id)
			);
			closeDeleteModal();
		} catch (error) {
			console.error("Error deleting course:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Define table columns
	const columns: ColumnDef<Course>[] = [
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
			accessorKey: "title",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Course Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const title = row.getValue<string>("title");
				const coverImage = row.original.cover_image;
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						{coverImage ? (
							<Image
								src={coverImage}
								alt="course cover"
								width={80}
								height={50}
								className="rounded-lg"
							/>
						) : (
							<Image
								src="/images/python.png"
								alt="default course cover"
								width={80}
								height={50}
								className="rounded-lg"
							/>
						)}
						<span className="name text-xs text-black capitalize">{title}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "category.name",
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.category?.name;
				return (
					<span className="text-xs text-primary-6 capitalize">{category}</span>
				);
			},
		},
		{
			accessorKey: "level",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Level
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const level = row.getValue<string>("level");
				return (
					<span className="text-xs text-primary-6 capitalize">{level}</span>
				);
			},
		},
		{
			accessorKey: "amount",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Price
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const amount = row.getValue<string>("amount");
				return <span className="text-xs text-primary-6">${amount}</span>;
			},
		},
		{
			accessorKey: "created_at",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Date Added
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const date = formatDate(row.getValue<string>("created_at"));
				return <span className="text-xs text-primary-6">{date}</span>;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const course = row.original;
				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/course-management/${course.id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View
							</Button>
						</Link>
					</div>
				);
			},
		},
	];

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<CourseDataTable columns={columns} data={tableData} />
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>Are you sure you want to delete {selectedRow?.title}?</p>
					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={handleDelete}
							disabled={isLoading}>
							{isLoading ? "Deleting..." : "Yes, Delete"}
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default CourseTable;
