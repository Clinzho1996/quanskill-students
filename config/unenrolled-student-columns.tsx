"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UnenrolledCohortStudentDataTable } from "./unenrolled-student-table";

// Updated API response type to match actual structure
interface ApiResponse {
	status: string;
	students: Student[];
}

interface Cohort {
	id: string;
	name: string;
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
	pivot: {
		cohort_id: string;
		user_id: string;
		created_at: string;
		updated_at: string;
	};
	// Adding is_enrolled for our table
	is_enrolled?: boolean;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

const UnenrolledCohortStudentTable = () => {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isEnrollModalOpen, setEnrollModalOpen] = useState(false);
	const [isDisenrollModalOpen, setDisenrollModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<Student | null>(null);
	const [tableData, setTableData] = useState<Student[]>([]);
	const [cohorts, setCohorts] = useState<Cohort[]>([]);
	const [selectedCohortId, setSelectedCohortId] = useState<string>("");
	const [isFetchingCohorts, setIsFetchingCohorts] = useState(false);

	const openEnrollModal = (row: { original: Student }) => {
		setSelectedRow(row.original);
		fetchCohorts();
		setEnrollModalOpen(true);
	};

	const openDisenrollModal = (row: { original: Student }) => {
		setSelectedRow(row.original);
		setDisenrollModalOpen(true);
	};

	// Close modal functions
	const closeEnrollModal = () => setEnrollModalOpen(false);
	const closeDisenrollModal = () => setDisenrollModalOpen(false);

	const fetchEnrolledStudents = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.quanskill.com/api/v1/cohort/all-students-with-status/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			const unenrolledStudents = response.data.students.filter(
				(student) => !student.is_enrolled
			);

			setTableData(unenrolledStudents);
		} catch (error) {
			console.error("Error fetching enrolled students:", error);
			toast.error("Failed to fetch enrolled students");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchCohorts = async () => {
		try {
			setIsFetchingCohorts(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.get<{ data: Cohort[] }>(
				"https://api.quanskill.com/api/v1/cohort",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			setCohorts(response.data.data);
			if (response.data.data.length > 0) {
				setSelectedCohortId(response.data.data[0].id);
			}
		} catch (error) {
			console.error("Error fetching cohorts:", error);
			toast.error("Failed to load cohorts");
		} finally {
			setIsFetchingCohorts(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchEnrolledStudents();
		}
	}, [id]);

	const formatDate = (rawDate: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate = new Date(rawDate);
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	const handleEnroll = async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken || !selectedRow || !selectedCohortId) {
				console.error("Missing required data.");
				toast.error("Authentication failed or data missing.");
				setIsLoading(false);
				return;
			}

			const payload = {
				cohort_id: selectedCohortId,
				student_id: selectedRow.id,
			};

			await axios.post(
				"https://api.quanskill.com/api/v1/cohort/enroll-student",
				payload,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Student enrolled successfully.");
			closeEnrollModal();
			// Refresh the student list after enrollment
			fetchEnrolledStudents();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Error enrolling student:",
					error.response?.data || error.message
				);
				toast.error(`Failed to enroll student: ${error.message}`);
			} else {
				console.error("Unexpected error enrolling student:", error);
				toast.error("An unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisenroll = async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken || !selectedRow || !id) {
				console.error("Missing required data.");
				toast.error("Authentication failed or data missing.");
				setIsLoading(false);
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/cohort/disenroll-student/${id}/${selectedRow.id}`,

				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			toast.success("Student disenrolled successfully.");
			closeDisenrollModal();
			// Refresh the student list after disenrollment
			fetchEnrolledStudents();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Error disenrolling student:",
					error.response?.data || error.message
				);
				toast.error(`Failed to disenroll student: ${error.message}`);
			} else {
				console.error("Unexpected error disenrolling student:", error);
				toast.error("An unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
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
			accessorKey: "is_enrolled",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-start items-start"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Cohort Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const isActive = row.getValue<boolean>("is_enrolled");
				return (
					<div className={`status ${isActive ? "green" : "red"}`}>
						{isActive ? "enrolled" : "unenrolled"}
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
						{student.is_enrolled ? (
							<Button
								className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
								onClick={() => openDisenrollModal(row)}>
								Disenroll
							</Button>
						) : (
							<Button
								className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
								onClick={() => openEnrollModal(row)}>
								Enroll
							</Button>
						)}
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
				<UnenrolledCohortStudentDataTable columns={columns} data={tableData} />
			)}

			{/* Enroll Student Modal */}
			{isEnrollModalOpen && (
				<Modal onClose={closeEnrollModal} isOpen={isEnrollModalOpen}>
					<h3 className="text-lg font-medium mb-4">Enroll Student</h3>
					<p className="mb-4">
						Select a cohort to enroll {selectedRow?.first_name}{" "}
						{selectedRow?.last_name}
					</p>

					{isFetchingCohorts ? (
						<p>Loading cohorts...</p>
					) : (
						<div className="mb-4">
							<Select
								value={selectedCohortId}
								onValueChange={setSelectedCohortId}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a cohort" />
								</SelectTrigger>
								<SelectContent className="z-100 bg-white dropbg">
									{cohorts.map((cohort) => (
										<SelectItem
											key={cohort.id}
											value={cohort.id}
											className="hover:bg-gray-100 cursor-pointer">
											{cohort.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeEnrollModal}>
							Cancel
						</Button>
						<Button
							className="bg-secondary-1 text-white font-inter text-xs"
							onClick={handleEnroll}
							disabled={!selectedCohortId || isFetchingCohorts}>
							Enroll Student
						</Button>
					</div>
				</Modal>
			)}

			{/* Disenroll Student Modal */}
			{isDisenrollModalOpen && (
				<Modal onClose={closeDisenrollModal} isOpen={isDisenrollModalOpen}>
					<h3 className="text-lg font-medium mb-4">Disenroll Student</h3>
					<p className="mb-4">
						Are you sure you want to disenroll {selectedRow?.first_name}{" "}
						{selectedRow?.last_name} from this cohort?
					</p>
					<p className="text-sm text-primary-6 mb-4">
						This action can be reversed
					</p>

					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDisenrollModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs"
							onClick={handleDisenroll}>
							Yes, Disenroll
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default UnenrolledCohortStudentTable;
