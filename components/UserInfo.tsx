"use client";
import Loader from "@/components/Loader";
import { IconCircleFilled } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import CohortsCard from "./CohortsCard";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

interface AnalyticsData {
	waitlist: number;
	faqs: number;
	posts: number;
	draft_posts: number;
	published_posts: number;
	lecturers: number;
	active_lecturers: number;
	inactive_lecturers: number;
	admins: number;
	students: number;
	cohorts: number;
	open_cohorts: number;
	active_cohorts: number;
	completed_cohorts: number;
	total_cohorts_registered: number;
	active_or_open_cohorts: number;
	total_courses_enrolled: number;
}

interface ApiResponse {
	status: string;
	data: AnalyticsData;
}

function UserInfo() {
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	const fetchAnalyticsData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				"https://api.quanskill.com/api/v1/analytics/student",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			setAnalyticsData(response.data.data);
		} catch (error) {
			console.error("Error fetching analytics data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAnalyticsData();
	}, []);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="py-2 px-3 bg-white rounded-lg border border-[#E2E4E9]">
			<div>
				<div className="flex flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image src="/images/info.png" alt="info" width={20} height={20} />
						<p className="text-sm font-bold text-black">Dashboard Metrics</p>
					</div>
					<div className="flex flex-row justify-end gap-3 items-center">
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#6E3FF3" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Total
							</p>
						</div>
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#35B9E9" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Active
							</p>
						</div>
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#FF9100" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Completed
							</p>
						</div>
						<div className="flex flex-row justify-start gap-1 items-center">
							<IconCircleFilled size={10} color="#3F8140" />
							<p className="text-sm font-normal text-[#6B7280] text-[12px]">
								Enrollment
							</p>
						</div>
					</div>
				</div>

				{analyticsData && (
					<>
						<div className="p-3 flex flex-row justify-start border-[#E2E4E9] items-center gap-3 w-full">
							<CohortsCard
								title="Total Cohorts"
								data={analyticsData.total_cohorts_registered.toString()}
								difference={0.24}
								img="/images/coh4.png"
							/>
							<CohortsCard
								title="Active Cohorts"
								data={analyticsData.active_or_open_cohorts.toString()}
								difference={1.2}
								img="/images/coh2.png"
							/>
							<CohortsCard
								title="Completed Cohorts"
								data={analyticsData.completed_cohorts.toString()}
								difference={0.21}
								img="/images/coh3.png"
							/>
							<CohortsCard
								title="Total Courses Enrolled"
								data={analyticsData.total_courses_enrolled.toString()}
								difference={0.21}
								img="/images/coh1.png"
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default UserInfo;
