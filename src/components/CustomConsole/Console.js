import { useUpdateEffect } from "ahooks";



export default function Console(props) {

    const { logs, className } = props;
    
    useUpdateEffect(() => {
        var element = document.querySelector(".console");
        element.scrollTop = element.scrollHeight;
    },[logs])

    return (
        <div className={`console custom-scroll ${className}`}>
            <ul>
                {
                    logs.map((e, i) => 
                        <li key={i} style={{marginBottom: "10px", whiteSpace: "pre-wrap"}}>
                            {e}
                        </li>    
                    )
                }
            </ul>
        </div>
    )
}