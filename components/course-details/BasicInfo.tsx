"use client";
import { IconEdit } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Lecturer {
	id: string;
	title: string;
	cover_image: string;
	category: {
		id: string;
		name: string;
	};
	level: string;
	phone: string;
	pic: string | null;
	gender: string;
	status: boolean;
	created_at: string;
}

function BasicInfo() {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [lecturer, setLecturer] = useState<Lecturer | null>(null);

	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const fetchLecturerData = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get(
				`https://api.quanskill.com/api/v1/course/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			const data = response.data.data;
			setLecturer(data);
		} catch (error) {
			console.error("Error fetching lecturer data:", error);
			toast.error("Failed to fetch lecturer data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchLecturerData();
		}
	}, [id]);

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	if (isLoading || !lecturer) {
		return <div className="flex-center p-3">Loading...</div>;
	}

	return (
		<div>
			<div className="flex flex-row justify-between items-center p-3">
				<p className="text-sm text-dark-1 font-medium">Basic Information</p>
			</div>
			<div className="bg-white rounded-lg shadow-lg p-3 w-full">
				<div className="flex items-center gap-4">
					<div className="relative group">
						{imagePreview ? (
							<>
								<Image
									src={imagePreview}
									width={50}
									height={50}
									alt="Preview"
									className="rounded-full w-[50px] h-[50px] object-cover"
								/>
								<div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<IconEdit size={16} className="text-white" />
								</div>
							</>
						) : lecturer?.cover_image ? (
							<Image
								src={lecturer.cover_image}
								width={150}
								height={50}
								alt="profile"
								className="rounded-lg w-[150px] h-[80px] object-cover"
							/>
						) : (
							<div className="relative">
								<Image
									src="/images/avatar.png"
									width={50}
									height={50}
									alt="profile"
									className="rounded-full"
								/>
								<div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<IconEdit size={16} className="text-white" />
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-row justify-start items-start gap-20 w-full mt-2">
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-normal">Course Title</p>
						<p className="text-dark-1 text-sm font-semibold font-inter capitalize">
							{lecturer.title}
						</p>
					</div>
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-light">Category</p>
						<p className="text-dark-1 text-sm font-semibold font-inter capitalize">
							{lecturer.category.name}
						</p>
					</div>
				</div>

				<div className="flex flex-row justify-start items-start gap-20 mt-4">
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-normal">Level</p>
						<p className="text-dark-1 text-sm font-semibold font-inter capitalize">
							{lecturer.level}
						</p>
					</div>
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-light">Visibility</p>
						<p className="text-dark-1 text-sm font-semibold font-inter capitalize">
							Public
						</p>
					</div>
				</div>

				<div className="flex flex-row justify-start items-start gap-20 mt-4">
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-normal">Date Added</p>
						<p className="text-dark-1 text-sm font-semibold font-inter">
							{formatDate(lecturer.created_at)}
						</p>
					</div>
					<div className="w-full sm:w-[50%] flex-col flex gap-2">
						<p className="text-[#5E5F6E] text-xs font-light">Status</p>
						<p className={`status-inner ${lecturer.status ? "green" : "red"}`}>
							{lecturer.status ? "Active" : "Inactive"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BasicInfo;
