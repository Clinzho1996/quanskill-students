import HeaderBox from "@/components/HeaderBox";
import StudentTable from "@/config/student-columns";

function UserManagement() {
	return (
		<div>
			<HeaderBox />
			<div className="bg-[#F6F8FA] flex flex-col px-4 py-2 gap-4">
				<StudentTable />
			</div>
		</div>
	);
}

export default UserManagement;
