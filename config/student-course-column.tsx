"use client";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StudentCourseDataTable } from "./student-course-table";

interface ApiResponse {
	status: string;
	message: string;
	courses: Course[];
}

interface Course {
	id: string;
	title: string;
	amount: string;
	overview: string | null;
	level: string;
	cover_image: string | null;
	category_id: string;
	created_at: string;
	updated_at: string;
	pivot: {
		cohort_id: string;
		course_id: string;
	};
	category: {
		id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const StudentCourseTable = () => {
	const { id } = useParams();
	const courseId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Course[]>([]);

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
				`https://api.quanskill.com/api/v1/user/all/courses`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				// Map the API response to match your table structure
				const formattedData = response.data.courses.map((course: Course) => ({
					id: course.id,
					title: course.title,
					amount: course.amount,
					overview: course.overview,
					level: course.level,
					cover_image: course.cover_image,
					category_id: course.category_id,
					created_at: course.created_at,
					updated_at: course.updated_at,
					pivot: course.pivot,
					category: {
						id: course.category_id,
						name: course.category?.name || "Unknown Category",
					},
				}));

				setTableData(formattedData as Course[]);
				console.log("Formatted Course Data:", formattedData);
			} else {
				console.error(
					"API did not return success status:",
					response.data.message
				);
			}
		} catch (error) {
			console.error("Error fetching course data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (courseId) {
			fetchCourseData();
		}
	}, [courseId]);

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
				const category = row.original.category.name;
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
					Enrollment Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const date = formatDate(row.getValue<string>("created_at"));
				return <span className="text-xs text-primary-6">{date}</span>;
			},
		},
	];

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<StudentCourseDataTable columns={columns} data={tableData} />
			)}
		</>
	);
};

export default StudentCourseTable;
