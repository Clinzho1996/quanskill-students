"use client";

import axios from "axios";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

const ReactQuill = dynamic(() => import("react-quill"), {
	ssr: false,
	loading: () => <p>Loading editor...</p>,
});

function CourseOverview() {
	const router = useRouter();
	const { id: courseId } = useParams<{ id: string }>();

	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const modules = {
		toolbar: [
			[{ header: [1, 2, false] }],
			["bold", "italic", "underline", "strike", "blockquote"],
			[
				{ list: "ordered" },
				{ list: "bullet" },
				{ indent: "-1" },
				{ indent: "+1" },
			],
			["link", "image", "video", "code-block", "formula"],
			["clean"],
		],
	};

	// Fetch existing overview
	useEffect(() => {
		const fetchOverview = async () => {
			try {
				const session = await getSession();
				if (!session?.accessToken) {
					toast.error("Authentication required");
					return;
				}

				const response = await axios.get(
					`https://api.quanskill.com/api/v1/course/${courseId}`,
					{
						headers: {
							Accept: "application/json",
							Authorization: `Bearer ${session.accessToken}`,
						},
					}
				);

				if (response.data.status === "success") {
					setContent(response.data.data.overview || "");
				}
			} catch (error) {
				console.error("Failed to fetch overview:", error);
				toast.error("Failed to load course overview");
			} finally {
				setIsLoading(false);
			}
		};

		if (courseId) {
			fetchOverview();
		} else {
			setIsLoading(false);
		}
	}, [courseId]);

	const handleSave = async () => {
		try {
			setIsSubmitting(true);

			// Validate content
			if (!content.trim()) {
				toast.error("Please enter course overview content");
				return;
			}

			const session = await getSession();
			if (!session?.accessToken) {
				toast.error("Authentication required");
				return;
			}

			// Prepare payload
			const payload = {
				overview: content,
			};

			// Update existing course overview
			const response = await axios.put(
				`https://api.quanskill.com/api/v1/course/update-overview/${courseId}`,
				payload,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("Course overview updated successfully!");
				router.push(`/create-course/${courseId}/course-resources`);
			} else {
				throw new Error(response.data.message || "Failed to update overview");
			}
		} catch (error) {
			console.error("Failed to save overview:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to save overview"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading editor...</p>
			</div>
		);
	}

	return (
		<div>
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">Edit Course Overview</p>
				<p className="text-xs text-primary-6">
					Update the course overview content
				</p>
			</div>

			<div className="bg-white p-3 rounded-lg shadow">
				<ReactQuill
					theme="snow"
					value={content}
					onChange={setContent}
					modules={modules}
					className="h-64 mb-16"
					placeholder="Enter your course overview here..."
				/>
			</div>
			<div className="flex flex-row justify-between mt-4">
				<Button
					variant="outline"
					onClick={() => router.push(`/courses/${courseId}`)}>
					Back
				</Button>
				<Button
					className="bg-secondary-1 text-white"
					onClick={handleSave}
					disabled={!content.trim() || isSubmitting}>
					{isSubmitting ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	);
}

export default CourseOverview;
