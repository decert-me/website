import Index from "@/views/Index"
import Explore from "@/views/Explore"
import Publish from "@/views/Publish"
import Question from "@/views/Question/index";
import Challenge from "@/views/Challenge/index";
import Claim from "@/views/Claim";
import User from "@/views/User/index";
import UserEdit from "@/views/User/edit";
import Cert from "@/views/Cert";
import Lesson from "@/views/Lesson";
import Search from "@/views/Search";
import NotFound from "@/views/NotFound";

const routes = [
    { 
      path: "/",
      element: <Index />,
    },
    { 
      path: "/challenges",
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
      path: "/preview",
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
      key: Math.random().toString()
    },
    { 
      path: "/tutorials",
      element: <Lesson />,
    },
    { 
      path: "/vitae",
      element: <Search />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
    {
      path: '/404',
      element: <NotFound />,
    }
    
    
];
export default routes