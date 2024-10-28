import {Link} from "react-router-dom";
import {useUser} from "shared/hooks/useUser";
import {ReactComponent as SignupSvg} from "./signup.svg";
import {ReactComponent as LoginSvg} from "./login.svg";

const MainPage = () => {
  const {user} = useUser();

  if (user) {
    return <div className="flex flex-col items-center">
      <Link
        to="/create-map"
        className="text-4xl mt-[40vh] px-6 py-4 rounded-xl dark:bg-dark-secondary"
      >
        Создать новую карту объекта →
      </Link>
    </div>;
  }

  return <>
    <h1 className="text-4xl text-center mt-10">
      Чтобы создать или изменить карту объекта, необходимо авторизоваться
    </h1>

    <div className="flex justify-between w-2/3 mx-auto mt-40">
      <Link to="signup" className="flex flex-col items-center w-1/3 p-10 rounded-2xl dark:bg-dark-secondary
        hover:scale-110 transition duration-200"
      >
        <SignupSvg className="w-full h-auto stroke-dark-text-secondary"/>
        <p className="text-2xl mt-10">Зарегистрироваться</p>
      </Link>
      <Link to="login" className="flex flex-col items-center w-1/3 p-10 rounded-2xl dark:bg-dark-secondary
       hover:scale-110 transition duration-200"
      >
        <LoginSvg className="w-full h-auto fill-dark-text-secondary"/>
        <p className="text-2xl mt-10">Войти в аккаунт</p>
      </Link>
    </div>
  </>;
};

export default MainPage;