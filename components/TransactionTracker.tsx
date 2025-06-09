"use client";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@tabler/icons-react";
import axios from "axios";
import { format, isSameDay } from "date-fns";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface Event {
	id?: string;
	cohort_id?: string;
	course_topic_id: string;
	session_type: string;
	date: string;
	time: string;
	url?: string | null;
	created_at: string;
	updated_at: string;
	course_topic: {
		id: string;
		course_id: string;
		title: string;
		description: string;
		created_at: string;
		updated_at: string;
	};
}

export function EventCalendar() {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [events, setEvents] = useState<Event[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

	const fetchEvents = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get(
				"https://api.quanskill.com/api/v1/user/my/schedule",
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${session.accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				setEvents(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const dayHasEvent = (day: Date) => {
		return events.some((event) => isSameDay(new Date(event.date), day));
	};

	const handleDayClick = (day: Date) => {
		const eventForDay = events.find((event) =>
			isSameDay(new Date(event.date), day)
		);
		setSelectedEvent(eventForDay || null);
	};

	if (isLoading) {
		return (
			<div className="p-3 bg-white rounded-lg border border-[#E2E4E9] w-full">
				<div className="flex flex-col lg:flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Skeleton className="h-5 w-5 rounded-full" />
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
				<div className="py-3 h-fit w-full">
					<Skeleton className="h-[400px] w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="p-3 bg-white rounded-lg border border-[#E2E4E9] w-full">
			<div className="flex flex-col lg:flex-row justify-between items-center border-b-[1px] border-b-[#E2E4E9] py-2">
				<div className="flex flex-row justify-start gap-2 items-center">
					<IconCalendar className="h-5 w-5 text-gray-600" />
					<p className="text-sm font-bold text-black">Event Calendar</p>
				</div>
			</div>

			<div className="py-3 h-fit w-full">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(day) => {
						setDate(day);
						if (day) handleDayClick(day);
					}}
					className="rounded-md border w-full"
					styles={{
						root: {
							width: "100%",
						},
						month: {
							width: "100%",
						},
						table: {
							width: "100%",
						},
						head_cell: {
							width: "14.28%", // Equal width for each day of week
							padding: "0.5rem",
						},
						cell: {
							width: "14.28%", // Equal width for each day cell
							padding: "0.5rem",
						},
					}}
					components={{
						Day: (props) => {
							const hasEvent = dayHasEvent(props.date);
							return (
								<div
									className={cn(
										"relative h-14 w-full p-0 text-center flex items-center justify-center cursor-pointer",
										hasEvent && "border-2 border-[#6E3FF3] rounded-lg"
									)}
									onClick={() => handleDayClick(props.date)}>
									<span
										className={cn(
											"mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm",
											date &&
												isSameDay(props.date, date) &&
												"bg-secondary-1 text-white"
										)}>
										{format(props.date, "d")}
									</span>
									{hasEvent && (
										<span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[#6E3FF3]"></span>
									)}
								</div>
							);
						},
					}}
				/>

				{selectedEvent ? (
					<div className="mt-4 p-4 border rounded-lg bg-gray-50">
						<h3 className="font-bold text-lg mb-2">
							{selectedEvent.course_topic.title}
						</h3>

						<p className="text-sm">
							<span className="font-semibold">Date & Time:</span>{" "}
							{format(
								new Date(
									`${selectedEvent.date.split(" ")[0]}T${selectedEvent.time}`
								),
								"PPPP 'at' h:mm a"
							)}
						</p>
						<p className="text-sm">
							<span className="font-semibold">Session Type:</span>{" "}
							{selectedEvent.session_type}
						</p>
						<p className="text-sm">
							<span className="font-semibold">Description:</span>{" "}
							{selectedEvent.course_topic.description}
						</p>
						<p className="text-sm">
							<span className="font-semibold">Join Class:</span>{" "}
							<Link
								href={selectedEvent?.url ?? "#"}
								target="_blank"
								className="text-secondary-1 underline">
								{selectedEvent?.url ?? "No link available"}
							</Link>
						</p>
					</div>
				) : (
					<div className="mt-4 p-4 border rounded-lg bg-gray-50">
						<p className="text-sm text-gray-600">
							{date
								? `No events scheduled for ${format(date, "PPPP")}`
								: "Select a date to view events"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
