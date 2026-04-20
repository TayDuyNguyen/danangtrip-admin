import Lottie from "lottie-react";
import pageNotFoundAnimation from "@/assets/json/Bot Error 404.json";

const PageNotFound = () => {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Lottie animationData={pageNotFoundAnimation} loop autoplay className="w-full h-full" />
        </div>
    );
};

export default PageNotFound;