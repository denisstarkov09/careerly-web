import React, { useState, useEffect, useContext, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Input, Button, Form, Avatar as AntdAvatar } from "antd";
import { Modal, Box } from "@mui/material";
import { render } from '@react-email/render';
import Email from "../Email/Email";
import { AuthContext } from "../../Auth";
import { isValidEmail, removeDuplicates } from "../../utils/utils";
import { DeleteOutlined, MailOutlined } from "@ant-design/icons"

const ShareModal = ({
    isModal,
    onClose,
}: {
    isModal: boolean,
    onClose: () => void
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isInvite, setIsInvite] = useState<boolean>(false)
    const [isDisable, setIsDisable] = useState<boolean>(false)
    const [inviteEmail, setInviteEmail] = useState<string>('')
    const [invitedPersons, setInvitedPerson] = useState<any>([])
    const { currentUser } = useContext(AuthContext)
    const { pathname } = useLocation()
    const { person } = useParams()
    const [form] = Form.useForm()
    const [options, setOptions] = useState<any>()

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

    const sharedPerson = useCallback(async () => {
        console.log('sharedPerson')
        const ref = collection(db, "shared")
        console.log('person >>>', person)
        const q = query(ref, where("By", "==", currentUser?.uid), where("EntiryShared", "==", person))
        const querySnapshot = await getDocs(q);
        const temp = []
        for (const doc of querySnapshot.docs) {
            console.log('doc.data()', doc.data())
            temp.push({ name: doc.data().To })
        }
        const sharedUserIDs = [...new Map(temp.map((option) => [option.name, option])).values()]
        console.log("sharedUserIDs", sharedUserIDs)
        setOptions(sharedUserIDs)
    }, [person, currentUser])

    useEffect(() => {
        setOptions([{ name: 'David user' }, { name: 'Tween user' }, { name: 'Jest user' }])
    }, [])

    useEffect(() => {
        if (isOpen) {
            sharedPerson()
        }
    }, [isOpen, sharedPerson])

    const removeSharedPerson = useCallback(async (To: string) => {
        const ref = collection(db, "shared")
        const q = query(ref, where("By", "==", currentUser?.uid), where("To", "==", To), where("EntiryShared", "==", person))
        const snapshot = await getDocs(q)
        console.log('snapshot', snapshot)
    },[currentUser, person])

    const createPersonOption = useCallback((option: any) => ({
        value: option.name,
        label: (
            <div className="flex flex-row align-center gap-x-2">
                <AntdAvatar
                    size={24}
                    className=""
                >
                    <span className="self-center">{option.name[0]}</span>
                </AntdAvatar>
                <p className="w-[50%]">{option.name}</p>
                <DeleteOutlined className="self-center text-[20px] ml-16" onClick={() => removeSharedPerson(option.name)} />
            </div>
        ),
    }), [removeSharedPerson]);

    useEffect(() => {
        if (options) {
            let temp: any = [];
            Object.keys(options).forEach((index) => {
                temp = [
                    ...temp,
                    createPersonOption(options[Number(index)]),
                ];
            });

            temp = removeDuplicates(temp);
            setInvitedPerson(temp);
        }
    }, [options, createPersonOption]);

    useEffect(() => {
        setIsOpen(isModal)
    }, [isModal])

    useEffect(() => {
        isValidEmail(inviteEmail) ? setIsDisable(false) : setIsDisable(true)
    }, [inviteEmail])

    const handleClose = () => {
        setIsOpen(true)
        onClose()
    }

    const findPerson = async (email: string) => {
        const ref = collection(db, "users");
        const q = query(ref, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        const toPerson: any = []
        querySnapshot.forEach((doc) => {
            console.log('doc>>>>', doc)
            toPerson.push(doc.id)
        })
        return toPerson
    }

    const invitePerson = async () => {
        setIsInvite(true)
        try {
            const validEmail = isValidEmail(inviteEmail)
            if (validEmail) {
                const personId: any = await findPerson(inviteEmail)
                const personalInfo = currentUser?.providerData[0]

                const username = inviteEmail.split('@')[0]
                const invitedByUsername = personalInfo?.displayName
                const invitedByEmail = personalInfo?.email
                const inviteLink = `http://localhost:3000${pathname}`
                const emailHtml = render(<Email
                    username={username}
                    nameOfPersonOnTimeline={person}
                    invitedByUsername={invitedByUsername as string}
                    invitedByEmail={invitedByEmail as string}
                    inviteLink={inviteLink}
                />)

                const response = await fetch("http://localhost:5000/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        emailHtml,
                        emailTo: inviteEmail
                    }),
                });

                if (response.ok) {
                    const shareEntry = {
                        By: currentUser?.uid,
                        To: personId ? personId[0] : '',
                        Type: 'timeline',
                        EntiryShared: person,
                        Deleted: false,
                        Claimed: false,
                        CreatedAt: new Date().toLocaleString(),
                        ClaimedAt: ''
                    }

                    const data = await addDoc(collection(db, "shared"), shareEntry);
                    console.log('data>>>>>', data)
                }
            }
        } catch (error) {
            console.log('Error on Invite Person', error)
        }
        setIsInvite(false)
    }
    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Form form={form} className="flex flex-row w-full mb-4">
                    <Form.Item
                        className="w-[70%]"
                        name="email"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input E-mail!',
                            },
                        ]}
                    >
                        <Input
                            className="rounded-r-none h-[40px]"
                            prefix={<MailOutlined className="text-[rgba(0,0,0,0.25)]" />}
                            placeholder="careerly@gmail.com"
                            onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                setInviteEmail(e.currentTarget.value);
                            }}
                        />
                    </Form.Item>
                    <Form.Item className="w-[30%]">
                        <Button
                            className="bg-primary rounded-l-none h-[40px] border"
                            type="primary"
                            disabled={isDisable}
                            htmlType="submit"
                            loading={isInvite}
                            onClick={invitePerson}
                        >
                            Invite Person
                        </Button>
                    </Form.Item>
                </Form>
                <CreatableSelect
                    isClearable={false}
                    isMulti
                    // onChange={(option: any) => setLabels(option)}
                    // value={labels}
                    options={invitedPersons as any}
                    placeholder="Invited Persons"
                />
            </Box>
        </Modal>
    )
}

export default ShareModal;