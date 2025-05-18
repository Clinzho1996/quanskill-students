import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Cohort {
	id: string;
	title: string;
	level: string;
	cover_image: string;
	name: string;
	start_date: string;
	end_date: string;
	enrollment_capacity: number;
	amount: number;
	created_at: string;
	updated_at: string;
}

interface ApiResponse {
	status: string;
	message: string;
	data: Cohort;
}
function BasicInfo() {
	const { id } = useParams();
	const [courses, setCourses] = useState<Cohort | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const fetchLecturerCourses = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`https://api.quanskill.com/api/v1/cohort/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			setCourses(response.data.data);
		} catch (error) {
			console.error("Error fetching lecturer courses:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchLecturerCourses();
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

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading Courses...</p>
			</div>
		);
	}

	return (
		<div>
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">Basic Information</p>
				<p className="text-xs text-primary-6">
					Basic information about the cohort you are created
				</p>
			</div>

			<div className="space-y-6 bg-white rounded-lg shadow p-6">
				<div>
					<div className="mb-4">
						{courses?.cover_image ? (
							<Image
								src={courses?.cover_image}
								alt="Cohort Cover"
								className="h-60 object-cover rounded-lg w-full/2"
								width={500}
								height={200}
							/>
						) : (
							<Image
								src="/images/cohort.png"
								width={500}
								height={300}
								alt="Cohort cover"
								className="h-60 object-cover rounded-lg w-full/2"
							/>
						)}
						{!courses?.cover_image && (
							<div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
						)}
					</div>

					<div className="flex flex-col gap-4">
						<div>
							<p className="text-sm text-gray-500">Cohort Name</p>
							<p className="font-medium">{courses?.name || "Cohort Name"}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Start Date</p>
							<p className="font-medium">
								{formatDate(courses?.start_date || "")}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">End Date</p>
							<p className="font-medium">
								{formatDate(courses?.end_date || "")}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Enrollment Capacity</p>
							<p className="font-medium">{courses?.enrollment_capacity}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Amount</p>
							<p className="font-medium">${courses?.amount}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BasicInfo;
