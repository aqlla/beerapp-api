import IData from "./IData";

export default interface IBeerData extends IData<number> {
    name: string;
    style: string;
    breweryId: string;
    breweryName: string;
    abv: number;
    ibu: number;
    sizes: number[];
}
