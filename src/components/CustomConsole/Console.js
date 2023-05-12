import { useUpdateEffect } from "ahooks";



export default function Console(props) {

    const { logs } = props;
    
    useUpdateEffect(() => {
        var element = document.querySelector(".console");
        element.scrollTop = element.scrollHeight;
    },[logs])

    return (
        <div className="console custom-scroll">
            <ul>
                {
                    logs.map((e, i) => 
                        <li key={i} style={{marginBottom: "10px"}}>
                            {e}
                        </li>    
                    )
                }
            </ul>
        </div>
    )
}