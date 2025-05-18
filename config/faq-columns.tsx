"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaqTable } from "./faq-table";

interface ApiResponse {
	id: string;
	question: string;
	answer: string;
	created_at: string;
	updated_at: string;
	faq_question: string;
	faq_answer: string;
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}
export type Faq = {
	id: string;
	question: string;
	answer: string;
	created_at: string;
	updated_at: string;
};

interface FaqTableComponentProps {
	refreshKey: () => void; // It should expect a function
}

const FaqTableComponent = ({ refreshKey }: FaqTableComponentProps) => {
	const [form, setForm] = useState({ question: "", answer: "" });
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Faq[]>([]);

	const openModal = (row: any) => {
		setSelectedRow(row.original);
		setForm({
			question: row.original.question,
			answer: row.original.answer,
		});
		setModalOpen(true);
	};

	const openDeleteModal = (row: any) => {
		setSelectedRow(row.original); // Use row.original to store the full row data
		setDeleteModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const handleDelete = async () => {
		try {
			if (!selectedRow) return;

			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/faq/${selectedRow.id}`,
				{
					headers: {
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);
			toast.success("FAQ deleted successfully!");
			refreshKey();
			closeDeleteModal();
		} catch (error) {
			console.error("Error deleting FAQ:", error);
		}
	};

	const handleSubmit = async () => {
		if (!form.question || !form.answer) {
			toast.error("Please fill in all fields.");
			return;
		}

		setIsLoading(true);
		const session = await getSession();

		if (!session?.accessToken) {
			console.error("No access token found.");
			setIsLoading(false);
			return;
		}

		try {
			const { data } = await axios.put(
				`https://api.quanskill.com/api/v1/faq/${selectedRow.id}`,
				{
					faq_question: form.question,
					faq_answer: form.answer,
				},
				{
					headers: {
						Accept: "application/json",
						referer: "aitechma.com",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			if (data?.error) {
				toast.error(data.error);
			} else {
				toast.success("FAQ updated successfully!");

				setForm({ question: "", answer: "" });
				refreshKey();
				closeModal();
			}
		} catch (error) {
			toast.error("Login failed. Please try again.");
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchFaqData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<{ data: ApiResponse[] }>(
				"https://api.quanskill.com/api/v1/faq",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			const fetchedData = response.data.data;

			console.log("Faq Data:", fetchedData);

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				question: item.faq_question,
				answer: item.faq_answer,
				created_at: item.created_at,
				updated_at: item.updated_at,
			}));

			setTableData(mappedData);
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchFaqData();
	}, [refreshKey]);

	const columns: ColumnDef<Faq>[] = [
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
				const id = row.getValue<string>("id");

				return <span className="text-xs text-primary-6">{id}</span>;
			},
		},
		{
			accessorKey: "question",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-left"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Question
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const question = row.getValue<string>("question");

				return <span className="text-xs text-black">{question}</span>;
			},
		},
		{
			accessorKey: "answer",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-left"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Answer
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const answer = row.getValue<string>("answer");

				return <span className="text-xs text-primary-6">{answer}</span>;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const actions = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Button
							className="border-[#E8E8E8] border-[1px] text-sm font-medium text-[#6B7280] font-inter"
							onClick={() => openModal(row)}>
							<IconEdit />
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

	return (
		<>
			<FaqTable columns={columns} data={tableData} />

			{isModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={closeModal}
					className="w-[500px]"
					title="Edit Frequently Asked Question">
					<hr className="mt-4 text-[#9F9E9E40]" color="#9F9E9E40" />
					<form className="w-full mt-6" onSubmit={handleSubmit}>
						<div className="mb-4">
							<label className="text-sm text-gray-700 font-medium font-inter">
								Question
							</label>
							<input
								type="text"
								placeholder="Enter question"
								value={form.question}
								onChange={(e) => setForm({ ...form, question: e.target.value })}
								className="w-full bg-[#ffff] rounded-lg p-2 border border-gray-300 focus:outline-none focus:border-primary mt-1 shadow-inner text-sm"
								required
							/>
						</div>

						<div className="mb-4">
							<label className="text-sm text-gray-700 font-medium">
								Answer
							</label>
							<textarea
								placeholder="Enter answer"
								value={form.answer}
								onChange={(e) => setForm({ ...form, answer: e.target.value })}
								className="w-full bg-[#ffff] rounded-lg p-2 border border-gray-300 focus:outline-none focus:border-primary mt-1 shadow-inner text-sm"
								required
							/>
						</div>
					</form>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeModal}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							className="bg-primary-2 text-white font-inter text-xs"
							disabled={isLoading}>
							{isLoading ? "Adding Faq..." : "Yes, Confirm"}
						</Button>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>Are you sure you want to delete this FAQ?</p>

					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={() => {
								handleDelete();
								closeDeleteModal();
							}}>
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default FaqTableComponent;
