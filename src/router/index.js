import Index from "@/views/Index"
import Explore from "@/views/Explore"
import Publish from "@/views/Publish"
import Question from "@/views/Question";
import Challenge from "@/views/Challenge";
import Claim from "@/views/Claim";
import User from "@/views/User/index";
import UserEdit from "@/views/User/edit";
import Cert from "@/views/Cert";
import Lesson from "@/views/Lesson";
import Search from "@/views/Search";

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
    },
    { 
      path: "/user",
      children: [
        {
          path: ":address",
          element: <User />
        },
        {
          path: "edit/:address",
          element: <UserEdit />
        }
      ]
    },
    { 
      path: "/:address",
      element: <Cert />,
    },
      { 
      path: "/lesson",
      element: <Lesson />,
    },
    { 
      path: "/search",
      element: <Search />,
    }
    
    
];
export default routes