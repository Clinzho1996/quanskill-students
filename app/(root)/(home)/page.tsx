import HeaderBox from "@/components/HeaderBox";
import { EventCalendar } from "@/components/TransactionTracker";
import StaffInfo from "@/components/UserInfo";

function Dashboard() {
	return (
		<div>
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col px-4 py-2  gap-4">
				<StaffInfo />
				<EventCalendar />
			</div>
		</div>
	);
}

export default Dashboard;
