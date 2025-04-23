import useWindowSize from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";


function PageNavigation({ limit, total, setFilters, filters, totalPages, page }) {

	const { isMobileScreen } = useWindowSize();

	return (
		<div className="flex items-center w-full flex-col gap-6 justify-between py-2 border-t mt-auto">

			<div className="flex items-center w-full justify-between py-4 space-x-4">
				<p className="text-sm text-muted-foreground">
					{page > 0 && total > 0
						? `${(page - 1) * limit + 1}-${Math.min(
							page * limit,
							total
						)} out of ${total} results`
						: `0-0 out of ${total} results`}
				</p>


				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted-foreground">
						Rows per page:
					</span>
					<select
						className="h-8 rounded-md border border-input px-2"
						value={limit}
						onChange={(e) =>
							setFilters({
								...filters,
								limit: Number(e.target.value),
								page: 1,
							})
						}
					>
						<option value={10}>10</option>
						<option value={15}>15</option>
						<option value={20}>20</option>
					</select>
				</div>
			</div>
			<div className="flex w-full justify-between">

				<div className="flex items-center space-x-1">
					<span className="text-sm">
						Page {page} of {totalPages}
					</span>
				</div>

				<div className="flex items-center space-x-1 justify-between">
					<Button
						variant="outline"
						size="default"
						onClick={() =>
							page > 1 && setFilters({ ...filters, page: page - 1 })
						}
						disabled={true}
					>

						<ChevronLeft />
						{!isMobileScreen && 'Previous'}
					</Button>
					<Button
						variant="outline"
						size="default"
						onClick={() =>
							page < totalPages && setFilters({ ...filters, page: page + 1 })
						}
						disabled={page >= totalPages}
					>
						{!isMobileScreen && 'Next'}
						<ChevronRight />
					</Button>


				</div>

			</div>

		</div>
	)
}

export default PageNavigation
