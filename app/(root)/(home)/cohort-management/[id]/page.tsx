"use client";

import BasicInfo from "@/components/cohort-information/BasicInfo";
import CourseAdded from "@/components/cohort-information/CourseAdded";
import Schedule from "@/components/cohort-information/Schedule";
import SessionList from "@/components/cohort-information/SessionList";
import Student from "@/components/cohort-information/Student";
import {
	IconArrowBack,
	IconCircleFilled,
	IconSettings,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function CohortDetails() {
	const { data: session } = useSession();

	// State to track active tab
	const [activeTab, setActiveTab] = useState("basic-info");

	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	// Render the appropriate component based on activeTab
	const renderContent = () => {
		switch (activeTab) {
			case "basic-info":
				return <BasicInfo />;
			case "course-added":
				return <CourseAdded />;
			case "schedule-session":
				return <Schedule />;
			case "students":
				return <Student />;
			case "session-list":
				return <SessionList />;
			default:
				return <BasicInfo />;
		}
	};
	return (
		<section className="bg-[#F6F8F9] min-h-screen">
			<div className="flex flex-row justify-between items-center bg-white p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
				<div className="flex flex-row justify-start gap-2 items-center">
					<div>
						<Link href="/cohort-management">
							<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
								<IconArrowBack size={18} />
							</div>
						</Link>
					</div>
					<div>
						<h2 className="text-sm text-dark-1 font-normal font-inter">
							Cohort Information
						</h2>
						<p className="text-xs font-light text-dark-2 font-inter">
							View and manage cohort data, including cohort information,
							courses, and session records.
						</p>
					</div>
				</div>
				<div className="hidden lg:flex flex-row justify-start gap-2 items-center">
					<Link href="/settings">
						<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
							<IconSettings size={18} />
						</div>
					</Link>
					{session?.user && (
						<div className="md:flex flex-row justify-end gap-2 items-center mx-2 px-2">
							{session?.user && (
								<div className="md:flex flex-row justify-end gap-2 items-center mx-1 px-2">
									<div className="flex p-1 bg-primary-1 justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="profile"
												className="object-cover w-full h-full lg:w-[35px] lg:h-[35px]"
												width={30}
												height={30}
											/>
										) : (
											<div className="flex items-center justify-center w-full h-full">
												<h2 className="text-white font-bold text-lg">
													{getNameInitials({
														name: session?.user?.name || "",
													})}
												</h2>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-row gap-4 w-full p-6 justify-start">
				{/* Sidebar */}
				<div className="w-[20%] bg-[#F6F8FA] rounded-lg shadow-sm p-1 h-fit flex flex-col gap-2">
					<div className="bg-[#F6F8FA] rounded-lg shadow-sm border border-[#E2E4E9] p-1 h-fit">
						<p className="text-primary-6 text-sm font-inter p-2">
							Cohort Details
						</p>
						<div className="bg-white rounded-lg shadow p-3 flex flex-col gap-2 w-full">
							<button
								onClick={() => setActiveTab("basic-info")}
								className={`text-sm flex flex-row gap-5 items-center ${
									activeTab === "basic-info" ? "text-primary-6" : "text-dark-1"
								}`}>
								Basic Information
								{activeTab === "basic-info" && (
									<IconCircleFilled size={10} color="#FF9100" />
								)}
							</button>
							<button
								onClick={() => setActiveTab("course-added")}
								className={`text-sm flex flex-row gap-5 items-center  ${
									activeTab === "course-added"
										? "text-primary-6"
										: "text-dark-1"
								}`}>
								Course Added
								{activeTab === "course-added" && (
									<IconCircleFilled size={10} color="#FF9100" />
								)}
							</button>
							<button
								onClick={() => setActiveTab("students")}
								className={`text-sm flex flex-row gap-5 items-center  ${
									activeTab === "students" ? "text-primary-6" : "text-dark-1"
								}`}>
								Enrolled Students
								{activeTab === "students" && (
									<IconCircleFilled size={10} color="#FF9100" />
								)}
							</button>
						</div>
					</div>

					<div className="bg-[#F6F8FA] rounded-lg shadow-sm border border-[#E2E4E9] p-1 h-fit">
						<p className="text-primary-6 text-sm font-inter p-2">Sessions</p>
						<div className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
							<button
								onClick={() => setActiveTab("session-list")}
								className={`text-sm flex flex-row gap-5 items-center ${
									activeTab === "session-list"
										? "text-primary-6"
										: "text-dark-1"
								}`}>
								Upcoming Sessions
								{activeTab === "session-list" && (
									<IconCircleFilled size={10} color="#FF9100" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Content area */}
				<div className="w-[80%] bg-[#F6F8FA] rounded-lg shadow-sm border border-[#E2E4E9] p-1 h-fit">
					{renderContent()}
				</div>
			</div>
		</section>
	);
}

export default CohortDetails;
