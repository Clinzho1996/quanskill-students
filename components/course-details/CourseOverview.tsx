"use client";
import axios from "axios";
import parse from "html-react-parser";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Lecturer {
	id: string;
	title: string;
	cover_image: string;
	overview: string;
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

function CourseOverview() {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [lecturer, setLecturer] = useState<Lecturer | null>(null);
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

	if (isLoading || !lecturer) {
		return <div className="flex-center p-3">Loading...</div>;
	}
	return (
		<div>
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">Course Overview</p>
			</div>

			<div className="space-y-6 bg-white rounded-lg shadow p-6">
				<div>
					<p>{parse(lecturer.overview)}</p>
				</div>
			</div>
		</div>
	);
}

export default CourseOverview;
