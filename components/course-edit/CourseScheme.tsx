"use client";

import {
	IconEdit,
	IconExternalLink,
	IconPlus,
	IconTrash,
	IconUpload,
} from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SchemeItem {
	id: string;
	title: string;
	description: string;
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

function CourseTopicsAndResources() {
	const router = useRouter();
	const { id: courseId } = useParams<{ id: string }>();

	// Topic states
	const [isLoadingTopics, setIsLoadingTopics] = useState(true);
	const [currentTitle, setCurrentTitle] = useState("");
	const [currentDescription, setCurrentDescription] = useState("");
	const [topics, setTopics] = useState<SchemeItem[]>([]);
	const [isDeletingTopic, setIsDeletingTopic] = useState(false);
	const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

	// Resource states
	const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
	const [resourceName, setResourceName] = useState("");
	const [resourceLink, setResourceLink] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [resources, setResources] = useState<ResourceItem[]>([]);
	const [isLoadingResources, setIsLoadingResources] = useState(false);
	const [isDeletingResource, setIsDeletingResource] = useState(false);
	const [isSubmittingTopics, setIsSubmittingTopics] = useState(false);

	// Load topics when component mounts
	useEffect(() => {
		const fetchTopics = async () => {
			try {
				setIsLoadingTopics(true);
				const session = await getSession();

				if (!session?.accessToken) {
					toast.error("Authentication required");
					return;
				}

				const response = await axios.get(
					`https://api.quanskill.com/api/v1/course/fetch-topics/${courseId}`,
					{
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${session.accessToken}`,
						},
					}
				);

				if (response.data.status === "success") {
					setTopics(response.data.data);
					// Select the first topic by default if available
					if (response.data.data.length > 0) {
						setSelectedTopicId(response.data.data[0].id);
					}
				}
			} catch (error) {
				console.error("Error loading topics:", error);
				toast.error("Failed to load course topics");
			} finally {
				setIsLoadingTopics(false);
			}
		};

		if (courseId) {
			fetchTopics();
		}
	}, [courseId]);

	// Load resources when selected topic changes
	useEffect(() => {
		const fetchResources = async () => {
			if (!selectedTopicId) return;

			try {
				setIsLoadingResources(true);
				const session = await getSession();

				if (!session?.accessToken) {
					toast.error("Authentication required");
					return;
				}

				const response = await axios.get(
					`https://api.quanskill.com/api/v1/course/fetch-resources/${selectedTopicId}`,
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

		fetchResources();
	}, [selectedTopicId]);

	// Topic handlers
	const handleAddTopic = () => {
		if (!currentTitle.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (editingTopicId) {
			// Update existing topic
			setTopics(
				topics.map((topic) =>
					topic.id === editingTopicId
						? {
								...topic,
								title: currentTitle,
								description: currentDescription,
						  }
						: topic
				)
			);
			setEditingTopicId(null);
		} else {
			// Add new topic
			const newTopic = {
				id: Date.now().toString(),
				title: currentTitle,
				description: currentDescription,
			};
			setTopics([...topics, newTopic]);
			// Select the newly added topic
			setSelectedTopicId(newTopic.id);
		}

		setCurrentTitle("");
		setCurrentDescription("");
	};

	const handleEditTopic = (topic: SchemeItem) => {
		setCurrentTitle(topic.title);
		setCurrentDescription(topic.description);
		setEditingTopicId(topic.id);
	};

	const handleDeleteTopic = async (id: string) => {
		try {
			setIsDeletingTopic(true);
			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/course/delete-topic/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			// Remove the deleted topic from the list
			setTopics(topics.filter((topic) => topic.id !== id));

			// If the deleted topic was the selected one, clear the selection
			if (selectedTopicId === id) {
				setSelectedTopicId(null);
				setResources([]); // Clear resources since the topic is gone
			}

			toast.success("Topic deleted successfully!");
		} catch (error) {
			console.error("Failed to delete topic:", error);
			toast.error("Failed to delete topic");
		} finally {
			setIsDeletingTopic(false);
		}
	};

	const handleSubmitTopics = async () => {
		try {
			setIsSubmittingTopics(true);

			if (topics.length === 0) {
				toast.error("Please add at least one topic");
				return;
			}

			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			// Prepare payload for all topics
			for (const topic of topics) {
				const payload = {
					title: topic.title,
					description: topic.description,
				};

				// Submit to API
				const response = await axios.post(
					`https://api.quanskill.com/api/v1/course/add-topic/${courseId}`,
					payload,
					{
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${session.accessToken}`,
							"Content-Type": "application/json",
						},
					}
				);

				if (response.data.status !== "success") {
					throw new Error(response.data.message || "Failed to create topic");
				}
			}
			toast.success("Course topics updated successfully!");
			router.push("/course-management");
		} catch (error) {
			console.error("Failed to update topics:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update topics"
			);
		} finally {
			setIsSubmittingTopics(false);
		}
	};

	// Resource handlers
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const handleUploadResource = async () => {
		if (!resourceName.trim()) {
			toast.error("Please enter a resource name");
			return;
		}

		if (!selectedTopicId) {
			toast.error("Please select a topic first");
			return;
		}

		try {
			setIsUploading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			const formData = new FormData();
			formData.append("name", resourceName);
			formData.append("external_link", resourceLink);
			if (selectedFile) {
				formData.append("file", selectedFile);
			}

			const response = await axios.post(
				`https://api.quanskill.com/api/v1/course/add-resource/${selectedTopicId}`,
				formData,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("Resource uploaded successfully!");
				// Add the new resource to the list
				setResources([response.data.data, ...resources]);

				// Reset form
				setResourceName("");
				setSelectedFile(null);
			}
		} catch (error) {
			console.error("Failed to upload resource:", error);
			toast.error("Failed to upload resource");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteResource = async (resourceId: string) => {
		try {
			setIsDeletingResource(true);
			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			await axios.delete(
				`https://api.quanskill.com/api/v1/course/delete-resource/${resourceId}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			// Remove the deleted resource from the list
			setResources(resources.filter((resource) => resource.id !== resourceId));
			toast.success("Resource deleted successfully!");
		} catch (error) {
			console.error("Failed to delete resource:", error);
			toast.error("Failed to delete resource");
		} finally {
			setIsDeletingResource(false);
		}
	};

	if (isLoadingTopics) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading course topics...</p>
			</div>
		);
	}

	return (
		<div className="mx-auto">
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">
					Course Topics & Resources
				</p>
				<p className="text-xs text-primary-6">
					Manage course topics and their resources
				</p>
			</div>

			{/* Topics Section */}
			<div className="bg-white p-3 rounded-lg shadow mb-4">
				<div className="flex flex-col gap-4">
					<div>
						<p className="text-sm text-primary-6">Topic Title</p>
						<Input
							type="text"
							value={currentTitle}
							onChange={(e) => setCurrentTitle(e.target.value)}
							className="focus:border-none"
							placeholder="Enter topic title"
						/>
					</div>

					<div>
						<p className="text-sm text-primary-6">Description</p>
						<textarea
							value={currentDescription}
							onChange={(e) => setCurrentDescription(e.target.value)}
							className="w-full h-32 p-2 border rounded-md"
							placeholder="Enter topic description"
						/>
					</div>

					<div className="flex flex-row justify-end">
						<Button
							onClick={handleAddTopic}
							className="flex items-center gap-2 w-fit">
							<IconPlus size={16} />
							{editingTopicId ? "Update Topic" : "Add Topic"}
						</Button>
					</div>
				</div>
			</div>

			{/* Topics List */}
			{topics.length > 0 && (
				<div className="bg-[#F6F8FA] p-3 rounded-lg mb-4">
					<h3 className="text-sm font-medium mb-3">Course Topics</h3>
					<div className="space-y-4">
						{topics.map((topic) => (
							<div
								key={topic.id}
								className={`border-b pb-4 last:border-b-0 bg-white p-3 rounded-lg shadow ${
									selectedTopicId === topic.id ? "border-2 border-primary" : ""
								}`}>
								<div className="flex flex-col justify-between items-start">
									<div className="w-full">
										<div className="flex justify-between items-start">
											<h4 className="font-medium">{topic.title}</h4>
											<div className="flex gap-2">
												<button
													onClick={() => handleEditTopic(topic)}
													className="flex flex-row justify-start gap-2 text-sm text-primary-500 hover:text-primary-700 border px-2 py-1 rounded-lg">
													Edit <IconEdit size={18} />
												</button>
												<button
													onClick={() => handleDeleteTopic(topic.id)}
													className="text-red-500 hover:text-red-700"
													disabled={isDeletingTopic}
													title="Delete topic">
													{isDeletingTopic ? (
														"Deleting..."
													) : (
														<IconTrash size={18} />
													)}
												</button>
											</div>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											{topic.description}
										</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-2"
											onClick={() => setSelectedTopicId(topic.id)}>
											{selectedTopicId === topic.id ? "Selected" : "Select"}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Resources Section for Selected Topic */}
			{selectedTopicId && (
				<>
					<div className="bg-white p-3 rounded-lg shadow mb-4">
						<h3 className="text-sm font-medium mb-3">
							Resources for Selected Topic
						</h3>
						<div className="flex flex-col gap-4">
							<div>
								<p className="text-sm text-primary-6">Resource Name</p>
								<Input
									type="text"
									value={resourceName}
									onChange={(e) => setResourceName(e.target.value)}
									className="focus:border-none"
									placeholder="Enter resource name"
								/>
							</div>

							<div>
								<p className="text-sm text-primary-6">Resource Link</p>
								<Input
									type="text"
									value={resourceLink}
									onChange={(e) => setResourceLink(e.target.value)}
									className="focus:border-none"
									placeholder="Enter resource link"
								/>
							</div>

							<div>
								<p className="text-sm text-primary-6">File</p>
								<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<IconUpload className="w-8 h-8 mb-4 text-gray-500" />
										<p className="mb-2 text-sm text-gray-500">
											{selectedFile ? (
												<span className="font-semibold">
													{selectedFile.name}
												</span>
											) : (
												<>
													<span className="font-semibold">Click to upload</span>{" "}
													or drag and drop
												</>
											)}
										</p>
										<p className="text-xs text-gray-500">
											{!selectedFile && "PDF, DOCX, JPG, PNG (MAX. 10MB)"}
										</p>
									</div>
									<input
										id="file-upload"
										type="file"
										className="hidden"
										onChange={handleFileChange}
									/>
								</label>
							</div>

							<div className="flex flex-row justify-end">
								<Button
									onClick={handleUploadResource}
									disabled={
										isUploading ||
										!resourceName ||
										(!selectedFile && !resourceLink)
									}
									className="flex items-center gap-2 w-fit">
									{isUploading ? "Uploading..." : "Upload Resource"}
									{!isUploading && <IconPlus size={16} />}
								</Button>
							</div>
						</div>
					</div>

					{/* Resources List */}
					<div className="bg-white p-3 rounded-lg shadow mb-4">
						<h3 className="text-sm font-medium mb-3">Uploaded Resources</h3>
						{isLoadingResources ? (
							<p>Loading resources...</p>
						) : resources.length === 0 ? (
							<p className="text-sm text-gray-500">No resources uploaded yet</p>
						) : (
							<div className="space-y-3">
								{resources.map((resource) => (
									<div
										key={resource.id}
										className="flex justify-between items-center p-3 border rounded-lg">
										<div className="flex items-center gap-3">
											<IconExternalLink className="text-blue-500" />
											<a
												href={resource.file || resource.external_link}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline">
												{resource.name}
											</a>
										</div>
										<button
											onClick={() => handleDeleteResource(resource.id)}
											className="text-red-500 hover:text-red-700"
											title="Delete resource"
											disabled={isDeletingResource}>
											<IconTrash size={18} />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			)}

			<div className="flex flex-row justify-between mt-4">
				<Button
					variant="outline"
					onClick={() => router.push(`/courses/${courseId}/overview`)}>
					Back
				</Button>
				<Button
					className="bg-secondary-1 text-white"
					onClick={handleSubmitTopics}
					disabled={topics.length === 0 || isSubmittingTopics}>
					{isSubmittingTopics ? "Saving..." : "Save Topics"}
				</Button>
			</div>
		</div>
	);
}

export default CourseTopicsAndResources;
