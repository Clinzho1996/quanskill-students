import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";

// Dynamically import ReactQuill (Fixes "document is not defined" error)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface AddPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	onPostAdded: () => void;
}

const AddPostModal = ({ isOpen, onClose, onPostAdded }: AddPostModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [featuredImage, setFeaturedImage] = useState<File | null>(null);
	const [postStatus, setPostStatus] = useState("draft");
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setFeaturedImage(file);

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setPreviewImage(null);
		}
	};

	const handleAddPost = async () => {
		try {
			setIsLoading(true);

			if (!title.trim()) {
				toast.error("The post title is required.");
				setIsLoading(false);
				return;
			}
			if (!content.trim()) {
				toast.error("The post content is required.");
				setIsLoading(false);
				return;
			}

			const session = await getSession();
			if (!session || !session.accessToken) {
				toast.error("You need to be logged in to create a post.");
				setIsLoading(false);
				return;
			}

			const formData = new FormData();
			formData.append("post_title", title);
			formData.append("post_body", content);
			formData.append("post_status", postStatus);
			if (featuredImage) {
				formData.append("post_image", featuredImage);
			}

			const response = await axios.post(
				"https://api.quanskill.com/api/v1/post",
				formData,
				{
					headers: {
						Authorization: `Bearer ${session.accessToken}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.error) {
				toast.error(response.data.error);
			} else {
				toast.success("Post created successfully!");
				onPostAdded();
				onClose();
			}
		} catch (error) {
			console.error("Error adding post:", error);
			toast.error("An error occurred while adding the post.");
		} finally {
			setIsLoading(false);
		}
	};

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

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Add New Post"
			className="modal">
			<hr className="mb-4" />
			<div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto ">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Title
					</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
					/>
				</div>

				{/* File Picker - Render only on client */}
				{isClient && (
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Featured Image
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
						/>
						{previewImage && (
							<div className="mt-2">
								<img
									src={previewImage}
									alt="Preview"
									className="w-32 h-32 object-cover rounded-md"
								/>
							</div>
						)}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700">
						Post Status
					</label>
					<select
						value={postStatus}
						onChange={(e) => setPostStatus(e.target.value)}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm">
						<option value="draft">Draft</option>
						<option value="publish">Publish</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						Content
					</label>
					<ReactQuill
						value={content}
						onChange={setContent}
						modules={modules}
						className="mt-2 "
					/>
				</div>

				<div className="flex justify-end space-x-2">
					<Button
						variant="ghost"
						onClick={onClose}
						className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs">
						Cancel
					</Button>
					<Button
						onClick={handleAddPost}
						className="bg-primary-2 text-white font-inter text-xs"
						disabled={isLoading}>
						{isLoading ? "Adding Post..." : "Add Post"}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default AddPostModal;
