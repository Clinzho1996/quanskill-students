import { IconArrowRight } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Lecturer {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	pic: string;
}

interface Course {
	id: string;
	title: string;
	level: string;
	cover_image: string;
	lecturers: Lecturer[];
	created_at: string;
	updated_at: string;
	created_by: string;
}

interface ApiResponse {
	status: string;
	message: string;
	data: Course; // Changed from { courses: Course[] } to just Course
}

function AssignedLecturer() {
	const { id } = useParams();
	const [course, setCourse] = useState<Course | null>(null);
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
				`https://api.quanskill.com/api/v1/course/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			setCourse(response.data.data);
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

	if (isLoading) {
		return <div>Loading lecturers...</div>;
	}

	return (
		<div>
			<div className="flex flex-row justify-between items-center p-3 w-full">
				<p className="text-sm text-dark-1 font-medium">Assigned Lecturer (s)</p>
			</div>
			<div className="bg-white rounded-lg shadow-lg p-3 w-full">
				<div className="flex flex-col justify-between items-start w-full">
					{course?.lecturers && course.lecturers.length > 0 ? (
						course.lecturers.map((lecturer) => (
							<div key={lecturer.id} className="w-full">
								<div className="w-full flex flex-row justify-between items-center">
									<div className="flex flex-row justify-start items-center gap-3 w-full">
										<div>
											<Image
												src={lecturer.pic || "/images/avats.png"}
												width={50}
												height={50}
												alt={`${lecturer.first_name} ${lecturer.last_name}`}
												className="rounded-full object-cover w-[50px] h-[50px] lg:w-[60px] lg:h-[60px]"
											/>
										</div>
										<div>
											<p className="text-dark-1 text-sm font-semibold font-inter">
												{lecturer.first_name} {lecturer.last_name}
											</p>
											<p className="text-[#5E5F6E] text-xs font-normal">
												{lecturer.email}
											</p>
										</div>
									</div>
									<div className="w-full flex flex-row justify-end items-center gap-2">
										<Link href={`/lecturer-management/${lecturer.id}`}>
											<IconArrowRight size={18} color="#FF9100" />
										</Link>
									</div>
								</div>
								{course.lecturers.indexOf(lecturer) <
									course.lecturers.length - 1 && <hr className="w-full my-4" />}
							</div>
						))
					) : (
						<p className="text-sm text-gray-500">No lecturer assigned</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default AssignedLecturer;
