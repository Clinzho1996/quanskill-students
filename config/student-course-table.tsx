"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	RowSelectionState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function StudentCourseDataTable<TData, TValue>({
	columns,
	data = [],
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [selectedStatus, setSelectedStatus] = useState<string>("View All");
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [tableData, setTableData] = useState<TData[]>(data);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	// Memoize the filter functions to prevent unnecessary re-renders
	const filterDataByDateRange = useCallback(() => {
		if (!dateRange?.from || !dateRange?.to) {
			if (selectedStatus === "View All") {
				setTableData(data);
			} else {
				const filteredData = data?.filter(
					(item) =>
						(item as any)?.status?.toLowerCase() ===
						selectedStatus.toLowerCase()
				);
				setTableData(filteredData as TData[]);
			}
			return;
		}

		const filteredData = (
			selectedStatus === "View All"
				? data
				: data?.filter(
						(item) =>
							(item as any)?.status?.toLowerCase() ===
							selectedStatus.toLowerCase()
				  )
		)?.filter((item: any) => {
			const date = new Date(item.date);
			return date >= dateRange.from! && date <= dateRange.to!;
		});

		setTableData((filteredData as TData[]) || []);
	}, [data, dateRange, selectedStatus]);

	const handleStatusFilter = useCallback(
		(status: string) => {
			setSelectedStatus(status);

			if (!dateRange?.from || !dateRange?.to) {
				if (status === "View All") {
					setTableData(data);
				} else {
					const filteredData = data?.filter(
						(item) =>
							(item as any)?.status?.toLowerCase() === status.toLowerCase()
					);
					setTableData(filteredData as TData[]);
				}
			} else {
				const filteredData = (
					status === "View All"
						? data
						: data?.filter(
								(item) =>
									(item as any)?.status?.toLowerCase() === status.toLowerCase()
						  )
				)?.filter((item: any) => {
					const date = new Date(item.date);
					return date >= dateRange.from! && date <= dateRange.to!;
				});
				setTableData((filteredData as TData[]) || []);
			}
		},
		[data, dateRange]
	);

	// Initialize table data
	useEffect(() => {
		setTableData(data);
	}, [data]);

	// Apply filters when date range or status changes
	useEffect(() => {
		filterDataByDateRange();
	}, [dateRange, selectedStatus, filterDataByDateRange]);

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	const rows = table.getRowModel().rows || [];

	return (
		<div className="rounded-lg border-[1px] py-0">
			<div className="p-3 flex flex-row justify-start border-b-[1px] border-[#E2E4E9] items-center gap-3">
				<div className="flex flex-row justify-start items-center rounded-lg mx-auto special-btn-farmer pr-2">
					{["View All", "Active", "Inactive"].map((status, index, arr) => (
						<p
							key={status}
							className={`px-4 py-2 text-center text-sm cursor-pointer border border-[#E2E4E9] overflow-hidden ${
								selectedStatus === status
									? "bg-primary-5 text-dark-1"
									: "text-dark-1"
							} 
              ${index === 0 ? "rounded-l-lg firstRound" : ""} 
              ${index === arr.length - 1 ? "rounded-r-lg lastRound" : ""}`}
							onClick={() => handleStatusFilter(status)}>
							{status}
						</p>
					))}
				</div>
				<Input
					className="bg-[#F9FAFB] border-[#E8E8E8] border-[1px] w-full input "
					placeholder="Search course..."
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
				/>

				<div className="w-[250px]">
					<DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
				</div>
			</div>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="bg-primary-3">
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id} className="bg-primary-3 text-xs">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody className="bg-white">
					{rows.length > 0 ? (
						rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-left text-xs text-primary-6">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex items-center justify-between bg-white rounded-lg py-3 px-2 border-t-[1px] border-gray-300 mt-2">
				<div className="flex-1 text-xs text-primary-6 text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex items-center space-x-10 lg:space-x-10 gap-3">
					<div className="flex items-center space-x-4 gap-2">
						<p className="text-xs text-primary-6 font-medium">Rows per page</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}>
							<SelectTrigger className="h-8 w-[70px] bg-white z-10">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top" className="bg-white">
								{[5, 10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-[100px] items-center justify-center font-medium text-xs text-primary-6">
						{table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()} pages
					</div>
					<div className="flex items-center space-x-5 gap-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}>
							<span className="sr-only">Go to next page</span>
							<ChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
