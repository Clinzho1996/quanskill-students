"use client";

import { IconCircleFilled } from "@tabler/icons-react";
import Image from "next/image";

function TransactionMetrics() {
	return (
		<div className=" p-3 bg-white rounded-lg border border-[#E2E4E9]">
			<div>
				<div className="flex flex-col lg:flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image src="/images/info.png" alt="info" width={20} height={20} />
						<p className="text-sm font-bold text-black">Subscription Metrics</p>
					</div>
					<div className="flex flex-row justify-end gap-3 items-center">
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#6E3FF3" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Inactive
							</p>
						</div>
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#35B9E9" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Active
							</p>
						</div>
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#09A609" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Subscription amount
							</p>
						</div>
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#FF5000" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Total Subscription
							</p>
						</div>
					</div>
				</div>

				<div className="flex flex-row flex-wrap justify-start gap-[25px] lg:gap-[20px] items-center py-3">
					<div className="flex flex-row justify-start gap-2 items-center ">
						<Image src="/images/total.png" alt="total" width={40} height={40} />
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total inactive subscriptions
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center ">
						<Image
							src="/images/new.png"
							alt="new customers"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total active subscriptions
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image
							src="/images/captured.png"
							alt="captured"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total subscription amount
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image
							src="/images/pending.png"
							alt="pending"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total number of subscripion
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
				</div>
			</div>
		</div>
	);
}

export default TransactionMetrics;
