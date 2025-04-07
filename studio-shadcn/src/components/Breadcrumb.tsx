import React from 'react'

function Breadcrumb({ path, page }) {
	return (
		<div>
			<h3 className="text-[#666] text-[10px] leading-normal font-normal">{path}</h3>
			<h1 className='text-black text-xl font-semibold '> {page}</h1>
		</div>
	)
}

export default Breadcrumb
