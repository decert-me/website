import { createFromIconfontCN } from '@ant-design/icons';
const IconFont = createFromIconfontCN({
  scriptUrl: [
    "//at.alicdn.com/t/c/font_4015269_5ws27jot0xh.js"
  ],
});


export default function CustomIcon(props) {
    
    const { type } = props;

    return(
        <IconFont type={type} />
    )
}