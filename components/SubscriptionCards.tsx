"use client";

import { IconCircleCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import Image from "next/image";

function SubscriptionCards({
	id,
	title,
	noBanks,
	noBudgets,
	amount,
	handleEdit,
	handleDelete,
}: {
	id?: string;
	title: string;
	noBanks?: number;
	noBudgets?: number;
	amount?: number;
	handleEdit: () => void;
	handleDelete: () => void;
}) {
	return (
		<div
			className="p-2 bg-[#9F9E9E1A] w-full shadow-inner shadow-[#03071205] rounded-lg"
			key={id}>
			<div className="bg-white p-6 rounded-lg">
				<h2 className="text-sm text-[#131316] font-inter font-medium capitalize">
					{title}
				</h2>

				<Image
					src="/images/rule.png"
					alt="staff management"
					height={20}
					width={200}
					className="my-4"
				/>

				<p className="text-sm text-[#131316] font-inter font-normal">
					What&apos;s included
				</p>

				<div className="flex flex-row justify-start items-center gap-2 mt-4">
					<IconCircleCheck size={18} color="#37C390" />
					<p className="text-sm text-[#4B5563] font-inter font-normal">
						Connect up to {noBanks} bank account(s)
					</p>
				</div>
				<div className="flex flex-row justify-start items-center gap-2 mt-2">
					<IconCircleCheck size={18} color="#37C390" />
					<p className="text-sm text-[#4B5563] font-inter font-normal">
						Create up to {noBudgets} budgets per month
					</p>
				</div>

				<div className="mt-10">
					<p className="text-[#A1A1AA] text-sm">
						<span className="text-[28px] text-[#404040] font-medium font-inter">
							₦{amount}
						</span>{" "}
						/ month
					</p>
				</div>

				<div className="flex flex-row justify-start items-center gap-2 mt-3">
					<div
						className="p-2 border-[1px] border-[#E8E8E8] rounded-md cursor-pointer"
						onClick={handleEdit}>
						<IconEdit color="#6B7280" size={16} />
					</div>
					<div
						className="p-2 border-[1px] border-[#E8E8E8] rounded-md cursor-pointer"
						onClick={handleDelete}>
						<IconTrash color="#6B7280" size={16} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default SubscriptionCards;
