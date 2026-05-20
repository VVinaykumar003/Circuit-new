import { MdChevronLeft, MdChevronRight } from "react-icons/md";

import type { Member } from "@/type/member";
interface BirthdayCarouselProps {
  employees: Member[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const BirthdayCarousel = ({
  employees,
  currentIndex,
  setCurrentIndex,
}: BirthdayCarouselProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
      <p className="text-sm text-gray-500 text-center mb-6">
        🎂 BIRTHDAYS
      </p>

      <div className="relative w-full h-[300px] flex items-center justify-center">
        {employees.map((emp, index) => {
          const isActive = index === currentIndex;
          const isPrev =
            index ===
            (currentIndex === 0
              ? employees.length - 1
              : currentIndex - 1);
          const isNext =
            index ===
            (currentIndex === employees.length - 1
              ? 0
              : currentIndex + 1);

          return (
            <div
              key={emp.id}
              className={`
                absolute w-64 h-72 bg-white rounded-2xl shadow-lg p-6
                flex flex-col items-center justify-center text-center
                transition-all duration-700 ease-in-out
                ${
                  isActive
                    ? "z-30 scale-100 opacity-100"
                    : isPrev
                    ? "z-20 -translate-x-40 scale-90 opacity-60"
                    : isNext
                    ? "z-20 translate-x-40 scale-90 opacity-60"
                    : "opacity-0 scale-75"
                }
              `}
            >
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-semibold mb-4">
                {emp.name.charAt(0)}
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                {emp.name}
              </h3>

              <p className="text-sm text-gray-500 mb-3">
                {emp.role}
              </p>

              <h2 className="text-xl font-bold text-gray-900">
                🎉 Happy Birthday!
              </h2>

              <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition">
                Send Greetings
              </button>
            </div>
          );
        })}

        {employees.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex(
                  currentIndex === 0
                    ? employees.length - 1
                    : currentIndex - 1
                )
              }
              className="absolute left-8 bg-white shadow-md w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            >
              <MdChevronLeft size={24} className="text-gray-700" />
            </button>

            <button
              onClick={() =>
                setCurrentIndex(
                  currentIndex === employees.length - 1
                    ? 0
                    : currentIndex + 1
                )
              }
              className="absolute right-8 bg-white shadow-md w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            >
              <MdChevronRight size={24} className="text-gray-700" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BirthdayCarousel;