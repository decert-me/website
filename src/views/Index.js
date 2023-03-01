import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "@/assets/styles/view-style/index.scss"

export default function Index(params) {
    
    const navigateTo = useNavigate();

    return (
        <div className="Home ">
            <div className="main">
                <div className="main-center">
                <div className="weight-info">
                    <h3>Decert.me</h3>
                    {/* describe */}
                    <div className="describe">
                    <p>You are what you build.</p>
                    </div>
                    {/* text */}
                    <div className="text">
                    <p>Decentralized skills learning and certification platform</p>
                    </div>
                    {/* Explore challenge */}
                    <div className="mar">
                    <Button
                        className="challenge-btn"
                        onClick={() => {
                            navigateTo("/explore");
                        }}
                    >
                        <span className="btn">Explore challenge</span>
                    </Button>
                    {/* Creative a challenge */}
                    <Button
                        className="creative-btn"
                        onClick={() => {
                            navigateTo("/publish");
                        }}
                    >
                        <span className="creative">Creative a challenge</span>
                    </Button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}