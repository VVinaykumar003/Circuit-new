import React, { forwardRef } from "react";
import Input, { type InputProps } from "./Input";
import { MdCalendarToday } from "react-icons/md";

export interface DatePickerProps extends Omit<InputProps, "type"> {
  type?: "date" | "datetime-local" | "month" | "time";
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ type = "date", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type={type}
        leftIcon={<MdCalendarToday size={16} />}
        {...props}
      />
    );
  }
);

DatePicker.displayName = "DatePicker";
export default DatePicker;
