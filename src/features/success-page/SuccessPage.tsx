import {Link} from "react-router-dom";

const SuccessPage = () => {
  return <div className="flex flex-col items-center">
    <p className="text-4xl mt-[35vh] flex flex-col items-center">
      Карта была успешно создана!

      <Link
        to="/"
        className="text-4xl mt-8 px-4 py-2 rounded-xl dark:bg-dark-secondary"
      >
        Вернуться на главную
      </Link>
    </p>
  </div>
};

export default SuccessPage;
