import Lottie from "lottie-react";
import errorAnimation from "@/assets/json/Page Error Animation.json";

const ErrorPage = () => {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Lottie animationData={errorAnimation} loop autoplay className="w-full h-full pt-10 pb-10" />
        </div>
    );
};

export default ErrorPage;