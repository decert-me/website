import { useUpdateEffect } from 'ahooks';
import { Input } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
const { TextArea } = Input;

function TestCase(props, ref) {
    
    const { input, changeCodeObj, className } = props;
    const [value, setValue] = useState("");
    let [type, setType] = useState("object");

    useImperativeHandle(ref, () => ({
        changeValue
    }))

    function changeValue(params, isCode) {
        changeCodeObj(params, "input")
        setValue(params)
        type = isCode ? "object" : "string";
        setType(type);
    }

    useEffect(() => {
        const type = typeof input === "object" ? true : false
        changeValue(typeof input === "object" ? input[0].code : input, type);
    },[])

    return (
        <div className={`case ${className}`}>
            <TextArea
                className='custom-scroll'
                value={value}
                onChange={e => changeValue(e.target.value)}
                autoSize={{
                    minRows: 5,
                }}
                style={{
                    maxHeight: "100%"
                }}
                disabled={type === "object"}
            />
        </div>
    )
}
export default forwardRef(TestCase)