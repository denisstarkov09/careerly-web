import { RcFile } from "antd/es/upload";
import { OptionsType } from "../constant/types";

export const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export const removeDuplicates = (options: OptionsType) => {
    return [...new Map(options.map((option) => [option.value, option])).values()]
}

export const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
}