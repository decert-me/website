import Index from "@/views/Index"
import Explore from "@/views/Explore"
import Publish from "@/views/Publish"
import Question from "@/views/Question";
import Challenge from "@/views/Challenge";
import Claim from "@/views/Claim";

const routes = [
    { 
      path: "/",
      element: <Index />,
    },
    { 
      path: "/explore",
      element: <Explore />,
    },
    { 
      path: "/publish",
      element: <Publish />,
    },
    { 
      path: "/quests/:questId",
      element: <Question />,
    },
    { 
      path: "/challenge/:questId",
      element: <Challenge />,
    },
    { 
      path: "/claim/:questId",
      element: <Claim />,
    }
    
];
export default routes