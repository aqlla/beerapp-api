
export default interface ISqlColumn {
    alias?: string;
    name: string;
    table: string;
    type: "number" | "string" | "date";
}
