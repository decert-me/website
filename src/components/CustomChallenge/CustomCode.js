import { Editor } from '@bytemd/react'
import { useEffect } from "react";
import MonacoEditor from '../MonacoEditor';





export default function CustomCode(props) {

    const { question } = props;

    useEffect(() => {
        console.log(question);
    },[])

    return (
        <div className="CustomCode">
            <div className="code-desc">
                <p className="code-title">{question.title}</p>
                <div dangerouslySetInnerHTML={{__html: question.description}}>
                </div>
            </div>
            <div className="code-out">
                <MonacoEditor
                    value={}
                    onChange={}
                    language={}
                />
            </div>
        </div>
    )   
}