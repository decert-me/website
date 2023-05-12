import { Input } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
const { TextArea } = Input;

function TestCase(props, ref) {
    
    const { input, changeCodeObj, className } = props;
    const [value, setValue] = useState("");

    useImperativeHandle(ref, () => ({
        changeValue
    }))

    function changeValue(params) {
        changeCodeObj(params, "input")
        setValue(params)
    }

    useEffect(() => {
        changeValue(input);
    },[])

    return (
        <div className={`case ${className}`}>
            <TextArea
                value={value}
                onChange={e => changeValue(e.target.value)}
                autoSize={{
                    minRows: 5,
                }}
            />
        </div>
    )
}
export default forwardRef(TestCase)