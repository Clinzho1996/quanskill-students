"use client";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { IconMenu } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";

const MobileNav = () => {
	const pathname = usePathname();
	const { data: session } = useSession();
	// Function to get the name initials from the user's name
	const getNameInitials = ({ name }: { name: string }) => {
		if (!name) return "OA";
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("");
		return initials.toUpperCase();
	};

	const handleLogout = async () => {
		try {
			// Attempt sign out with redirect set to false
			await signOut({ redirect: false });

			// Sign-out is successful if no error occurs
			toast.success("Logout successful!");
		} catch (error) {
			// Catch any unexpected errors (although 'signOut' should generally not throw)
			toast.error("Failed to log out. Please try again.");
			console.error("Sign-out error:", error);
		}
	};

	return (
		<section className="w-fulll max-w-[264px]">
			<Sheet>
				<SheetTrigger>
					<IconMenu />
				</SheetTrigger>
				<SheetContent side="left" className="border-none bg-primary-1">
					<div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
						<SheetClose asChild>
							<div className="flex flex-col justify-between h-screen">
								<div className="flex flex-1 flex-col gap-2">
									<Link
										href="/"
										className="items-center gap-1 border-b-[1px] p-3 lg:flex">
										<Image
											src="/images/logowhite.png"
											alt="One Acre Fund Logo"
											width={200}
											height={50}
											className="w-fit justify-center h-[50px] flex flex-row "
										/>
									</Link>
									<p className="text-sm font-normal text-dark-2 pl-4 font-inter py-4">
										MENU
									</p>
									{sidebarLinks.map((item) => {
										const isActive =
											pathname === item.route ||
											pathname.startsWith(`${item.route}/`);

										return (
											<Link
												href={item.route}
												key={item.label}
												className={cn(
													"flex gap-2 items-center p-2 justify-start rounded-[8px] mx-4 my-0",
													{
														"bg-primary-5 border-[1px] border-primary-4":
															isActive,
													}
												)}>
												<Image
													src={item.imgUrl}
													alt={item.label}
													width={20}
													height={20}
													className="w-[20px] h-[20px] object-contain flex"
												/>
												<p
													className={cn(
														"text-sm font-normal font-inter text-white",
														{
															"text-dark-1": isActive,
														}
													)}>
													{item.label}
												</p>
											</Link>
										);
									})}
								</div>
								<div className="flex flex-col gap-2 mt-10">
									<div className="flex flex-col mx-0 gap-2 border-b-[1px] border-dark-3 py-3">
										<div className="flex gap-2 items-center p-2 justify-start rounded-[8px] mx-4 my-0">
											<Image
												src="/images/settings.svg"
												alt="settings"
												width={20}
												height={20}
												className="w-[20px] h-[20px] object-contain flex"
											/>
											<p className="text-sm font-normal font-inter text-white">
												Settings
											</p>
										</div>
										<div
											className="flex gap-2 items-center p-2 justify-start rounded-[8px] mx-4 my-0 cursor-pointer"
											onClick={handleLogout}>
											<Image
												src="/images/logout.svg"
												alt="settings"
												width={20}
												height={20}
												className="w-[20px] h-[20px] object-contain flex"
											/>
											<p className="text-sm font-normal font-inter text-white">
												Logout
											</p>
										</div>
									</div>
									{session?.user && (
										<div className="flex flex-row justify-end gap-2 items-center mx-2 px-2 w-fit">
											<div className="flex p-2 bg-dark-2 justify-center items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
												{session.user.image ? (
													<Image
														src={session.user.image}
														alt="profile"
														className="object-contain w-[50px] h-[50px] lg:w-[50px] lg:h-[42px]"
														width={50}
														height={50}
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
											<div className="block ">
												<h3 className="text-sm font-normal font-inter text-white">
													{session.user.name}
												</h3>
												<h3 className="text-xs text-gray-400">
													{session.user.email}
												</h3>
											</div>
										</div>
									)}
								</div>
							</div>
						</SheetClose>
					</div>
				</SheetContent>
			</Sheet>
		</section>
	);
};

export default MobileNav;
