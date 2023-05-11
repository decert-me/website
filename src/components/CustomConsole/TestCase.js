import { Input } from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

export default function TestCase(params) {
    
    const { input } = params;
    const [value, setValue] = useState(input);

    return (
        <div className="case">
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Controlled autosize"
                autoSize={{
                    minRows: 5,
                }}
            />
        </div>
    )
}