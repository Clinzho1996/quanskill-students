"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Course {
	id: string;
	title: string;
}

interface Topic {
	id: string;
	title: string;
	description: string;
}

function ScheduleSession() {
	const { id } = useParams();
	const [courses, setCourses] = useState<Course[]>([]);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [selectedCourse, setSelectedCourse] = useState<string>("");
	const [selectedTopic, setSelectedTopic] = useState<string>("");
	const [formData, setFormData] = useState({
		sessionType: "live",
		meetingTime: "",
		meetingDate: "",
	});
	const [isLoading, setIsLoading] = useState(true);

	const fetchCourses = async () => {
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.get<{ data: Course[] }>(
				"https://api.quanskill.com/api/v1/course",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);
			setCourses(response.data.data);
			if (response.data.data.length > 0) {
				setSelectedCourse(response.data.data[0].id);
			}
		} catch (error) {
			console.error("Error fetching courses:", error);
			toast.error("Failed to load courses");
		}
	};

	const fetchTopics = async () => {
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.get<{ data: Topic[] }>(
				`https://api.quanskill.com/api/v1/course/fetch-topics/${selectedCourse}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);
			setTopics(response.data.data);
		} catch (error) {
			console.error("Error fetching topics:", error);
			toast.error("Failed to load topics");
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			await fetchCourses();
			setIsLoading(false);
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (selectedCourse) {
			fetchTopics();
		}
	}, [selectedCourse]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
		if (
			!selectedCourse ||
			!selectedTopic ||
			!formData.meetingDate ||
			!formData.meetingTime
		) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			const payload = {
				course_topic_id: selectedTopic,
				session_type: formData.sessionType,
				date: formData.meetingDate,
				time: formData.meetingTime,
			};

			const response = await axios.post(
				`https://api.quanskill.com/api/v1/cohort/add-schedule/${id}`,
				payload,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("Session scheduled successfully!");
				// You might want to redirect or reset the form here
			} else {
				throw new Error(response.data.message || "Failed to schedule session");
			}
		} catch (error) {
			console.error("Failed to schedule session:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to schedule session"
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading data...</p>
			</div>
		);
	}

	return (
		<div className="p-4">
			<h1 className="text-xs mb-4">Schedule a Session</h1>
			<p className="text-sm text-gray-600 mb-6">
				Please fill out the required fields to schedule a session.
			</p>

			<div className="space-y-2 bg-white rounded-lg shadow p-6">
				{/* Choose a Course Section */}
				<div className="bg-white p-4 rounded-lg shadow">
					<h2 className="text-xs mb-4 text-[#6B7280]">Choose a Course</h2>

					<Select value={selectedCourse} onValueChange={setSelectedCourse}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a course" />
						</SelectTrigger>
						<SelectContent className="w-full bg-white">
							{courses.map((course) => (
								<SelectItem key={course.id} value={course.id}>
									{course.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{selectedCourse && (
						<div className="mt-4">
							<div className="overflow-x-auto">
								<table className="min-w-full ">
									<thead className="bg-transparent">
										<tr>
											<th className="py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
												Session Type
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
												Meeting Time
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider">
												Meeting Date
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										<tr>
											<td className="px-4 py-2 whitespace-nowrap">
												<Select
													value={formData.sessionType}
													onValueChange={(value) =>
														setFormData((prev) => ({
															...prev,
															sessionType: value,
														}))
													}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
													<SelectContent className="w-full bg-white">
														<SelectItem value="live">Live teaching</SelectItem>
														<SelectItem value="recorded">Recorded</SelectItem>
													</SelectContent>
												</Select>
											</td>
											<td className="px-4 py-2 whitespace-nowrap">
												<Input
													type="time"
													name="meetingTime"
													className="w-full"
													value={formData.meetingTime}
													onChange={handleInputChange}
												/>
											</td>
											<td className="px-4 py-2 whitespace-nowrap">
												<Input
													type="date"
													name="meetingDate"
													className="w-full"
													value={formData.meetingDate}
													onChange={handleInputChange}
												/>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>

				{/* Choose Course Topic Section */}
				{selectedCourse && (
					<div className="bg-white p-4 rounded-lg shadow">
						<h2 className="text-xs mb-4 text-[#6B7280]">Choose Course Topic</h2>

						<div className="space-y-3">
							{topics.length > 0 ? (
								topics.map((topic) => (
									<div
										key={topic.id}
										className={`p-3 border rounded-lg cursor-pointer ${
											selectedTopic === topic.id
												? "border-primary-600 bg-primary-50"
												: "border-gray-200 hover:border-gray-300"
										}`}
										onClick={() => setSelectedTopic(topic.id)}>
										<div className="flex items-center justify-between">
											<h3 className="font-medium">{topic.title}</h3>
											{selectedTopic === topic.id && (
												<IconCheck className="text-primary-600" size={20} />
											)}
										</div>
										<p className="text-sm text-gray-600 mt-1">
											{topic.description}
										</p>
									</div>
								))
							) : (
								<p className="text-sm text-gray-500">
									No topics available for this course
								</p>
							)}
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex justify-end space-x-3">
					<Button variant="outline">Reset</Button>
					<Button className="bg-secondary-1 text-white" onClick={handleSubmit}>
						Submit
					</Button>
				</div>
			</div>
		</div>
	);
}

export default ScheduleSession;
