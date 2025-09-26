"use client";
import axios from "axios";
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
	topics: {
		id: string;
		title: string;
		description: string;
	}[];
	phone: string;
	pic: string | null;
	gender: string;
	status: boolean;
	created_at: string;
}

interface ResourceItem {
	id: string;
	course_topic_id: string;
	name: string;
	file: string;
	external_link: string;
	created_at: string;
	updated_at: string;
}

function CourseTopics() {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [lecturer, setLecturer] = useState<Lecturer | null>(null);
	const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
	const [resources, setResources] = useState<ResourceItem[]>([]);
	const [isLoadingResources, setIsLoadingResources] = useState(false);

	const getPdfViewerUrl = (fileUrl: string) => {
		return `https://docs.google.com/gview?url=${encodeURIComponent(
			fileUrl
		)}&embedded=true`;
	};

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

			// Select the first topic by default if available
			if (data.topics.length > 0) {
				setSelectedTopicId(data.topics[0].id);
			}
		} catch (error) {
			console.error("Error fetching lecturer data:", error);
			toast.error("Failed to fetch lecturer data");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchResources = async (topicId: string) => {
		try {
			setIsLoadingResources(true);
			const session = await getSession();

			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			const response = await axios.get(
				`https://api.quanskill.com/api/v1/course/fetch-resources/${topicId}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				setResources(response.data.data);
			}
		} catch (error) {
			console.error("Failed to fetch resources:", error);
			toast.error("Failed to load resources");
		} finally {
			setIsLoadingResources(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchLecturerData();
		}
	}, [id]);

	useEffect(() => {
		if (selectedTopicId) {
			fetchResources(selectedTopicId);
		}
	}, [selectedTopicId]);

	if (isLoading || !lecturer) {
		return <div className="flex-center p-3">Loading...</div>;
	}

	return (
		<div>
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">Course Topics</p>
			</div>

			<div className="space-y-6 bg-white rounded-lg shadow p-6">
				{lecturer.topics.map((topic, index) => (
					<div
						key={index}
						className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
						<div className="flex flex-row justify-between items-center">
							<div className="flex flex-row gap-2 items-center">
								<div>
									<h2 className="text-sm text-dark-1 font-normal font-inter">
										{topic.title}
									</h2>
									<p className="text-xs font-light text-dark-2 font-inter">
										{topic.description}
									</p>
								</div>
							</div>
							<button
								onClick={() => setSelectedTopicId(topic.id)}
								className={`px-3 py-1 text-xs rounded ${
									selectedTopicId === topic.id
										? "bg-primary text-white"
										: "bg-gray-200 text-gray-700"
								}`}>
								{selectedTopicId === topic.id ? "Selected" : "View Resources"}
							</button>
						</div>

						{selectedTopicId === topic.id && (
							<div className="mt-2">
								<h3 className="text-xs font-medium mb-2">Resources:</h3>
								{isLoadingResources ? (
									<p className="text-xs">Loading resources...</p>
								) : resources.length === 0 ? (
									<p className="text-xs text-gray-500">
										No resources available
									</p>
								) : (
									<div className="space-y-4">
										{resources.map((resource) => (
											<div
												key={resource.id}
												className="bg-white rounded border p-3">
												<h4 className="text-sm font-medium mb-2">
													{resource.name}
												</h4>
												{resource.file && resource.file.endsWith(".pdf") ? (
													<div className="border rounded">
														<iframe
															src={getPdfViewerUrl(resource.file)}
															className="w-full h-96"
															frameBorder="0"
															title={`PDF Viewer - ${resource.name}`}>
															<p>
																Your browser does not support iframes.{" "}
																<a
																	href={resource.file}
																	target="_blank"
																	rel="noopener noreferrer">
																	View PDF
																</a>
															</p>
														</iframe>
													</div>
												) : (
													<a
														href={resource.file || resource.external_link}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-blue-600 hover:underline flex items-center gap-1">
														{resource.name}
													</a>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default CourseTopics;
