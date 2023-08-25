import { User } from "firebase/auth";
import { Moment } from "moment";

export type TLabel = {
    value: string;
    color: string;
};

export type TPerson = {
    value: string;
    color: string;
};

export type Entry = {
    title: string;
    labels: TLabel[];
    imageUrl: string;
    rating: number;
    description: string;
    docID: string;
    isDeleted: boolean;
    date: Moment;
    sharedBy: string,
    person: string;
    createdAt: string;
};

export type EntryData = {
    imageURL: string,
    title: string,
    description: string,
    rating: number,
    labels: [{
        value: string,
        label: any
    }],
    person: [{
        value: string,
        label: any
    }] | string
}

export type AuthContextType = {
    currentUser: User | null;
    isLoggedIn: boolean | null;
};

export type PersonContextType = {
    person: string | null;
}

export type OptionsType = [{
    value: string,
    label: string
}]