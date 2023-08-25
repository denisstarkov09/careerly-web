import React from "react";
import { useParams } from "react-router-dom";
import Input from "../../components/Input/Input";
import ImageUploader from "react-image-upload";
import "react-image-upload/dist/index.css";
function getImageFileObject(imageFile: any) {
    console.log({ imageFile });
}

function runAfterImageDelete(file: any) {
    console.log({ file });
}
const Profile = () => {
    const { view } = useParams();
    return (
        <div>
            <h1 className="capitalize text-2xl font-bold mb-8">{view}</h1>
            <div className="flex flex-col space-y-2">
                <Input label="Name" onChange={console.log} />
                <Input label="Password" onChange={console.log} />
                <ImageUploader
                    onFileAdded={(img) => getImageFileObject(img)}
                    onFileRemoved={(img) => runAfterImageDelete(img)}
                />
            </div>
        </div>
    );
};

export default Profile;
