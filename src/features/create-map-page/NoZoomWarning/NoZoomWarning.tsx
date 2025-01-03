import {useEffect, useState} from "react";
import {ReactComponent as CrossSvg} from "./cross.svg";

const NoZoomWarning = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupShown, setPopupShown] = useState(false);  // Чтобы показать попап только один раз

  useEffect(() => {
    const openPopup = () => setPopupOpen(true);

    window.addEventListener('resize', openPopup);
    return () => window.removeEventListener('resize', openPopup);
  });

  const closePopup = () => {
    setPopupOpen(false);
    setPopupShown(true);
  };

  if (!popupOpen || popupShown) {
    return <></>;
  }

  return (
    <div
      onClick={closePopup}
      className="absolute top-0 left-0 w-full h-full dark:bg-black/70 z-10"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/3 rounded-xl
        dark:bg-dark-secondary">
        <div className="flex flex-row justify-between mt-[2vh] mx-[2vh] items-center">
          <p className="text-[4vh]">Предупреждение</p>
          <CrossSvg className="w-[4vh] hover:cursor-pointer hover:dark:fill-gray-400 dark:fill-white"/>
        </div>
        <p className="text-[3vh] mt-[8vh] mx-[2vh]">
          Мы обнаружили, что вы используете масштабирование. Из-за этого, редактор может работать
          некорректно. Пожалуйста, верните масштаб на 100%.
        </p>
      </div>
    </div>
  );
};

export default NoZoomWarning;