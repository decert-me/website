import { Input } from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

export default function TestCase(params) {
    
    const { input, changeCodeObj } = params;
    const [value, setValue] = useState(input);


    function changeValue(params) {
        console.log("params ===>", params);
        changeCodeObj(params.target.value, "input")
        setValue(params.target.value)
    }

    return (
        <div className="case">
            <TextArea
                value={value}
                onChange={changeValue}
                autoSize={{
                    minRows: 5,
                }}
            />
        </div>
    )
}