import React, { useState, useEffect, useContext, useCallback } from "react";
import {
    Upload,
    Button,
    Progress,
    Avatar as AntdAvatar,
    message,
    UploadProps,
} from "antd";
import { RcFile } from "antd/es/upload";
import CreatableSelect from "react-select/creatable";
import { Modal, Box, Skeleton, Slider } from "@mui/material";
import Input from "../Input/Input";
import { Entry, TLabel, TPerson } from "../../constant/types";
import { AuthContext } from "../../Auth";
import { getBase64, removeDuplicates } from "../../utils/utils";

import {
    addDoc,
    collection,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

import EmptyImage from "../../assets/download.png";
import { track } from "../../Segment";
import moment from "moment";

const EntryModal = ({
    isModal,
    dataLoading,
    entryData,
    person,
    mode,
    onAction,
    onClose,
}: {
    isModal?: boolean;
    dataLoading?: boolean;
    entryData?: Entry;
    person?: string;
    mode?: "home" | "timeline" | "edit";
    onAction?: (type: "add" | "edit" | "delete", entry: Entry) => void;
    onClose: () => void;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSave, setSave] = useState<boolean>(false);
    const [imageURL, setImageURL] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [rating, setRating] = useState<number>(0);
    const [labels, setLabels] = useState<TLabel[]>([]);
    const [labeloptions, setLabelValues] = useState<TLabel[]>([]);
    const [labelOptions, setLabelOptions] = useState<TLabel[]>();
    const [persons, setPersons] = useState<Array<string>>([]);
    const [personoptions, setPersonValues] = useState<any[]>();
    const [personOptions, setPersonOptions] = useState<TPerson[]>();
    const [initialLabels, setInitialLabels] = useState<TLabel[]>();
    const [percent, setPercent] = useState<number>(0);
    const { currentUser } = useContext(AuthContext);
    const [messageApi, contextHolder] = message.useMessage();

    const user = currentUser?.uid;
    const docLabelRef: DocumentReference = doc(db, "labels", user as string);
    const docPersonRef: DocumentReference = doc(db, "persons", user as string);
    const style = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 430,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
    };

    const loadOptions = useCallback(async () => {
        try {
            const user = currentUser?.uid;
            const docLabelRef: DocumentReference = doc(
                db,
                "labels",
                user as string
            );
            const docPersonRef: DocumentReference = doc(
                db,
                "persons",
                user as string
            );
            const labelData: DocumentData = await getDoc(docLabelRef);
            labelData.data() &&
                setLabelOptions(JSON.parse(labelData.data().labels));

            const personsData: DocumentData = await getDoc(docPersonRef);
            personsData.data() &&
                setPersonOptions(JSON.parse(personsData.data().persons));
        } catch (error) {
            console.log("loadoption Modal", error);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!labelOptions?.length && !personOptions?.length) {
            loadOptions();
        }
    }, [loadOptions, labelOptions, personOptions]);

    useEffect(() => {
        initialLabels && setLabels(initialLabels);
    }, [initialLabels]);

    useEffect(() => {
        if (labelOptions && labelOptions.length !== 0) {
            let temp: any = [];

            Object.keys(labelOptions).forEach((index) => {
                temp = [...temp, createOption(labelOptions[Number(index)])];
            });

            temp = removeDuplicates(temp);
            setLabelValues(temp);
        }
    }, [labelOptions]);

    useEffect(() => {
        if (personOptions && personOptions.length !== 0) {
            let temp: any = [];

            Object.keys(personOptions).forEach((index) => {
                temp = [
                    ...temp,
                    createPersonOption(personOptions[Number(index)]),
                ];
            });

            temp = removeDuplicates(temp);
            setPersonValues(temp);
        }
    }, [personOptions]);

    useEffect(() => {
        setIsOpen(isModal as boolean);
    }, [isModal]);

    useEffect(() => {
        if (entryData) {
            setInitialLabels(entryData?.labels);
            setImageURL(entryData.imageUrl);
            setTitle(entryData.title);
            setDescription(entryData.description);
            setRating(entryData.rating);
            setLabels(entryData?.labels as TLabel[]);
            setPersons(entryData.person as any);
        }
    }, [entryData]);

    useEffect(() => {
        let total = 0;
        total += imageURL ? 40 : 0;
        total += title ? 10 : 0;
        total += description ? 10 : 0;
        total += rating !== 0 ? 10 : 0;
        total += labels.length ? 10 : 0;
        total += persons ? 20 : 0;
        setPercent(total);
    }, [imageURL, title, description, rating, labels, persons]);

    // create label options for creatable select
    const createOption = (option: any) => ({
        value: option.text ? option.text : option,
        label: option.text ? option.text : option,
    });

    // create person options for creatable select
    const createPersonOption = (option: any) => ({
        value: option.name,
        label: (
            <div className="flex flex-row align-center gap-x-2">
                <AntdAvatar
                    size={24}
                    className="flex flex-row justify-center align-center"
                >
                    <span>{option.name[0]}</span>
                </AntdAvatar>
                <p>{option.name}</p>
            </div>
        ),
    });

    //create labels to save on firestore
    const createLabel = (label: any) => ({
        text: label.value,
        color: "#f2f2f2",
        userID: currentUser?.uid,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
    });

    //create persons to save on firestore
    const createPerson = (person: any) => ({
        name: person.value,
        userID: currentUser?.uid,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
    });

    const saveLabels = async (labels: any[]) => {
        try {
            let newLabels: any = labelOptions ? labelOptions : [];
            Object.keys(labels).forEach((index) => {
                if (labels[Number(index)].__isNew__) {
                    newLabels = [
                        ...newLabels,
                        createLabel(labels[Number(index)]),
                    ];
                }
            });

            await setDoc(docLabelRef, {
                labels: JSON.stringify(newLabels),
            });
        } catch (error) {
            console.log("savelabels Modal", error);
        }
    };

    const savePersons = async (persons: any) => {
        try {
            let newPersons: any = personOptions ? personOptions : [];

            Object.keys(persons).forEach((index) => {
                if (persons[Number(index)].__isNew__) {
                    newPersons = [
                        ...newPersons,
                        createPerson(persons[Number(index)]),
                    ];
                }
            });

            await setDoc(docPersonRef, {
                persons: JSON.stringify(newPersons),
            });
        } catch (error) {
            console.log("savePersons Modal", error);
        }
    };

    const handleClose = () => {
        if (entryData) {
            setImageURL(entryData.imageUrl);
            setTitle(entryData.title);
            setDescription(entryData.description);
            setRating(entryData.rating);
            setLabels(entryData?.labels as TLabel[]);
            setPersons(entryData.person as any);
        } else {
            setImageURL("");
            setTitle("");
            setDescription("");
            setRating(0);
            setLabels([]);
        }
        onClose();
    };

    const handleChange: UploadProps["onChange"] = async ({
        fileList: newFileList,
    }) => {
        try {
            const index = (newFileList.length - 1) | 0;
            const allowedTypes = "image/png, image/gif, image/jpeg";
            const { type } = newFileList[index];
            if (type && allowedTypes.includes(type)) {
                const data = await getBase64(
                    newFileList[index].originFileObj as RcFile
                );
                setImageURL(data);
            } else {
                messageApi.error(
                    "File type not accepted, please select an image"
                );
                console.log("please upload only images");
            }
        } catch (error) {
            console.log("image upload", error);
        }
    };

    const saveEntry = async () => {
        const now = moment().toISOString();
        setSave(true);
        try {
            if (percent === 100) {
                const newEntry = {
                    title,
                    description,
                    rating,
                    label: JSON.stringify(labels),
                    person: person
                        ? JSON.stringify([{ value: person }])
                        : JSON.stringify([persons[0]]),
                    imageUrl: imageURL,
                    userID: currentUser?.uid,
                    createdAt: now.split(",")[0],
                    updatedAt: new Date().toLocaleString(),
                };
                const data = await addDoc(
                    collection(db, "timelineEntry"),
                    newEntry
                );
                await saveLabels(labels);
                await savePersons(persons);

                const addEntry = {
                    title,
                    labels: labels,
                    imageUrl: imageURL,
                    rating,
                    description,
                    docID: data.id,
                    isDeleted: false,
                    person: person,
                    label: JSON.stringify(labels),
                    createdAt: now,
                    userID: currentUser?.uid,
                };

                onAction && onAction("add", addEntry as any);
                messageApi.success("Timeline Saved!");
                track("Entry Added", {
                    rating: "" + rating,
                    title,
                    description,
                    email: currentUser?.email || "",
                });
                handleClose();
            } else {
                messageApi.warning("Please complete all fields to save");
            }
        } catch (error) {
            console.log("save error", error);
        }
        setSave(false);
    };

    const updateEntry = async () => {
        setSave(true);
        try {
            const docID = entryData?.docID;
            const now = new Date().toLocaleString().toString();
            if (docID) {
                const docRef = doc(db, "timelineEntry", docID);
                // todo: need to make the createdAt date be an iso string format like default
                const updatedEntry = {
                    imageUrl: imageURL,
                    title,
                    description,
                    rating,
                    label: JSON.stringify(labels),
                    person: JSON.stringify([
                        { label: persons, value: persons },
                    ]),
                    userID: currentUser?.uid,
                    updatedAt: new Date().toLocaleString(),
                };
                await updateDoc(docRef, updatedEntry);
                await saveLabels(labels);
                await savePersons(persons);

                const editEntry = {
                    title,
                    labels: labels,
                    imageUrl: imageURL,
                    rating,
                    description,
                    docID: docID,
                    isDeleted: false,
                    person: person,
                    label: JSON.stringify(labels),
                    createdAt: now.split(",")[0],
                    userID: currentUser?.uid,
                };

                onAction && onAction("edit", editEntry as any);
                track("Entry Updated", {
                    rating: "" + rating,
                    title,
                    description,
                    documentId: docID,
                    email: currentUser?.email || "",
                });
                onClose();
                messageApi.success("Updated Entry!");
            }
        } catch (error) {
            messageApi.error("Failed to update entry");
            console.log("error saveEntry", error);
        }
        setSave(false);
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            {dataLoading ? (
                <Box sx={style} className="grid gap-y-4">
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={40}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={232}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={50}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={50}
                    />
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={50}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={50}
                    />
                    <div className="flex flex-row gap-x-3">
                        <Skeleton
                            variant="rectangular"
                            width={"85%"}
                            height={40}
                        />
                        <Skeleton
                            variant="circular"
                            width={"40px"}
                            height={40}
                        />
                    </div>
                </Box>
            ) : (
                <Box sx={style} className="grid gap-y-4 rounded">
                    {contextHolder}
                    <Upload
                        beforeUpload={() => {
                            return false;
                        }}
                        showUploadList={false}
                        onChange={handleChange}
                        className="upload-btn w-full"
                    >
                        <Button
                            className="btn-upload bg-primary w-[366px] h-[40px]"
                            type="primary"
                        >
                            Upload File
                        </Button>
                    </Upload>
                    <img
                        src={imageURL ? imageURL : EmptyImage}
                        alt="careerly report"
                        className="w-[100%] h-[232px] rounded"
                    />
                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            setTitle(e.currentTarget.value);
                        }}
                    />
                    <Input
                        placeholder="Describe the screenshot"
                        value={description}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            setDescription(e.currentTarget.value);
                        }}
                    />
                    <div>
                        <p className="text-sm text-[#4356E0] font-[700] ml-1">
                            Performance Rating
                        </p>
                        <Slider
                            aria-label="Progress"
                            valueLabelDisplay="auto"
                            min={0}
                            max={10}
                            value={rating}
                            onChange={(e: Event, value: number | number[]) => {
                                setRating(value as number);
                            }}
                        />
                    </div>
                    <CreatableSelect
                        isClearable={false}
                        isMulti
                        onChange={(option: any) => setLabels(option)}
                        value={labels}
                        options={labeloptions as any}
                        placeholder="Add label(s)"
                    />
                    {mode !== "home" ? (
                        <Input
                            placeholder="Add person(s)"
                            value={person}
                            onChange={() => { }}
                            disabled={true}
                        />
                    ) : (
                        <CreatableSelect
                            isClearable={false}
                            isMulti
                            onChange={(option: any) => setPersons(option)}
                            placeholder="Add user(s)"
                            options={personoptions as any}
                        />
                    )}

                    <div className="flex flex-row gap-x-3">
                        <Button
                            className="bg-primary w-[85%] h-[40px]"
                            type="primary"
                            loading={isSave}
                            onClick={mode === "edit" ? updateEntry : saveEntry}
                        >
                            {mode === "edit" ? "Update" : "Save"}
                        </Button>
                        <Progress
                            className="progress-data"
                            type="circle"
                            percent={percent}
                            size={40}
                        />
                    </div>
                </Box>
            )}
        </Modal>
    );
};
export default EntryModal;
