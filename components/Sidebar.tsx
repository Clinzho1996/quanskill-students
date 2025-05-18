"use client";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";

const Sidebar = () => {
	const pathname = usePathname();
	const isSettingsActive =
		pathname === "/settings" || pathname.startsWith("/settings");

	<Link
		href="/settings"
		className={cn(
			"flex gap-2 items-center p-2 justify-start rounded-[8px] mx-4 my-0",
			{
				"bg-[#E9E9EB17] shadow-inner shadow-[#FFFFFF0D] border-[1px] border-primary-4":
					isSettingsActive,
			}
		)}>
		<div className="flex gap-2 items-center p-1 justify-start rounded-[8px] mx-4 my-0">
			<Image
				src="/icons/settings.svg"
				alt="settings"
				width={20}
				height={20}
				className="w-[20px] h-[20px] object-contain flex"
			/>
			<p className="text-sm font-normal font-inter max-lg:hidden text-[#E9E9EB]">
				Help and Support
			</p>
		</div>
	</Link>;

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
			await signOut({ redirect: true, callbackUrl: "/sign-in" });

			toast.success("Logout successful!");
		} catch (error) {
			// Catch any unexpected errors (although 'signOut' should generally not throw)
			toast.error("Failed to log out. Please try again.");
			console.error("Sign-out error:", error);
		}
	};

	return (
		<section className="sticky left-0 top-0 flex h-screen w-fit flex-col border-r-[1px] justify-between  bg-primary-1  text-dark-3 max-sm:hidden lg:w-[234px] z-10">
			<div className="flex flex-1 flex-col gap-2">
				<Link
					href="/"
					className="max-lg:hidden items-center gap-1 border-b-[1px] border-b-[#CED0D51A] p-3 lg:flex h-[80px]">
					<Image
						src="/images/logo20.png"
						alt="Quanskill Logo"
						width={150}
						height={50}
						className="w-fit justify-center h-[40px] flex flex-row "
					/>
				</Link>
				<Link
					href="/"
					className="items-center gap-1 border-b-[1px] p-3 max-lg:flex hidden">
					<Image
						src="/images/icon.png"
						alt="One Acre Fund Logo"
						width={50}
						height={50}
						className="w-[50px] object-contain h-full flex"
					/>
				</Link>
				<p className="text-sm font-normal text-dark-2 pl-4 font-inter py-4">
					MENU
				</p>
				{sidebarLinks.map((item) => {
					const isActive =
						pathname === item.route || pathname.startsWith(`${item.route}/`);

					return (
						<Link
							href={item.route}
							key={item.label}
							className={cn(
								"flex gap-2 items-center p-2 justify-start rounded-[8px] mx-4 my-0",
								{
									"bg-[#E9E9EB17] shadow-inner shadow-[#FFFFFF0D] border-[1px] border-primary-4":
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
									"text-sm font-normal font-inter max-lg:hidden text-[#E9E9EB]",
									{
										"text-[#E9E9EB]": isActive,
									}
								)}>
								{item.label}
							</p>
						</Link>
					);
				})}
			</div>
			<div className="flex flex-col gap-2 mb-4">
				<div className="flex flex-col mx-2 gap-2 border-b-[1px] border-[#CED0D51A] py-3">
					<Link
						href="/settings"
						className="flex gap-2 items-center p-1 justify-start rounded-[8px] mx-4 my-0 cursor-pointer">
						<Image
							src="/icons/settings.svg"
							alt="settings"
							width={20}
							height={20}
							className="w-[20px] h-[20px] object-contain flex"
						/>
						<p className="text-sm font-normal font-inter max-lg:hidden text-[#E9E9EB]">
							Settings
						</p>
					</Link>
					<div
						className="flex gap-2 items-center p-1 justify-start rounded-[8px] mx-4 my-0 cursor-pointer"
						onClick={handleLogout}>
						<Image
							src="/icons/logout.svg"
							alt="settings"
							width={20}
							height={20}
							className="w-[20px] h-[20px] object-contain flex"
						/>
						<p className="text-sm font-normal font-inter max-lg:hidden text-[#E9E9EB]">
							Logout
						</p>
					</div>
				</div>
				{session?.user && (
					<div className="md:flex flex-row bg-[#E9E9EB17] shadow-inner shadow-[#FFFFFF0D] border-[1px] border-primary-4 p-2 rounded-md justify-start gap-2 items-center mx-2 px-2">
						<div className="p- bg-dark-3 flex flex-row justify-start items-center border-[1px] border-dark-3 rounded-full overflow-hidden">
							{session.user.image ? (
								<Image
									src={session.user.image}
									alt="profile"
									className="object-cover w-full h-full lg:w-[42px] lg:h-[42px] rounded-full"
									width={50}
									height={50}
								/>
							) : (
								<div className="flex items-center justify-center w-full h-full">
									<h2 className="text-white font-bold text-lg">
										{getNameInitials({ name: session?.user?.name || "" })}
									</h2>
								</div>
							)}
						</div>
						<div className="hidden md:hidden lg:block">
							<h3 className="text-white text-sm font-normal font-inter capitalize">
								{session.user.name}
							</h3>
							<h3 className="text-xs text-white">{session.user.email}</h3>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default Sidebar;
