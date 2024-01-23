import HomeContent from "./components/HomeContent";
import HomeNotice from "./components/HomeNotice";



export default function Index(params) {
    

    return (
        <div className="Home">
            <div className="custom-bg-round"></div>
            <div className="main">
                <HomeNotice />
                <HomeContent />
            </div>
        </div>
    )
}