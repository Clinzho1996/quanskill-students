import HeaderBox from "@/components/HeaderBox";
import Table from "@/config/columns";

function UserManagement() {
	return (
		<div>
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col px-4 py-2 gap-4">
				<Table />
			</div>
		</div>
	);
}

export default UserManagement;
