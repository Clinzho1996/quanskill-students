"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Schedule | null>(null);
	const [isMeetingLinkModalOpen, setMeetingLinkModalOpen] = useState(false);
	const [meetingLink, setMeetingLink] = useState("");
	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
		null
	);
	const [tableData, setTableData] = useState<Schedule[]>([]);

	const openMeetingLinkModal = (row: { original: Schedule }) => {
		setSelectedRow(row.original);
		// Assuming each student has a scheduleId, adjust as needed
		setSelectedScheduleId(row.original.id);
		setMeetingLinkModalOpen(true);
	};

	const closeMeetingLinkModal = () => {
		setMeetingLinkModalOpen(false);
		setMeetingLink("");
		setSelectedScheduleId(null);
	};

	const openDeleteModal = (row: { original: Schedule }) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => setDeleteModalOpen(false);
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

	const handleAddMeetingLink = async () => {
		// Better URL validation
		if (!selectedScheduleId) {
			toast.error("No schedule selected");
			return;
		}

		if (!meetingLink) {
			toast.error("Please provide a meeting link");
			return;
		}

		// Basic URL validation
		try {
			new URL(meetingLink); // This will throw if URL is invalid
		} catch (e) {
			toast.error(
				"Please provide a valid URL (e.g., https://meet.google.com/abc-xyz)"
			);
			return;
		}

		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				toast.error("Authentication failed");
				return;
			}

			const response = await axios.put(
				`https://api.quanskill.com/api/v1/cohort/add-url/${selectedScheduleId}`,
				{ url: meetingLink },
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			// Check if the API returned an error
			if (response.data.status === "error") {
				toast.error(response.data.message || "Failed to add meeting link");
				return;
			}

			toast.success("Meeting link added successfully");
			closeMeetingLinkModal();
			fetchScheduleData(); // Refresh the data
		} catch (error: any) {
			console.error("Error adding meeting link:", error);

			// More specific error messages
			if (error.response) {
				toast.error(
					error.response.data.message || "Failed to add meeting link"
				);
			} else if (error.request) {
				toast.error("No response from server");
			} else {
				toast.error("Error setting up request");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const formatDateTime = (dateTimeString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		};
		const parsedDate = new Date(dateTimeString);
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
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
				const dateTime = row.getValue<string>("date");
				return (
					<span className="text-xs text-primary-6">
						{formatDateTime(dateTime)}
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
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Button
							className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
							onClick={() => openMeetingLinkModal(row)}>
							Add Meeting Link
						</Button>
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
				`https://api.quanskill.com/api/v1/cohort/delete-schedule/${selectedRow?.id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Schedule deleted successfully.");
			await fetchScheduleData();
			closeDeleteModal();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Error deleting schedule:",
					error.response?.data || error.message
				);
				toast.error(`Failed to delete schedule: ${error.message}`);
			} else {
				console.error("Unexpected error deleting schedule:", error);
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
				<ScheduleDataTable columns={columns} data={tableData} />
			)}

			{isMeetingLinkModalOpen && (
				<Modal
					onClose={closeMeetingLinkModal}
					isOpen={isMeetingLinkModalOpen}
					className="w-[500px]">
					<h3 className="text-lg font-medium mb-4">Add Meeting Link</h3>
					<p className="mb-4">
						Update meeting link for {selectedRow?.course_topic.title}
					</p>

					<div className="mb-4">
						<input
							type="url"
							value={meetingLink}
							onChange={(e) => setMeetingLink(e.target.value)}
							placeholder="https://meet.google.com/abc-xyz"
							className="w-full p-2 border rounded"
							required
						/>
					</div>

					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeMeetingLinkModal}>
							Cancel
						</Button>
						<Button
							className="bg-secondary-1 text-white font-inter text-xs"
							onClick={handleAddMeetingLink}
							disabled={!meetingLink}>
							Add Link
						</Button>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete ({selectedRow?.course_topic?.title}){" "}
						schedule?
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

export default ScheduleTable;
