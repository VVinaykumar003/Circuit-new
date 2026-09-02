import type { AdminEmployee } from "@/type/index";

interface Props {
  employees?: AdminEmployee[];
}

const EmployeeAttendanceList = ({
  employees = [],
}: Props) => {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100">
      <div className="border-b border-base-300 p-5">
        <h2 className="text-lg font-semibold">
          Today's Employees
        </h2>

        <p className="text-sm text-base-content/60">
          Employees currently marked present or pending approval
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th>Check In</th>
              <th>Status</th>
              <th>Approval</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>
                  <div className="flex items-center gap-3">
                    {employee.imageUrl ? (
                      <img
                        src={employee.imageUrl }
                        alt={employee.employeeName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {employee.employeeName
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-medium">
                        {employee.employeeName}
                      </div>

                      <div className="text-xs text-base-content/50">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  {employee.designation || "-"}
                </td>

                <td>
                  {employee.checkIn
                    ? new Date(
                        employee.checkIn
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>

                <td>
                  {employee.status === "PRESENT" ? (
                    <span className="badge badge-success gap-1">
                      Present
                    </span>
                  ) : (
                    <span className="badge badge-warning gap-1">
                      Pending
                    </span>
                  )}
                </td>

                <td>
                  {employee.approval === "Pending" ? (
                    <span className="badge badge-warning">
                      Pending Approval
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendanceList;