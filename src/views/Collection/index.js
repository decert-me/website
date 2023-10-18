import { useParams } from "react-router-dom"


export default function Collection(params) {
    
    const { id } = useParams();


    return (
        <div className="Collection">
            <h1>{id}</h1>
        </div>
    )
}