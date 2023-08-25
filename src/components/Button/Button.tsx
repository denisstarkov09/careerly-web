import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles"

const AddButton = styled(Button)({
    marginLeft: '12px',
    backgroundColor: 'rgb(67, 86, 224)',
    '&:hover': {
        backgroundColor: 'rgba(67, 86, 224,.9)',
    }
});

export default AddButton;

