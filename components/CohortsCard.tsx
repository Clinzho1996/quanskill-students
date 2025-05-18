import Image from "next/image";

function CohortsCard({
	title,
	data,
	difference,
	img,
}: {
	title: string;
	data: string;
	difference: number;
	img: string;
}) {
	return (
		<div className="bg-[#F6F8FA] rounded-lg border border-[#E2E4E9] shadow-inner shadow-[#03071205] p-1 w-full">
			<div className="bg-white shadow-sm p-3 rounded-lg flex flex-row justify-between items-center w-full">
				<div className="w-[70%]">
					<p className="text-primary-6 uppercase text-[11px] font-inter">
						{title}
					</p>
					<div className="flex flex-row justify-start gap-2 items-center">
						<p className="text-[#0A0D14] font-inter">{data}</p>
						<p className="text-primary-6 uppercase text-[14px] font-inter">
							+{difference}%
						</p>
					</div>
				</div>
				<div className="w-[30%] justify-end">
					<Image src={img} alt="img" width={60} height={30} />
				</div>
			</div>
		</div>
	);
}

export default CohortsCard;
