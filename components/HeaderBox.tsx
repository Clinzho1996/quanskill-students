"use client";
import { IconBrandFacebookFilled } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

function HeaderBox() {
	const { data: session } = useSession();

	console.log(session);
	// Function to get the name initials from the user's name
	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	return (
		<div className="flex flex-row justify-between items-center p-4 border-b-[1px] border-[#E2E4E9] h-[80px]">
			{session?.user && (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-dark-1 font-normal font-inter capitalize">
						👋🏻 Welcome back, {session?.user?.name} !
					</p>
					<p className="text-xs font-light text-dark-2 font-inter">
						Ready to level up your skills today?🚀
					</p>
				</div>
			)}
			<div className="hidden lg:flex flex-row justify-start gap-1 items-center">
				<Link href="https://zalo.me/g/mixlfz006" target="_blank">
					<Button className="bg-primary-1 text-white">
						<Image src="/images/zalo.png" alt="zalo" width={20} height={20} />{" "}
						Join Zalo Community
					</Button>
				</Link>
				<Link
					href="https://facebook.com/groups/771116585386998"
					target="_blank">
					<Button className="bg-secondary-1 text-white">
						<IconBrandFacebookFilled /> Join Facebook Community
					</Button>
				</Link>
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
										{getNameInitials({ name: session?.user?.name || "" })}
									</h2>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default HeaderBox;
