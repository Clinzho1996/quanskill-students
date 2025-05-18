"use client";

import AssignedLecturer from "@/components/AssignedLecturer";
import BasicInfo from "@/components/course-details/BasicInfo";
import CourseOverview from "@/components/course-details/CourseOverview";
import CourseTopics from "@/components/course-details/CourseTopics";
import { IconArrowBack, IconSettings } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

function CourseDetails() {
	const { data: session } = useSession();

	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	return (
		<section className="bg-[#F6F8F9] min-h-screen">
			<div className="flex flex-row justify-between items-center bg-white p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
				<div className="flex flex-row justify-start gap-2 items-center">
					<div>
						<Link href="/course-management">
							<div className="p-2 border-[1px] border-dark-3 rounded-md cursor-pointer">
								<IconArrowBack size={18} />
							</div>
						</Link>
					</div>
					<div>
						<h2 className="text-sm text-dark-1 font-normal font-inter">
							Course Details
						</h2>
						<p className="text-xs font-light text-dark-2 font-inter">
							View and manage course data, including course information, roles,
							and course schemes.
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
				{/* lecturer information */}
				<div className="w-[65%] sm:w-full bg-[#F6F8FA] rounded-lg shadow-sm border border-[#E2E4E9] p-1">
					<BasicInfo />

					<hr className="my-4" />
					<CourseOverview />
					{/* <OtherInfo /> */}

					<hr className="my-4" />

					<CourseTopics />
				</div>

				{/* course information   */}
				<div className="w-[35%] sm:w-full bg-[#F6F8FA] rounded-lg shadow-sm border border-[#E2E4E9] p-1 h-fit">
					<AssignedLecturer />
				</div>
			</div>
		</section>
	);
}

export default CourseDetails;
