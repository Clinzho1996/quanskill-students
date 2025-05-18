import ScheduleTable from "@/config/schedule-column";

function SessionList() {
	return (
		<div>
			<div className="p-3">
				<p className="text-sm text-dark-1 font-medium">
					Scheduled Session List
				</p>
				<p className="text-xs text-primary-6">
					Basic information about the cohort you are created
				</p>
			</div>

			<div className="space-y-6 bg-white rounded-lg shadow p-6">
				<div>
					<ScheduleTable />
				</div>
			</div>
		</div>
	);
}

export default SessionList;
