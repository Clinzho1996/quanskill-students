import { IconArrowRight } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Course {
	id: string;
	title: string;
	level: string;
	cover_image: string;
}

interface ApiResponse {
	status: string;
	message: string;
	data: Course[];
}

function CourseAdded() {
	const { id } = useParams();
	const [courses, setCourses] = useState<Course[]>([]);
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
				`https://api.quanskill.com/api/v1/cohort/courses/${id}`,
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

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading Courses...</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex flex-row justify-between items-center p-3 w-full">
				<p className="text-sm text-dark-1 font-medium">
					Courses Added to Cohort
				</p>
			</div>
			<div className="bg-white rounded-lg shadow-lg p-3 w-full">
				<div className="flex flex-col justify-between items-start w-full">
					{courses?.length > 0 ? (
						courses.map((course) => (
							<div key={course.id} className="w-full">
								<div className="w-full flex flex-row justify-between items-center">
									<div className="flex flex-row justify-start items-center gap-3 w-full">
										<div>
											<Image
												src={course.cover_image || "/images/python.png"}
												width={80}
												height={40}
												alt={course.title}
												className="rounded-lg"
											/>
										</div>
										<div>
											<p className="text-dark-1 text-sm font-semibold font-inter">
												{course.title}
											</p>
											<p className="text-[#5E5F6E] text-xs font-normal">
												{course.level}
											</p>
										</div>
									</div>
									<div className="w-full flex flex-row justify-end items-center gap-2">
										<Link href={`/course-management/${course.id}`}>
											<IconArrowRight size={18} color="#FF9100" />
										</Link>
									</div>
								</div>
								{courses.indexOf(course) < courses.length - 1 && (
									<hr className="w-full my-4" />
								)}
							</div>
						))
					) : (
						<p className="text-sm text-gray-500">No course added</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default CourseAdded;
