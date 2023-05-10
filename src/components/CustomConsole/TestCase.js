import { Input } from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

export default function TestCase(params) {
    
    const [value, setValue] = useState('');

    return (
        <div className="case">
            <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Controlled autosize"
                autoSize={{
                    minRows: 3,
                }}
            />
        </div>
    )
}