export interface TextFieldProps {
  type?:
    | "date"
    | "datetime-local"
    | "email"
    | "hidden"
    | "month"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";
  value: string | number;
  onValueChange: (value: string | number) => void;
}
