import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface ApiResponse {
	total_subs: number;
	total_active_subs: number;
	total_inactive_subs: number;
	total_sub_amount: number;
}

function TransactionInnerMetrics() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState<ApiResponse | null>(null);
	const fetchTransactionData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				"https://api.kuditrak.ng/api/v1/analytics/subscriptions",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);

			setData(response.data);
		} catch (error) {
			console.error("Error fetching analytics data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactionData();
	}, []);

	const formatBalance = (balance: number | undefined, currency = "USD") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
		}).format(balance ?? 0);
	};

	return (
		<div className=" p-3 bg-white border border-x-0 border-[#E2E4E9]">
			{isLoading ? (
				<div className="flex items-center space-x-4 w-full">
					<Skeleton className="h-12 bg-slate-300 w-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 bg-slate-300 w-[250px]" />
						<Skeleton className="h-4 bg-slate-300 w-[200px]" />
					</div>
				</div>
			) : (
				<div className="flex flex-row flex-wrap justify-start gap-[25px] lg:gap-[20px] items-center py-3">
					<div className="flex flex-row justify-start gap-2 items-center ">
						<Image src="/images/total.png" alt="total" width={40} height={40} />
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								inactive subscriptions
							</p>
							<p className="text-[#0A0D14] font-inter">
								{data?.total_inactive_subs}
							</p>
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
								active subscriptions
							</p>
							<p className="text-[#0A0D14] font-inter">
								{data?.total_active_subs}
							</p>
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
							<p className="text-[#0A0D14] font-inter">
								{formatBalance(data?.total_sub_amount)}
							</p>
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
								total number of subscriptions
							</p>
							<p className="text-[#0A0D14] font-inter">{data?.total_subs}</p>
						</div>{" "}
					</div>{" "}
				</div>
			)}
		</div>
	);
}

export default TransactionInnerMetrics;
