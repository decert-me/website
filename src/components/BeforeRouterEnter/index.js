import DefaultLayout from "@/containers/DefaultLayout";
import store from "@/redux/store";
import { Provider } from 'react-redux';

export default function BeforeRouterEnter() {
    return (
        <Provider store={store}>
            <DefaultLayout />
        </Provider>
    )
}