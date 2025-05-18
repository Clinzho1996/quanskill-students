"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CohortDataTable } from "./cohort-table";

// Define the expected API response type
interface ApiResponse {
	data: Cohort[];
}

export interface Cohort {
	id: string;
	name: string;
	amount: string;
	enrollment_capacity: number;
	cover_image: string | null;
	start_date: string;
	end_date: string;
	status: string;
	created_at: string;
	updated_at: string;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const CohortTable = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Cohort[]>([]);

	const fetchCohortData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				"https://api.quanskill.com/api/v1/cohort",
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
			console.error("Error fetching cohort data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCohortData();
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

	const formatCurrency = (amount: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(parseFloat(amount));
	};

	// Define table columns
	const columns: ColumnDef<Cohort>[] = [
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
					Cohort Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const name = row.getValue<string>("name");
				const coverImage = row.original.cover_image;
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						{coverImage ? (
							<Image
								src={coverImage}
								alt="cohort cover"
								width={80}
								height={50}
								className="rounded-lg"
							/>
						) : (
							<Image
								src="/images/cohort.png"
								alt="default cohort"
								width={80}
								height={50}
								className="rounded-lg"
							/>
						)}
						<span className="name text-xs text-black capitalize">{name}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => {
				const amount = row.getValue<string>("amount");
				return (
					<span className="text-xs text-primary-6">
						{formatCurrency(amount)}
					</span>
				);
			},
		},
		{
			accessorKey: "enrollment_capacity",
			header: "Capacity",
			cell: ({ row }) => {
				const capacity = row.getValue<number>("enrollment_capacity");
				return <span className="text-xs text-primary-6">{capacity}</span>;
			},
		},
		{
			accessorKey: "start_date",
			header: "Start Date",
			cell: ({ row }) => {
				const startDate = row.getValue<string>("start_date");
				return (
					<span className="text-xs text-primary-6">
						{formatDate(startDate)}
					</span>
				);
			},
		},
		{
			accessorKey: "end_date",
			header: "End Date",
			cell: ({ row }) => {
				const endDate = row.getValue<string>("end_date");
				return (
					<span className="text-xs text-primary-6">{formatDate(endDate)}</span>
				);
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
				const status = row.getValue<string>("status");
				const statusClass = status === "open" ? "status green" : "status red";
				return (
					<span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
						{status}
					</span>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const cohort = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/cohort-management/${cohort.id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View details
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
				<CohortDataTable columns={columns} data={tableData} />
			)}
		</>
	);
};

export default CohortTable;
