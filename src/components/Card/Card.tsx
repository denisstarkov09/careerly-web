import React, { useState, useEffect, useContext } from "react";
import { Entry } from "../../constant/types";
import Label from "../Label/Label";
import GoodPerformanceIndicator from "../../assets/performance_indicator_good.png";
import BadPerformanceIndicator from "../../assets/performance_indicator_bad.png";
import { FormOutlined, DeleteOutlined } from "@ant-design/icons";
import EntryModal from "../Modal/Modal";
import { PersonContext } from "../../Pages/Timeline";
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { track } from "../../Segment";
import { AuthContext } from "../../Auth";

const { confirm } = Modal;

function Card(props: { entry: Entry; className: string }) {
    const [newEntry, setNewEntry] = useState<any>();
    const [isEdit, setEdit] = useState<boolean>(false);
    const { className } = props;
    const { docID } = props.entry
    const { person } = useContext(PersonContext);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (props.entry) {
            const data = props.entry;
            setNewEntry(data)
        }
    }, [props])

    const addDeletedMark = async () => {
        try {
            if (docID) {
                const docRef = doc(db, "timelineEntry", docID);
                const updatedEntry = {
                    updatedAt: new Date().toISOString(),
                    isDeleted: true,
                };
                await updateDoc(docRef, updatedEntry);
                window.location.reload()
            }
        } catch (error) {
            console.log("addDeletedMark", error);
        }
    };

    const softDeleteEntry = () => {
        confirm({
            title: "Are you sure delete this entry?",
            icon: <ExclamationCircleFilled />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                addDeletedMark();
                track("Entry Deleted", {
                    rating: "" + newEntry?.rating,
                    title: newEntry?.title,
                    description: newEntry?.description,
                    documentId: docID,
                    email: currentUser?.email || "",
                });
            },
            onCancel() { },
        });
    };

    const editAction = (type: 'add' | 'edit' | 'delete', updatedEntry: Entry) => {
        switch (type) {
            case 'edit':
                setNewEntry(updatedEntry)
                break;
            default:
                break;
        }
    }

    return (
        <>
            <div
                className={
                    "flex md:hidden flex-col shadow-md border rounded-md bg-white " +
                    className
                }
            >
                <img src={newEntry?.imageUrl} className="rounded max-w-96" alt={newEntry?.title} />
                <div className="mr-4 font-semibold text-lg p-4">{newEntry?.title}</div>
                <hr />
                <div className="px-4 py-5">{newEntry?.description}</div>
                <hr />
                <div className="flex p-4 justify-between">
                    <span className="space-x-2 flex">
                        {newEntry?.labels.map((l:any) => (
                            <Label key={l.value} label={l} />
                        ))}
                    </span>
                    <div className="text-sm mx-4">
                        {newEntry?.rating < 5 ? "Low" : "High"}
                    </div>
                </div>
            </div>

            <div
                className={
                    "hidden md:flex flex-col shadow-md border rounded-md bg-white " +
                    className
                }
            >
                <div className="flex flex-row items-center justify-between py-5 px-6 border-b">
                    <span className="flex">
                        <div className="mr-4 font-semibold text-md">
                            {newEntry?.title}
                        </div>
                        <div className="flex space-x-2">
                            {newEntry?.labels.map((l:any) => (
                                <Label key={l.value} label={l} />
                            ))}
                        </div>
                    </span>
                    <div className="flex flex-row mx-4 gap-x-[10px]">
                        <img
                            src={
                                newEntry?.rating < 5
                                    ? BadPerformanceIndicator
                                    : GoodPerformanceIndicator
                            }
                            width={22}
                            height={22}
                            alt="Performance Indicator"
                        />
                        <div className="border-l-2 border-[#D4D4D4]	" />
                        <FormOutlined
                            className="mt-[3px]"
                            onClick={() => setEdit(true)}
                        />
                        <DeleteOutlined
                            className="mt-[3px]"
                            onClick={softDeleteEntry}
                        />
                        <EntryModal
                            isModal={isEdit}
                            entryData={props.entry}
                            person={person ? person : ""}
                            mode="edit"
                            onAction={editAction}
                            onClose={() => setEdit(false)}
                        />
                    </div>
                </div>
                <div className="flex flex-row">
                    <div className="border-r p-5">
                        <img
                            src={newEntry?.imageUrl}
                            className="rounded w-96 h-[190px]"
                            alt={newEntry?.title}
                        />
                    </div>
                    <div className="px-4 py-5">{newEntry?.description}</div>
                </div>
            </div>
        </>
    );
}

export default Card;
