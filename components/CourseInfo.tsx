"use client";
import Image from "next/image";

function CourseInfo() {
	return (
		<div className="py-2 px-3 bg-white rounded-lg border border-[#E2E4E9] w-full">
			<div>
				<div className="flex flex-row flex-wrap justify-start gap-[25px] lg:gap-[130px] items-center py-3">
					<div className="flex flex-row justify-start gap-2 items-center min-h-[48px]">
						<Image src="/images/total.png" alt="total" width={40} height={40} />
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total cohorts
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center min-h-[48px]">
						<Image
							src="/images/active.png"
							alt="active"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								active cohorts
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center min-h-[48px]">
						<Image
							src="/images/inactive.png"
							alt="inactive"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								completed cohorts
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
				</div>
				<div className="flex flex-row flex-wrap justify-start gap-[25px] lg:gap-[130px] items-center py-3">
					<div className="flex flex-row justify-start gap-2 items-center min-h-[48px]">
						<Image
							src="/images/inactive.png"
							alt="inactive"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total courses
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center min-h-[48px]">
						<Image
							src="/images/inactive.png"
							alt="inactive"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								total enrollments
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
					<div className="border-r-[1px] border-[#E2E4E9] hidden lg:flex">
						<p className="text-transparent">|</p>
					</div>
					<div className="flex flex-row justify-start gap-2 items-center min-h-[48px]">
						<Image
							src="/images/inactive.png"
							alt="inactive"
							width={40}
							height={40}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-primary-6 uppercase text-[11px] font-inter">
								active enrollments
							</p>
							<p className="text-[#0A0D14] font-inter">0</p>
						</div>{" "}
					</div>{" "}
				</div>
			</div>
		</div>
	);
}

export default CourseInfo;
