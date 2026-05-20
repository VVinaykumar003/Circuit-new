// import React from 'react'
// import { FaAdjust } from 'react-icons/fa'

const LeaveFilters = () => {
  return (
    <div className='w-full h-25 rounded-2xl bg-amber-300 '>
      <div className='flex flex-col justify-items-start  p-5'>
        <input className='w-80 h-10 bg-white border-2 border-black rounded-2xl relative text-black p-2' 
        type="text"
        placeholder='Search by name'
        />
        {/* <i className='absolute flex items-center pl-30 p-3'> <FaAdjust/> </i> */}
      </div>
      
    </div>
  )
}

export default LeaveFilters
