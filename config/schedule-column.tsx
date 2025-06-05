"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScheduleDataTable } from "./schedule-table";

// Define the expected API response type
interface ApiResponse {
	status: string;
	message: string;
	data: Schedule[];
}

interface CourseTopic {
	id: string;
	course_id: string;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface Schedule {
	schedule_id: string;
	id: string;
	cohort_id: string;
	course_topic_id: string;
	session_type: string;
	date: string;
	time: string;
	url: string | null;
	created_at: string;
	updated_at: string;
	course_topic: CourseTopic;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const ScheduleTable = () => {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [tableData, setTableData] = useState<Schedule[]>([]);

	const fetchScheduleData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.quanskill.com/api/v1/cohort/fetch-schedule/${id}`,
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
			console.error("Error fetching schedule data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchScheduleData();
	}, []);

	const formatDateTime = (dateString: string, timeString: string) => {
		const [year, month, day] = dateString.split(" ")[0].split("-");
		const [hours, minutes] = timeString.split(":");

		const date = new Date(
			parseInt(year),
			parseInt(month) - 1, // months are 0-indexed
			parseInt(day),
			parseInt(hours),
			parseInt(minutes)
		);

		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		};

		return new Intl.DateTimeFormat("en-US", options).format(date);
	};

	// Define table columns
	const columns: ColumnDef<Schedule>[] = [
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
			accessorKey: "course_topic.title",
			header: ({ column }) => (
				<Button
					variant="ghost"
					className="text-[13px] text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Topic Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const topicTitle = row.original.course_topic.title;
				return (
					<span className="name text-xs text-black capitalize">
						{topicTitle}
					</span>
				);
			},
		},
		{
			accessorKey: "session_type",
			header: "Session Type",
			cell: ({ row }) => {
				const sessionType = row.getValue<string>("session_type");
				return (
					<span className="text-xs text-primary-6 capitalize">
						{sessionType}
					</span>
				);
			},
		},
		{
			accessorKey: "date",
			header: "Date & Time",
			cell: ({ row }) => {
				const date = row.getValue<string>("date");
				const time = row.original.time;
				return (
					<span className="text-xs text-primary-6">
						{formatDateTime(date, time)}
					</span>
				);
			},
		},
		{
			accessorKey: "url",
			header: "Meeting Link",
			cell: ({ row }) => {
				const meetingLink = row.getValue<string>("url");
				return (
					<span className="text-xs text-primary-6">
						{meetingLink ? (
							<a
								href={meetingLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 underline">
								{meetingLink}
							</a>
						) : (
							<span className="text-gray-500">No link provided</span>
						)}
					</span>
				);
			},
		},
	];

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<ScheduleDataTable columns={columns} data={tableData} />
			)}
		</>
	);
};

export default ScheduleTable;
